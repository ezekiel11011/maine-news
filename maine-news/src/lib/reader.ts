import { createReader } from '@keystatic/core/reader';
import config from '../../keystatic.config';

// Force local storage and standard paths for the Reader.
// This is necessary because:
// 1. In production, keystatic.config.ts uses GitHub mode with a prefix (for Admin UI).
// 2. We want Reader to use Local mode (for performance/rate limits), which needs standard paths relative to CWD.
// 3. vercel.json ensures the files are present.
const readerConfig = {
    ...config,
    storage: {
        kind: 'local' as const,
    },
    collections: {
        ...config.collections,
        posts: {
            ...config.collections.posts,
            path: 'public/content/posts/*',
        },
        authors: {
            ...config.collections.authors,
            path: 'public/content/authors/*',
        },
        videos: {
            ...config.collections.videos,
            path: 'public/content/videos/*',
        }
    }
};

export const reader = createReader(process.cwd(), readerConfig as any);
