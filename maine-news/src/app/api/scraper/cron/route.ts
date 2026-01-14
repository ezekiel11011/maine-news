import { NextResponse } from 'next/server';
import { runScraper } from '../route';

// This endpoint is called by Vercel Cron daily
export async function GET(request: Request) {
    // Verify this is a Vercel Cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
