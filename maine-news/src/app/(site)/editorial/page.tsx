import Link from 'next/link';
import { db } from '@/db';
import { posts as dbPosts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import styles from './Editorial.module.css';

export const dynamic = 'force-dynamic';

export default async function EditorialPage() {
    const authoredPosts = await db.query.posts.findMany({
        where: eq(dbPosts.category, 'editorial'),
        orderBy: [desc(dbPosts.publishedDate)],
    });

    const formattedAuthored = authoredPosts.map(post => ({
        slug: post.slug,
        title: post.title,
        author: post.author,
        publishedDate: post.publishedDate.toISOString(),
    }));

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Editorial</h1>
                <p className={styles.subtitle}>Official editorials and institutional commentary.</p>
            </header>

            <div className={styles.list}>
                {formattedAuthored.length > 0 ? (
                    formattedAuthored.map((post) => (
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
                        <p>No editorials published yet.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
