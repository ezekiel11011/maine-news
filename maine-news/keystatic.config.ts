import { config, fields, collection } from '@keystatic/core';

const shouldUseGithub = process.env.NODE_ENV === 'production' && process.env.KEYSTATIC_GITHUB_CLIENT_ID && process.env.KEYSTATIC_GITHUB_CLIENT_SECRET;
// The prefix is required because the app is in a subdirectory 'maine-news/' 
// but the GitHub API sees the repository root.
const repoPathPrefix = shouldUseGithub ? 'maine-news/' : '';

export default config({
    storage: shouldUseGithub
        ? {
            kind: 'github',
            repo: {
                owner: 'ezekiel11011',
                name: 'maine-news',
            },
        }
        : {
            kind: 'local',
        },
    collections: {
        posts: collection({
            label: 'Posts',
            slugField: 'title',
            path: `${repoPathPrefix}src/content/posts/*`,
            format: { contentField: 'content' },
            schema: {
                title: fields.slug({ name: { label: 'Title' } }),
                image: fields.image({
                    label: 'Cover Image',
                    directory: 'public/images/posts',
                    publicPath: '/images/posts',
                }),
                author: fields.text({ label: 'Author' }),
                publishedDate: fields.date({ label: 'Published Date' }),
                category: fields.select({
                    label: 'Category',
                    options: [
                        { label: 'News', value: 'all' },
                        { label: 'Exclusives', value: 'exclusives' },
                        { label: 'Top Stories', value: 'top-stories' },
                        { label: 'Local', value: 'local' },
                        { label: 'National', value: 'national' },
                        { label: 'Politics', value: 'politics' },
                        { label: 'Opinion', value: 'opinion' },
                        { label: 'Health', value: 'health' },
                        { label: 'Sports', value: 'sports' },
                        { label: 'Weather', value: 'weather' },
                        { label: 'Entertainment', value: 'entertainment' },
                        { label: 'Business', value: 'business' },
                        { label: 'Crime', value: 'crime' },
                        { label: 'Lifestyle', value: 'lifestyle' },
                        { label: 'Obituaries', value: 'obituaries' },
                    ],
                    defaultValue: 'local'
                }),
                isNational: fields.checkbox({
                    label: 'Is National News?',
                    description: 'Check this if the news is national/not specific to Maine',
                    defaultValue: false
                }),
                sourceUrl: fields.text({ label: 'Source URL (Scraped Only)', description: 'Leave empty for original content' }),
                content: fields.markdoc({
                    label: 'Content',
                    options: {
                        image: {
                            directory: 'public/images/posts/content',
                            publicPath: '/images/posts/content',
                        }
                    }
                }),
            },
        }),
        authors: collection({
            label: 'Authors',
            slugField: 'name',
            path: `${repoPathPrefix}src/content/authors/*`,
            schema: {
                name: fields.slug({ name: { label: 'Name' } }),
                avatar: fields.image({
                    label: 'Avatar',
                    directory: 'public/images/authors',
                    publicPath: '/images/authors',
                }),
                bio: fields.text({ label: 'Bio', multiline: true }),
            }
        }),
        videos: collection({
            label: 'Videos',
            slugField: 'title',
            path: `${repoPathPrefix}src/content/videos/*`,
            schema: {
                title: fields.slug({ name: { label: 'Title' } }),
                videoUrl: fields.text({ label: 'Video URL' }),
                thumbnail: fields.text({ label: 'Thumbnail URL' }),
                duration: fields.text({ label: 'Duration (e.g. 05:20)' }),
                views: fields.text({ label: 'Views (e.g. 1.2k)' }),
                category: fields.select({
                    label: 'Category',
                    options: [
                        { label: 'Local', value: 'local' },
                        { label: 'Politics', value: 'politics' },
                        { label: 'Health', value: 'health' },
                        { label: 'Broadcast', value: 'broadcast' },
                        { label: 'Shorts', value: 'shorts' },
                        { label: 'Sports', value: 'sports' },
                        { label: 'Weather', value: 'weather' },
                        { label: 'Entertainment', value: 'entertainment' },
                    ],
                    defaultValue: 'local'
                }),
                publishedDate: fields.date({ label: 'Published Date' }),
                isLive: fields.checkbox({ label: 'Is Live Now?' }),
                description: fields.text({ label: 'Description', multiline: true }),
            }
        })
    },
});
