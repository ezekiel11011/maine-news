import Link from 'next/link';
import { reader } from '@/lib/reader';
import styles from './Latest.module.css';

export default async function LatestPage() {
    const [manualPosts, scrapedPosts] = await Promise.all([
        reader.collections.posts.all(),
        reader.collections.scraped.all(),
    ]);

    const allPosts = [
        ...manualPosts.map(p => ({ ...p, isOriginal: true })),
        ...scrapedPosts.map(p => ({ ...p, isOriginal: false }))
    ];

    // Sort by date descending
    const sortedPosts = allPosts.sort((a, b) => {
        const dateA = new Date((a.entry.publishedDate as string) || '').getTime();
        const dateB = new Date((b.entry.publishedDate as string) || '').getTime();
        return dateB - dateA;
    });

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Latest News</h1>
                <p className={styles.subtitle}>Breaking stories and recent updates from across Maine.</p>
            </header>

            <div className={styles.grid}>
                {sortedPosts.map((post) => (
                    <Link key={post.slug} href={`/article/${post.slug}`} className={styles.card}>
                        <div className={styles.meta}>
                            <span className={styles.category}>{post.entry.category as string}</span>
                            <span className={styles.date}>{post.entry.publishedDate as string}</span>
                        </div>
                        <h2 className={styles.headline}>{post.entry.title as string}</h2>
                        <p className={styles.author}>By {post.entry.author as string}</p>
                    </Link>
                ))}
            </div>
        </main>
    );
}
