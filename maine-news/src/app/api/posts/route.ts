import { NextResponse } from 'next/server';
import { reader } from '@/lib/reader';
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

            // Fallback: Keystatic
            const post = await reader.collections.posts.read(slug);
            if (post) {
                return NextResponse.json({
                    ...post,
                    slug,
                    content: (await (post.content as any)()).node
                });
            }

            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Fetch all for list/search
        const [keystaticPosts, authoredPosts] = await Promise.all([
            reader.collections.posts.all(),
            db.query.posts.findMany({
                orderBy: [desc(dbPosts.publishedDate)],
            })
        ]);

        const formattedKeystatic = keystaticPosts.map(post => ({
            id: post.slug,
            title: post.entry.title as string,
            slug: post.slug,
            image: (post.entry.image as unknown as string) || undefined,
            category: post.entry.category as string,
            publishedDate: post.entry.publishedDate as string || new Date().toISOString(),
            author: post.entry.author as string || 'Staff',
        }));

        const formattedAuthored = authoredPosts.map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            image: post.image || undefined,
            category: post.category,
            publishedDate: post.publishedDate.toISOString(),
            author: post.author,
        }));

        const allPosts = [...formattedAuthored, ...formattedKeystatic];

        // Sort by date descending
        allPosts.sort((a, b) => {
            const dateA = new Date(a.publishedDate).getTime();
            const dateB = new Date(b.publishedDate).getTime();
            return dateB - dateA;
        });

        return NextResponse.json({ posts: allPosts });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}
