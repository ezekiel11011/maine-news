import Link from 'next/link';
import { reader } from '@/lib/reader';
import MinuteDetail from '@/components/minute/MinuteDetail';
import { Metadata } from 'next';
import { db } from '@/db';
import { maineMinute, posts as dbPosts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

interface MinuteDatePageProps {
    params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: MinuteDatePageProps): Promise<Metadata> {
    const { date } = await params;

    // Check DB first for tagline
    const dbEntry = await db.query.maineMinute.findFirst({
        where: eq(maineMinute.date, date)
    });

    let tagline = '';
    if (dbEntry) {
        tagline = dbEntry.tagline as string;
    } else {
        const entry = await reader.collections.maineMinute.read(date);
        if (entry) tagline = (entry as any).tagline as string;
    }

    const dateStr = new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return {
        title: `The Maine Minute®️ | ${dateStr}`,
        description: tagline || `Maine news digest for ${dateStr}. Everything that matters. One minute.`
    };
}

export default async function MaineMinuteDatePage({ params }: MinuteDatePageProps) {
    const { date } = await params;

    // Check DB first
    const dbEntry = await db.query.maineMinute.findFirst({
        where: eq(maineMinute.date, date)
    });

    let tagline: string = '';
    let stories: any[] = [];
    let found = false;

    if (dbEntry) {
        found = true;
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
        const entry = await reader.collections.maineMinute.read(date);
        if (entry) {
            found = true;
            tagline = (entry as any).tagline as string;
            stories = await Promise.all(((entry as any).stories as any[]).map(async (s: any) => {
                const post = await reader.collections.posts.read(s.post);
                return {
                    title: (post as any)?.title || 'Untitled Story',
                    slug: s.post as string,
                    summary: s.summary as string
                };
            }));
        }
    }

    if (!found) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in">
                <div className="w-24 h-24 mb-8 grayscale opacity-20">
                    <img src="/maine-minutes.png" alt="Minute Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Minute Not Found</h1>
                <p className="text-dim text-xl max-w-md">The news digest for {date} could not be found. It may have been relocated or is yet to be published.</p>
                <Link href="/news/maine-minute" className="mt-12 text-accent font-bold uppercase tracking-widest hover:text-white transition-colors">
                    ← View Today&apos;s Minute
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
