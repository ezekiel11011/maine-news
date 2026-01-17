import { createReader } from '@keystatic/core/reader';
import config from '../../keystatic.config';

// Force local storage and standard paths for the Reader.
// The debug endpoint confirmed that files exist locally at /var/task/maine-news/src/content,
// so we should use Local mode to read them directly instead of checking GitHub (which returned 0).
const readerConfig = {
    ...config,
    storage: {
        kind: 'local' as const,
    },
    collections: {
        ...config.collections,
        posts: {
            ...config.collections.posts,
            path: 'src/content/posts/*',
        },
        authors: {
            ...config.collections.authors,
            path: 'src/content/authors/*',
        },
        videos: {
            ...config.collections.videos,
            path: 'src/content/videos/*',
        },
        maineMinute: {
            ...config.collections.maineMinute,
            path: 'src/content/maine-minute/*',
        }
    }
};

export const reader = createReader(process.cwd(), readerConfig as any);
