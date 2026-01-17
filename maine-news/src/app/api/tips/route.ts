import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { headline, details, isAnonymous } = data;

        if (!headline || !details) {
            return NextResponse.json({ error: 'Headline and details are required' }, { status: 400 });
        }

        // Create a secure tip directory if it doesn't exist
        const tipsDir = path.join(process.cwd(), 'secure-tips');
        try {
            await fs.access(tipsDir);
        } catch {
            await fs.mkdir(tipsDir);
        }

        const timestamp = new Date().getTime();
        const tipFileName = `tip-${timestamp}.json`;
        const tipPath = path.join(tipsDir, tipFileName);

        const tipContent = {
            id: timestamp,
            headline,
            details,
            isAnonymous,
            submittedAt: new Date().toISOString(),
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        };

        await fs.writeFile(tipPath, JSON.stringify(tipContent, null, 2), 'utf-8');

        console.log(`[SECURE TIP] Saved tip: ${tipFileName}`);

        return NextResponse.json({
            success: true,
            message: 'Tip submitted securely. Thank you for your intelligence.',
            tipId: timestamp
        });
    } catch (error) {
        console.error('Tip submission error:', error);
        return NextResponse.json({ error: 'Failed to submit tip securely' }, { status: 500 });
    }
}
