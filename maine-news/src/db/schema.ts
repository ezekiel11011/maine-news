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
    isNational: boolean('is_national').default(false).notNull(),
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

export const lotteryResults = pgTable('lottery_results', {
    id: uuid('id').defaultRandom().primaryKey(),
    game: text('game').notNull().unique(), // e.g., 'powerball', 'pick-3'
    numbers: text('numbers').notNull(), // Comma separated or JSON string
    extra: text('extra'), // Powerball or Bonus ball
    jackpot: text('jackpot'),
    drawDate: text('draw_date').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const maineMinute = pgTable('maine_minute', {
    id: uuid('id').defaultRandom().primaryKey(),
    date: text('date').notNull().unique(), // YYYY-MM-DD
    tagline: text('tagline').notNull().default('Everything that matters. One minute.'),
    stories: jsonb('stories').notNull().default([]), // Array of { postSlug: string, summary: string }
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
