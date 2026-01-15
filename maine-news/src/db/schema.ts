import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    image: text('image'),
    author: text('author').notNull().default('Staff'),
    publishedDate: timestamp('published_date').defaultNow().notNull(),
    category: text('category').notNull().default('local'),
    content: text('content').notNull(), // Markdown or HTML content
    sourceUrl: text('source_url'),
    isOriginal: boolean('is_original').default(true).notNull(),
    metadata: jsonb('metadata').default({}), // For extra fields like SEO tags
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const authors = pgTable('authors', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(),
    avatar: text('avatar'),
    bio: text('bio'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const videos = pgTable('videos', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    videoUrl: text('video_url').notNull(),
    thumbnail: text('thumbnail'),
    duration: text('duration'),
    views: text('views'),
    category: text('category').notNull().default('local'),
    publishedDate: timestamp('published_date').defaultNow().notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
