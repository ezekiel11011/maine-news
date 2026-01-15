import { NextResponse } from 'next/server';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { uploadToS3 } from '@/lib/s3';

export async function GET() {
    try {
        const allPosts = await db.query.posts.findMany({
            orderBy: [desc(posts.publishedDate)],
        });
        return NextResponse.json(allPosts);
    } catch (error) {
        console.error('Failed to fetch posts:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const slug = formData.get('slug') as string;
        const author = formData.get('author') as string;
        const category = formData.get('category') as string;
        const content = formData.get('content') as string;
        const publishedDate = formData.get('publishedDate') as string;
        const imageFile = formData.get('image') as File | null;

        let imageUrl = formData.get('imageUrl') as string | null;

        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            imageUrl = await uploadToS3(buffer, imageFile.name, imageFile.type);
        }

        const newPost = await db.insert(posts).values({
            title,
            slug,
            author: author || 'Staff',
            category: category || 'local',
            content,
            image: imageUrl,
            publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
            isOriginal: true,
        }).returning();

        return NextResponse.json(newPost[0]);
    } catch (error) {
        console.error('Failed to create post:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
