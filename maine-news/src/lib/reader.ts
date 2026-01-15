import { createReader } from '@keystatic/core/reader';
import config from '../../keystatic.config';

let readerConfig = config;

// In production, when using GitHub storage, we need to include the directory prefix
// because the GitHub API sees the entire repo, but our app is in a subdirectory.
// The Vercel Root Directory setting handles the build context, but not the GitHub API path.
if (process.env.NODE_ENV === 'production') {
    const repoPrefix = 'maine-news/';

    const newCollections = { ...config.collections };

    // Helper to patch collection path
    const patchPath = (collection: any, suffix: string) => ({
        ...collection,
        path: repoPrefix + suffix
    });

    if (newCollections.posts) newCollections.posts = patchPath(newCollections.posts, 'src/content/posts/*');
    if (newCollections.authors) newCollections.authors = patchPath(newCollections.authors, 'src/content/authors/*');
    if (newCollections.videos) newCollections.videos = patchPath(newCollections.videos, 'src/content/videos/*');

    readerConfig = {
        ...config,
        collections: newCollections
    };
}

export const reader = createReader(process.cwd(), readerConfig);
