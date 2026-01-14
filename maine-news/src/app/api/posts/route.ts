import { NextResponse } from 'next/server';
import { reader } from '@/lib/reader';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (slug) {
            const post = await reader.collections.posts.read(slug);
            if (!post) {
                return NextResponse.json({ error: 'Post not found' }, { status: 404 });
            }
            return NextResponse.json({
                ...post,
                slug,
                content: (await post.content()).node
            });
        }

        const posts = await reader.collections.posts.all();

        const formattedPosts = posts.map(post => ({
            id: post.slug,
            title: post.entry.title,
            slug: post.slug,
            image: post.entry.image,
            category: post.entry.category,
            publishedDate: post.entry.publishedDate,
            author: post.entry.author,
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
