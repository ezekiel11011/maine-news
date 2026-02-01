import Link from 'next/link';
import { db } from '@/db';
import { posts as dbPosts } from '@/db/schema';
import { desc } from 'drizzle-orm';
import styles from './Latest.module.css';

export const dynamic = 'force-dynamic';

export default async function LatestPage() {
    const authoredPosts = await db.query.posts.findMany({
        orderBy: [desc(dbPosts.publishedDate)],
    });

    const allPosts = authoredPosts.map(post => ({
        slug: post.slug,
        title: post.title,
        category: post.category,
        publishedDate: post.publishedDate.toISOString(),
        author: post.author,
    }));

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Latest News</h1>
                <p className={styles.subtitle}>Breaking stories and recent updates from across Maine.</p>
            </header>

            <div className={styles.grid}>
                {allPosts.map((post) => (
                    <Link key={post.slug} href={`/article/${post.slug}`} className={styles.card}>
                        <div className={styles.meta}>
                            <span className={styles.category}>{post.category}</span>
                            <span className={styles.date}>{new Date(post.publishedDate).toLocaleDateString()}</span>
                        </div>
                        <h2 className={styles.headline}>{post.title}</h2>
                        <p className={styles.author}>By {post.author}</p>
                    </Link>
                ))}
            </div>
        </main>
    );
}
