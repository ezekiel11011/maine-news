import Link from 'next/link';
import { reader } from '@/lib/reader';
import styles from './Latest.module.css';

export default async function LatestPage() {
    const posts = await reader.collections.posts.all();

    // Sort by date descending
    const sortedPosts = posts.sort((a, b) => {
        const dateA = new Date(a.entry.publishedDate || '');
        const dateB = new Date(b.entry.publishedDate || '');
        return dateB.getTime() - dateA.getTime();
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
                            <span className={styles.category}>{post.entry.category}</span>
                            <span className={styles.date}>{post.entry.publishedDate?.toString()}</span>
                        </div>
                        <h2 className={styles.headline}>{post.entry.title}</h2>
                        <p className={styles.author}>By {post.entry.author}</p>
                    </Link>
                ))}
            </div>
        </main>
    );
}
