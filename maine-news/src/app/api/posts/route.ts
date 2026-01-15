import { NextResponse } from 'next/server';
import { reader } from '@/lib/reader';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (slug) {
            const post = await reader.collections.posts.read(slug) ||
                await reader.collections.scraped.read(slug);
            if (!post) {
                return NextResponse.json({ error: 'Post not found' }, { status: 404 });
            }
            return NextResponse.json({
                ...post,
                slug,
                title: post.title as string,
                content: (await (post.content as any)()).node
            });
        }

        const [manualPosts, scrapedPosts] = await Promise.all([
            reader.collections.posts.all(),
            reader.collections.scraped.all(),
        ]);

        const formattedPosts = [...manualPosts, ...scrapedPosts].map(post => ({
            id: post.slug,
            title: post.entry.title as string,
            slug: post.slug,
            image: (post.entry.image as any),
            category: post.entry.category as string,
            publishedDate: post.entry.publishedDate as string,
            author: post.entry.author as string,
        }));

        // Sort by date descending
        formattedPosts.sort((a, b) => {
            const dateA = new Date(a.publishedDate || '').getTime();
            const dateB = new Date(b.publishedDate || '').getTime();
            return dateB - dateA;
        });

        return NextResponse.json({ posts: formattedPosts });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}
