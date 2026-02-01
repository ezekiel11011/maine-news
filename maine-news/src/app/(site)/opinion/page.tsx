import Link from 'next/link';
import { db } from '@/db';
import { posts as dbPosts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import styles from './Opinion.module.css';

export const dynamic = 'force-dynamic';

export default async function OpinionPage() {
    const authoredPosts = await db.query.posts.findMany({
        where: eq(dbPosts.category, 'opinion'),
        orderBy: [desc(dbPosts.publishedDate)],
    });

    const allOpinionPosts = authoredPosts.map(post => ({
        slug: post.slug,
        title: post.title,
        author: post.author,
        publishedDate: post.publishedDate.toISOString(),
    }));

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Opinion</h1>
                <p className={styles.subtitle}>Voices from across the state.</p>
            </header>

            <div className={styles.list}>
                {allOpinionPosts.length > 0 ? (
                    allOpinionPosts.map((post) => (
                        <Link key={post.slug} href={`/article/${post.slug}`} className={styles.card}>
                            <div className={styles.authorBadge}>
                                <div className={styles.avatarPlaceholder} />
                            </div>
                            <div className={styles.content}>
                                <h2 className={styles.headline}>{post.title}</h2>
                                <p className={styles.author}>{post.author}</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className={styles.empty}>
                        <p>No opinion pieces published yet.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
