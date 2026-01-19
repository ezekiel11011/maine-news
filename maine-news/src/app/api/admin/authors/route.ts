import { NextResponse } from 'next/server';
import { db } from '@/db';
import { authors } from '@/db/schema';
import { auth } from '@/auth';
import { uploadToS3 } from '@/lib/s3';

export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const bio = formData.get('bio') as string;
        let avatarUrl = formData.get('avatarUrl') as string;
        const imageFile = formData.get('image') as File | null;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Handle file upload if provided
        if (imageFile && imageFile.size > 0) {
            try {
                const buffer = Buffer.from(await imageFile.arrayBuffer());
                avatarUrl = await uploadToS3(buffer, imageFile.name, imageFile.type);
            } catch (uploadError) {
                console.error('S3 Upload failed:', uploadError);
                // Continue with existing avatarUrl if upload fails, or fail?
                // Let's fail for now to be clear.
                return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
            }
        }

        const [newAuthor] = await db.insert(authors).values({
            name,
            avatar: avatarUrl || null,
            bio: bio || null,
        }).returning();

        return NextResponse.json(newAuthor);
    } catch (error) {
        console.error('Failed to create author:', error);
        return NextResponse.json({ error: 'Failed to create author' }, { status: 500 });
    }
}
