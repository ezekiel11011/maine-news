import { Metadata } from 'next';
import SectionList from '@/components/home/SectionList';
import { reader } from '@/lib/reader';

export const metadata: Metadata = {
    title: 'Maine Weather | Maine News Today',
    description: 'Latest weather updates, forecasts, and storm alerts for the Pine Tree State.',
};

export default async function WeatherPage() {
    const [manualPosts, scrapedPosts] = await Promise.all([
        reader.collections.posts.all(),
        reader.collections.scraped.all(),
    ]);

    const allPostsMerged = [...manualPosts, ...scrapedPosts];

    const weatherPosts = allPostsMerged
        .filter(post => (post.entry.category as string) === 'weather')
        .map(post => ({
            id: post.slug,
            title: post.entry.title as string,
            slug: post.slug,
            image: (post.entry.image as any) ?? undefined,
            category: post.entry.category as string,
            publishedDate: (post.entry.publishedDate as string) ?? new Date().toISOString(),
            author: post.entry.author as string,
        }))
        .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

    return (
        <main className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', color: 'var(--color-accent)' }}>Maine Weather</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto' }}>
                    Stay ahead of the storm with real-time updates and expert forecasting from across the state.
                </p>
            </div>

            {weatherPosts.length > 0 ? (
                <SectionList title="Latest Weather Reports" stories={weatherPosts} />
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', background: '#111', borderRadius: '12px' }}>
                    <p style={{ opacity: 0.5 }}>Currently tracking fair skies. Check back soon for new weather updates.</p>
                </div>
            )}
        </main>
    );
}
