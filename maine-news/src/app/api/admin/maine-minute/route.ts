import { NextResponse } from 'next/server';
import { db } from '@/db';
import { maineMinute } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const allMinutes = await db.query.maineMinute.findMany({
            orderBy: [desc(maineMinute.date)],
        });
        return NextResponse.json(allMinutes);
    } catch (error) {
        console.error('Failed to fetch Maine Minutes:', error);
        return NextResponse.json({ error: 'Failed to fetch Maine Minutes' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { date, tagline, stories } = body;

        if (!date) return NextResponse.json({ error: 'Date is required' }, { status: 400 });

        // Check if exists
        const existing = await db.query.maineMinute.findFirst({
            where: eq(maineMinute.date, date),
        });

        if (existing) {
            const updated = await db.update(maineMinute)
                .set({ tagline, stories })
                .where(eq(maineMinute.date, date))
                .returning();
            return NextResponse.json(updated[0]);
        } else {
            const created = await db.insert(maineMinute)
                .values({ date, tagline, stories })
                .returning();
            return NextResponse.json(created[0]);
        }
    } catch (error) {
        console.error('Failed to save Maine Minute:', error);
        return NextResponse.json({ error: 'Failed to save Maine Minute' }, { status: 500 });
    }
}
