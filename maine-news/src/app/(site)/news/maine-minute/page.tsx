import Link from 'next/link';
import { reader } from '@/lib/reader';
import MinuteDetail from '@/components/minute/MinuteDetail';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/db';
import { maineMinute, posts as dbPosts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    // Check DB first
    const dbMinutes = await db.query.maineMinute.findMany({
        orderBy: [desc(maineMinute.date)],
        limit: 1
    });

    let latestDate = '';
    let latestTagline = '';

    if (dbMinutes.length > 0) {
        latestDate = dbMinutes[0].date;
        latestTagline = dbMinutes[0].tagline as string;
    } else {
        const minutes = await reader.collections.maineMinute.all();
        const sorted = minutes.sort((a, b) => b.slug.localeCompare(a.slug))[0];
        if (sorted) {
            latestDate = sorted.slug;
            latestTagline = (sorted.entry as any).tagline as string;
        }
    }

    if (!latestDate) return { title: 'The Maine Minute®️' };

    const dateStr = new Date(latestDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return {
        title: `The Maine Minute®️ | ${dateStr}`,
        description: latestTagline || 'Your daily digest of Maine news.',
        openGraph: {
            title: `The Maine Minute®️ | ${dateStr}`,
            description: latestTagline,
            type: 'website'
        }
    };
}

// 1. Try to fetch Lottery Results (Non-blocking)
import { lotteryResults } from '@/db/schema';

export default async function MaineMinuteTodayPage() {
    let date: string = new Date().toISOString().split('T')[0];
    let tagline: string = 'Everything that matters. One minute.';
    let stories: any[] = [];
    let lotteryData: any = {};

    try {
        const lottoGames = ['powerball', 'megabucks', 'gimme-5', 'pic-3', 'pic-4'];
        const results = await Promise.all(
            lottoGames.map(game => db.query.lotteryResults.findFirst({
                where: eq(lotteryResults.game, game)
            }).catch(() => null))
        );

        results.forEach(res => {
            if (res) {
                lotteryData[res.game] = {
                    numbers: res.numbers,
                    extra: res.extra,
                    jackpot: res.jackpot,
                    drawDate: res.drawDate
                };
            }
        });
    } catch (e) {
        console.warn('Failed to fetch lottery results:', e);
    }

    // 2. Check for manual override in DB first
    let isManualEntry = false;
    let dbMinutes: any[] = [];

    try {
        dbMinutes = await db.query.maineMinute.findMany({
            orderBy: [desc(maineMinute.date)],
            limit: 1
        });
        isManualEntry = dbMinutes.length > 0 && dbMinutes[0].date === date;
    } catch (e) {
        console.warn('DB Minute fetch failed, using auto-gen only:', e);
    }

    if (isManualEntry) {
        // Render Manual Entry
        const dbEntry = dbMinutes[0];
        date = dbEntry.date;
        tagline = dbEntry.tagline as string;
        try {
            stories = await Promise.all((dbEntry.stories as any[]).map(async (s: any) => {
                let title = 'Untitled Story';
                // Try Keystatic first
                try {
                    const post = await reader.collections.posts.read(s.postSlug);
                    if (post) title = post.title as string;
                } catch (err) { /* ignore */ }

                // Try DB if still untitled
                if (title === 'Untitled Story') {
                    try {
                        const dbPost = await db.query.posts.findFirst({
                            where: eq(dbPosts.slug, s.postSlug)
                        });
                        if (dbPost) title = dbPost.title as string;
                    } catch (err) { /* ignore */ }
                }
                return { title, slug: s.postSlug, summary: s.summary };
            }));
        } catch (e) {
            console.error('Error hydrating manual stories:', e);
            stories = [];
        }
    }

    // 3. Auto-Generate if Manual Entry is missing or failed
    if (stories.length === 0) {
        let allPosts: any[] = [];
        try {
            const [keystaticPosts, authoredPosts] = await Promise.all([
                reader.collections.posts.all(),
                db.query.posts.findMany({
                    orderBy: [desc(dbPosts.publishedDate)],
                })
            ]);

            const formattedKeystatic = keystaticPosts.map(post => ({
                title: post.entry.title as string,
                slug: post.slug,
                publishedDate: post.entry.publishedDate as string || new Date().toISOString(),
                category: (post.entry.category as string) || 'General'
            }));

            const formattedAuthored = authoredPosts.map(post => ({
                title: post.title,
                slug: post.slug,
                publishedDate: post.publishedDate.toISOString(),
                category: (post.category as string) || 'General'
            }));

            allPosts = [...formattedAuthored, ...formattedKeystatic];
        } catch (e) {
            console.error('Failed to fetch posts for auto-gen:', e);
        }

        // Filter last 24 hours for the daily digest
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - 24);

        const recentPosts = allPosts
            .filter(post => new Date(post.publishedDate) >= cutoff)
            .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

        const seenSlugs = new Set<string>();
        const dedupedPosts = recentPosts.filter(post => {
            if (seenSlugs.has(post.slug)) return false;
            seenSlugs.add(post.slug);
            return true;
        });

        if (dedupedPosts.length > 0) {
            stories = dedupedPosts.map(post => ({
                title: post.title,
                slug: post.slug,
                summary: '',
                category: post.category
            }));
            tagline = `Last 24 hours. ${dedupedPosts.length} headlines in under a minute.`;
        }
    }

    if (stories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in">
                <div className="w-24 h-24 mb-8 grayscale opacity-20">
                    <img src="/maine-minutes.png" alt="Minute Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Quiet Day in Maine</h1>
                <p className="text-dim text-xl max-w-md">No major stories found for today yet. Check back later.</p>
                <Link href="/" className="mt-12 text-accent font-bold uppercase tracking-widest hover:text-white transition-colors">
                    ← Back to Newsroom
                </Link>
            </div>
        );
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": ["NewsArticle", "CollectionPage"],
        "headline": `The Maine Minute®️ | ${date}`,
        "description": tagline,
        "datePublished": date,
        "publisher": {
            "@type": "Organization",
            "name": "Maine News Now"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <MinuteDetail
                date={date}
                tagline={tagline}
                stories={stories}
                lottery={lotteryData}
            />
        </>
    );
}
