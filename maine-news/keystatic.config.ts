import { config, fields, collection } from '@keystatic/core';

export default config({
    storage: (process.env.NODE_ENV === 'production' && process.env.KEYSTATIC_GITHUB_CLIENT_ID && process.env.KEYSTATIC_GITHUB_CLIENT_SECRET)
        ? {
            kind: 'github',
            repo: {
                owner: 'ezekiel11011',
                name: 'maine-news',
            },
            pathPrefix: 'maine-news',
        }
        : {
            kind: 'local',
        },
    collections: {
        posts: collection({
            label: 'Posts',
            slugField: 'title',
            path: 'src/content/posts/*',
            format: { contentField: 'content' },
            schema: {
                title: fields.slug({ name: { label: 'Title' } }),
                image: fields.image({
                    label: 'Cover Image',
                    directory: 'public/images/posts',
                    publicPath: '/images/posts',
                }),
                author: fields.text({ label: 'Author' }), // Linking to authors collection could be better, keeping simple for now
                publishedDate: fields.date({ label: 'Published Date' }),
                category: fields.select({
                    label: 'Category',
                    options: [
                        { label: 'Top Stories', value: 'top-stories' },
                        { label: 'Local', value: 'local' },
                        { label: 'National', value: 'national' },
                        { label: 'Politics', value: 'politics' },
                        { label: 'Opinion', value: 'opinion' },
                        { label: 'Health', value: 'health' },
                        { label: 'Sports', value: 'sports' },
                        { label: 'Weather', value: 'weather' },
                        { label: 'Entertainment', value: 'entertainment' },
                    ],
                    defaultValue: 'local'
                }),
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
            path: 'src/content/authors/*',
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
            path: 'src/content/videos/*',
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
