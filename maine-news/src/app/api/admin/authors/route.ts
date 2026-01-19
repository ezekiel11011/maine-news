import { NextResponse } from 'next/server';
import { db } from '@/db';
import { authors } from '@/db/schema';
import { auth } from '@/auth';

export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await request.json();

        if (!data.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const [newAuthor] = await db.insert(authors).values({
            name: data.name,
            avatar: data.avatar || null,
            bio: data.bio || null,
        }).returning();

        return NextResponse.json(newAuthor);
    } catch (error) {
        console.error('Failed to create author:', error);
        return NextResponse.json({ error: 'Failed to create author' }, { status: 500 });
    }
}
