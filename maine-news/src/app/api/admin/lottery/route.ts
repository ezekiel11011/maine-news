import { NextResponse } from 'next/server';
import { db } from '@/db';
import { lotteryResults } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const session = await auth();
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, numbers, extra, jackpot, drawDate } = body;

        if (!id) return new NextResponse("Missing ID", { status: 400 });

        await db.update(lotteryResults)
            .set({
                numbers,
                extra: extra || null,
                jackpot: jackpot || null,
                drawDate,
                updatedAt: new Date()
            })
            .where(eq(lotteryResults.id, id));

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
