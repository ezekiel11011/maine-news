import MinuteDetail from '@/components/minute/MinuteDetail';
import { Metadata } from 'next';
import { db } from '@/db';
import { posts as dbPosts, lotteryResults } from '@/db/schema';
import { desc, eq, gte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const recentPosts = await getRecentPosts();
    const count = recentPosts.length;

    return {
        title: 'The Maine Minute®️ | Last 24 Hours',
        description: count
            ? `Last 24 hours. ${count} headlines in under a minute.`
            : 'Condensed Maine headlines from the last 24 hours.',
        openGraph: {
            title: 'The Maine Minute®️ | Last 24 Hours',
            description: count
                ? `Last 24 hours. ${count} headlines in under a minute.`
                : 'Condensed Maine headlines from the last 24 hours.',
            type: 'website'
        }
    };
}

function stripContent(content: string): string {
    return content
        .replace(/<[^>]*>/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[`*_>#-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function buildSummary(content: string, title: string): string {
    const cleaned = stripContent(content);
    if (!cleaned) return '';

    const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    let summary = sentences.slice(0, 2).join(' ').trim();
    if (!summary) summary = cleaned.slice(0, 240).trim();
    if (summary.length > 260) summary = `${summary.slice(0, 257).trim()}...`;

    if (summary.toLowerCase() === title.trim().toLowerCase()) {
        return '';
    }

    return summary;
}

async function getRecentPosts() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return db.query.posts.findMany({
        where: gte(dbPosts.publishedDate, cutoff),
        orderBy: [desc(dbPosts.publishedDate)],
    });
}

export default async function MaineMinuteTodayPage() {
    let date: string = new Date().toISOString().split('T')[0];
    let tagline: string = 'Condensed headlines from the last 24 hours.';
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

    const recentPosts = await getRecentPosts();
    if (recentPosts.length > 0) {
        stories = recentPosts.map(post => ({
            title: post.title,
            slug: post.slug,
            summary: buildSummary(post.content || '', post.title),
            category: post.category,
            publishedDate: post.publishedDate.toISOString(),
        }));
        tagline = `Last 24 hours. ${recentPosts.length} headlines in under a minute.`;
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
