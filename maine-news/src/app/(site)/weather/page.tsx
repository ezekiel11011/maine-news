import { Metadata } from 'next';
import SectionList from '@/components/home/SectionList';
import { reader } from '@/lib/reader';
import { db } from '@/db';
import { posts as dbPosts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export const metadata: Metadata = {
    title: 'Maine Weather | Maine News Today',
    description: 'Latest weather updates, forecasts, and storm alerts for the Pine Tree State.',
};

export const dynamic = 'force-dynamic';

export default async function WeatherPage() {
    const [keystaticPosts, authoredPosts] = await Promise.all([
        reader.collections.posts.all(),
        db.query.posts.findMany({
            where: eq(dbPosts.category, 'weather'),
            orderBy: [desc(dbPosts.publishedDate)],
        })
    ]);

    const formattedKeystatic = keystaticPosts
        .filter(post => post.entry.category === 'weather')
        .map(post => ({
            id: post.slug,
            title: post.entry.title as string,
            slug: post.slug,
            image: (post.entry.image as unknown as string) ?? undefined,
            category: post.entry.category as string,
            publishedDate: post.entry.publishedDate as string || new Date().toISOString(),
            author: post.entry.author as string || 'Staff',
        }));

    const formattedAuthored = authoredPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        image: post.image || undefined,
        category: post.category,
        publishedDate: post.publishedDate.toISOString(),
        author: post.author,
    }));

    const allWeatherPosts = [...formattedAuthored, ...formattedKeystatic];

    // Sort by date descending
    allWeatherPosts.sort((a, b) => {
        const dateA = new Date(a.publishedDate).getTime();
        const dateB = new Date(b.publishedDate).getTime();
        return dateB - dateA;
    });

    return (
        <main className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', color: 'var(--color-accent)' }}>Maine Weather</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto' }}>
                    Stay ahead of the storm with real-time updates and expert forecasting from across the state.
                </p>
            </div>

            {allWeatherPosts.length > 0 ? (
                <SectionList title="Latest Weather Reports" stories={allWeatherPosts} />
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', background: '#111', borderRadius: '12px' }}>
                    <p style={{ opacity: 0.5 }}>Currently tracking fair skies. Check back soon for new weather updates.</p>
                </div>
            )}
        </main>
    );
}
