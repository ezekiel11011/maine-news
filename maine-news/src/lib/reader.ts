import { createReader } from '@keystatic/core/reader';
import config from '../../keystatic.config';

// Force local storage mode to ensure we read from the filesystem
// This is much faster than GitHub API and avoids rate limits.
// We rely on vercel.json "includeFiles" to ensure content is available on the server.
const readerConfig = {
    ...config,
    storage: {
        kind: 'local' as const,
    }
};

export const reader = createReader(process.cwd(), readerConfig);
