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
    // Check DB first
    const dbMinutes = await db.query.maineMinute.findMany({
        orderBy: [desc(maineMinute.date)],
        limit: 1
    });

    let entry: any = null;
    let date: string = '';
    let tagline: string = '';
    let stories: any[] = [];

    if (dbMinutes.length > 0) {
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
        // Fallback: Keystatic
        const minutes = await reader.collections.maineMinute.all();
        if (minutes.length > 0) {
            const sorted = minutes.sort((a, b) => b.slug.localeCompare(a.slug))[0];
            date = sorted.slug;
            tagline = (sorted.entry as any).tagline as string;
            stories = await Promise.all(((sorted.entry as any).stories as any[]).map(async (s: any) => {
                const post = await reader.collections.posts.read(s.post);
                return {
                    title: (post as any)?.title || 'Untitled Story',
                    slug: s.post as string,
                    summary: s.summary as string
                };
            }));
        }
    }

    if (!date) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in">
                <div className="w-24 h-24 mb-8 grayscale opacity-20">
                    <img src="/maine-minutes.png" alt="Minute Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">The Maine Minute®️</h1>
                <p className="text-dim text-xl max-w-md">Our daily news digest is coming soon. Check back later today for everything that matters, in under a minute.</p>
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
