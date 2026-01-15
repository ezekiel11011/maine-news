import { createReader } from '@keystatic/core/reader';
import config from '../../keystatic.config';

const readerConfig = {
    ...config,
    storage: { kind: 'local' }
} as any;

export const reader = createReader(process.cwd(), readerConfig);
