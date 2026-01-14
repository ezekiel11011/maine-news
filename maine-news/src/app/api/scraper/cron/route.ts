import { NextResponse } from 'next/server';

// This endpoint is called by Vercel Cron daily
export async function GET(request: Request) {
    // Verify this is a Vercel Cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Call the main scraper endpoint with save=true
        const scraperUrl = new URL('/api/scraper', request.url);
        scraperUrl.searchParams.set('key', process.env.SCRAPER_API_KEY || '');
        scraperUrl.searchParams.set('save', 'true');

        console.log(`[CRON] Triggering scraper at: ${scraperUrl.pathname}`);

        const response = await fetch(scraperUrl.toString(), { cache: 'no-store' });

        // Handle non-OK responses or non-JSON responses
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[CRON] Scraper API failed with status ${response.status}:`, errorText.substring(0, 200));
            return NextResponse.json({
                error: 'Scraper API returned an error',
                status: response.status,
                preview: errorText.substring(0, 500)
            }, { status: response.status });
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('[CRON] Scraper API returned non-JSON response:', text.substring(0, 200));
            return NextResponse.json({
                error: 'Expected JSON but received HTML/Text. This often happens if the route 404s or crashes.',
                preview: text.substring(0, 500)
            }, { status: 500 });
        }

        const data = await response.json();

        console.log(`[CRON] Scraper ran successfully: ${data.count} stories found, ${data.saved} saved`);

        return NextResponse.json({
            success: true,
            message: 'Scraper executed successfully',
            ...data
        });

    } catch (error) {
        console.error('[CRON] Scraper failed:', error);
        return NextResponse.json({
            error: 'Cron execution failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
