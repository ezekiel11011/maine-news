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

export default async function MaineMinuteTodayPage() {
    // 1. Check for manual override in DB first
    const dbMinutes = await db.query.maineMinute.findMany({
        orderBy: [desc(maineMinute.date)],
        limit: 1
    });

    const isManualEntry = dbMinutes.length > 0 && dbMinutes[0].date === new Date().toISOString().split('T')[0];

    let date: string = new Date().toISOString().split('T')[0];
    let tagline: string = 'Everything that matters. One minute.';
    let stories: any[] = [];

    if (isManualEntry) {
        // Render Manual Entry
        const dbEntry = dbMinutes[0];
        date = dbEntry.date;
        tagline = dbEntry.tagline as string;
        stories = await Promise.all((dbEntry.stories as any[]).map(async (s: any) => {
            let title = 'Untitled Story';
            const post = await reader.collections.posts.read(s.postSlug);
            if (post) {
                title = post.title as string;
            } else {
                const dbPost = await db.query.posts.findFirst({
                    where: eq(dbPosts.slug, s.postSlug)
                });
                if (dbPost) title = dbPost.title as string;
            }
            return { title, slug: s.postSlug, summary: s.summary };
        }));
    } else {
        // 2. Auto-Generate Digest from Last 24 Hours
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
        }));

        const formattedAuthored = authoredPosts.map(post => ({
            title: post.title,
            slug: post.slug,
            publishedDate: post.publishedDate.toISOString(),
        }));

        const allPosts = [...formattedAuthored, ...formattedKeystatic];

        // Filter last 24h
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const recentPosts = allPosts.filter(post =>
            new Date(post.publishedDate) >= yesterday
        ).sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
            .slice(0, 10); // Take top 10 to ensure we have content

        if (recentPosts.length > 0) {
            stories = recentPosts.map(post => ({
                title: post.title,
                slug: post.slug,
                summary: post.title // Use title as summary for auto-generated
            }));
            tagline = `Live daily digest. ${recentPosts.length} stories from the last 24 hours.`;
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
            />
        </>
    );
}
