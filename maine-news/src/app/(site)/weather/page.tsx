import { Metadata } from 'next';
import SectionList from '@/components/home/SectionList';
import { reader } from '@/lib/reader';
import { db } from '@/db';
import { posts as dbPosts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export const metadata: Metadata = {
    title: 'Maine Weather | Maine News Now',
    description: 'Latest weather updates, forecasts, and storm alerts for the Pine Tree State.',
};

export const dynamic = 'force-dynamic';

const CloudSunIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-accent)' }}>
        <path d="M12 2v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="M20 12h2" /><path d="m19.07 4.93-1.41 1.41" /><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" /><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />
    </svg>
);

export default async function WeatherPage() {
    // ... existing fetch logic ...
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

    allWeatherPosts.sort((a, b) => {
        const dateA = new Date(a.publishedDate).getTime();
        const dateB = new Date(b.publishedDate).getTime();
        return dateB - dateA;
    });

    return (
        <main className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ marginBottom: '3rem' }}>
                <div style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    borderRadius: '24px',
                    padding: '3rem',
                    color: 'white',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '2rem',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8, marginBottom: '0.5rem' }}>
                            Bangor, Maine
                        </div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '2rem' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                            <CloudSunIcon />
                            <div style={{ fontSize: '5rem', fontWeight: '700', lineHeight: 1 }}>24°</div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>Partly Cloudy</div>
                                <div style={{ opacity: 0.8 }}>H: 32° L: 12°</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', color: 'var(--color-accent)', marginBottom: '1rem' }}>Latest Weather Stories</h2>
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
