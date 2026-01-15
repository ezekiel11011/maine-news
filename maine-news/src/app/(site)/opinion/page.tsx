import Link from 'next/link';
import { reader } from '@/lib/reader';
import styles from './Opinion.module.css';

export default async function OpinionPage() {
    const [manualPosts, scrapedPosts] = await Promise.all([
        reader.collections.posts.all(),
        reader.collections.scraped.all(),
    ]);

    const allPosts = [...manualPosts, ...scrapedPosts];

    // Filter for Opinion and sort by date
    const opinionPosts = allPosts
        .filter(post => (post.entry.category as string) === 'opinion')
        .sort((a, b) => {
            const dateA = new Date((a.entry.publishedDate as string) || '').getTime();
            const dateB = new Date((b.entry.publishedDate as string) || '').getTime();
            return dateB - dateA;
        });

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Opinion</h1>
                <p className={styles.subtitle}>Voices from across the state.</p>
            </header>

            <div className={styles.list}>
                {opinionPosts.length > 0 ? (
                    opinionPosts.map((post) => (
                        <Link key={post.slug} href={`/article/${post.slug}`} className={styles.card}>
                            <div className={styles.authorBadge}>
                                {/* Placeholder for author image if available */}
                                <div className={styles.avatarPlaceholder} />
                            </div>
                            <div className={styles.content}>
                                <h2 className={styles.headline}>{post.entry.title as string}</h2>
                                <p className={styles.author}>By {post.entry.author as string}</p>
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
