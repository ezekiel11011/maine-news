import { NextResponse } from 'next/server';
import { db } from '@/db';
import { posts as dbPosts } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (slug) {
            // Priority: Database
            const dbPost = await db.query.posts.findFirst({
                where: (posts, { eq }) => eq(posts.slug, slug),
            });

            if (dbPost) {
                return NextResponse.json({
                    ...dbPost,
                    publishedDate: dbPost.publishedDate.toISOString(),
                    createdAt: dbPost.createdAt.toISOString(),
                });
            }

            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Fetch all for list/search
        const authoredPosts = await db.query.posts.findMany({
            orderBy: [desc(dbPosts.publishedDate)],
        });

        const formattedPosts = authoredPosts.map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            image: post.image || undefined,
            category: post.category,
            isNational: post.isNational || false,
            publishedDate: post.publishedDate.toISOString(),
            author: post.author,
            isOriginal: post.isOriginal
        }));

        return NextResponse.json({ posts: formattedPosts });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}
