import { createReader } from '@keystatic/core/reader';
import config from '../../keystatic.config';

// Force local mode for the reader on Vercel/server-side.
// We also MUST remove pathPrefix because in local mode, 
// the reader is already running inside the 'maine-news' directory.
const readerConfig = {
    ...config,
    storage: {
        ...config.storage,
        kind: 'local',
    },
} as any;

// Delete pathPrefix if it exists to avoid looking for 'maine-news/src/content/...'
if (readerConfig.storage.pathPrefix) {
    delete readerConfig.storage.pathPrefix;
}

export const reader = createReader(process.cwd(), readerConfig);
