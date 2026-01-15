import { createReader } from '@keystatic/core/reader';
import config from '../../keystatic.config';

// Force local storage mode to ensure we read from the filesystem
// This avoids path mismatches between repo root (GitHub API) and project root (filesystem)
const readerConfig = {
    ...config,
    storage: {
        kind: 'local' as const,
    }
};

export const reader = createReader(process.cwd(), readerConfig);
