import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { posts } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const post = await db.query.posts.findFirst({
            where: eq(posts.id, id),
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error('Failed to fetch post:', error);
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        await db.delete(posts).where(eq(posts.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete post:', error);
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const body = await request.json();

        // Prepare data for update
        const updateData: any = { ...body };
        if (updateData.publishedDate) {
            updateData.publishedDate = new Date(updateData.publishedDate);
        }

        const updatedPost = await db.update(posts)
            .set(updateData)
            .where(eq(posts.id, id))
            .returning();

        return NextResponse.json(updatedPost[0]);
    } catch (error) {
        console.error('Failed to update post:', error);
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}
