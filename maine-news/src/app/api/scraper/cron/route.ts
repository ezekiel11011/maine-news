import { NextResponse } from 'next/server';
import { runScraper } from '../route';

// This endpoint is called by Vercel Cron daily
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const authKey = searchParams.get('key');
    const authHeader = request.headers.get('authorization');

    // Allow Vercel CRON_SECRET or manual SCRAPER_API_KEY
    const isAuthorized =
        (authHeader === `Bearer ${process.env.CRON_SECRET}`) ||
        (authKey === process.env.SCRAPER_API_KEY);

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log(`[CRON] Starting direct scraper execution...`);

        // Execute scraper logic directly as a function
        // This avoids 401/Network errors associated with Vercel Deployment Protection
        const result = await runScraper({
            save: true,
            includeNational: true
        });

        console.log(`[CRON] Scraper finished: ${result.count} stories found, ${result.saved} saved`);

        return NextResponse.json({
            source: 'direct_execution',
            ...result
        });

    } catch (error) {
        console.error('[CRON] Direct Scraper execution failed:', error);
        return NextResponse.json({
            error: 'Cron execution failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
