import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';
import dotenv from 'dotenv';

const posts = pgTable('posts', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    image: text('image'),
    author: text('author').notNull().default('Staff'),
    publishedDate: timestamp('published_date').defaultNow().notNull(),
    category: text('category').notNull().default('local'),
    content: text('content').notNull(),
    sourceUrl: text('source_url'),
    isOriginal: boolean('is_original').default(true).notNull(),
    isNational: boolean('is_national').default(false).notNull(),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error('DATABASE_URL is required to run this migration.');
    process.exit(1);
}

const db = drizzle(neon(databaseUrl), { schema: { posts } });
const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
const shouldDelete = process.argv.includes('--delete');

const knownKeys = new Set([
    'title',
    'image',
    'author',
    'publishedDate',
    'category',
    'isNational',
    'sourceUrl',
    'isOriginal',
]);

function chunkArray(items, chunkSize) {
    const chunks = [];
    for (let i = 0; i < items.length; i += chunkSize) {
        chunks.push(items.slice(i, i + chunkSize));
    }
    return chunks;
}

function normalizeDate(value) {
    const parsed = new Date(value || '');
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toRecord(filePath, raw) {
    const slug = path.basename(filePath, '.mdoc');
    const { data, content } = matter(raw);
    const title = data.title || slug;
    const publishedDate = normalizeDate(data.publishedDate);
    const category = data.category || 'local';
    const author = data.author || 'Staff';
    const sourceUrl = data.sourceUrl || null;
    const isOriginal = typeof data.isOriginal === 'boolean'
        ? data.isOriginal
        : !sourceUrl;
    const isNational = typeof data.isNational === 'boolean'
        ? data.isNational
        : false;

    const metadata = Object.keys(data).reduce((acc, key) => {
        if (!knownKeys.has(key)) acc[key] = data[key];
        return acc;
    }, {});

    return {
        slug,
        title,
        image: data.image ?? null,
        author,
        publishedDate,
        category,
        content: content.trim(),
        sourceUrl,
        isOriginal,
        isNational,
        metadata,
        __filePath: filePath,
    };
}

async function run() {
    const files = (await fs.readdir(postsDir)).filter(file => file.endsWith('.mdoc'));
    if (files.length === 0) {
        console.log('No .mdoc files found.');
        return;
    }

    const records = [];
    for (const file of files) {
        const filePath = path.join(postsDir, file);
        const raw = await fs.readFile(filePath, 'utf-8');
        records.push(toRecord(filePath, raw));
    }

    const chunks = chunkArray(records, 75);
    let migrated = 0;

    for (const chunk of chunks) {
        const values = chunk.map(({ __filePath, ...record }) => record);
        await db.insert(posts)
            .values(values)
            .onConflictDoUpdate({
                target: posts.slug,
                set: {
                    title: sql`excluded.title`,
                    image: sql`excluded.image`,
                    author: sql`excluded.author`,
                    publishedDate: sql`excluded.published_date`,
                    category: sql`excluded.category`,
                    content: sql`excluded.content`,
                    sourceUrl: sql`excluded.source_url`,
                    isOriginal: sql`excluded.is_original`,
                    isNational: sql`excluded.is_national`,
                    metadata: sql`excluded.metadata`,
                }
            });

        migrated += values.length;

        if (shouldDelete) {
            await Promise.all(chunk.map(record => fs.unlink(record.__filePath)));
        }
    }

    console.log(`Migrated ${migrated} posts into the database.`);
    if (shouldDelete) {
        console.log('Deleted source .mdoc files after migration.');
    }
}

run().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
});
