import Link from 'next/link';
import { reader } from '@/lib/reader';
import { db } from '@/db';
import { posts as dbPosts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import styles from './Editorial.module.css';

export const dynamic = 'force-dynamic';

export default async function EditorialPage() {
    const [keystaticPosts, authoredPosts] = await Promise.all([
        reader.collections.posts.all(),
        db.query.posts.findMany({
            where: eq(dbPosts.category, 'editorial'),
            orderBy: [desc(dbPosts.publishedDate)],
        })
    ]);

    const formattedKeystatic = keystaticPosts
        .filter(post => post.entry.category === 'editorial')
        .map(post => ({
            slug: post.slug,
            title: post.entry.title as string,
            author: post.entry.author as string || 'Staff',
            publishedDate: post.entry.publishedDate as string || new Date().toISOString(),
        }));

    const formattedAuthored = authoredPosts.map(post => ({
        slug: post.slug,
        title: post.title,
        author: post.author,
        publishedDate: post.publishedDate.toISOString(),
    }));

    const allEditorialPosts = [...formattedAuthored, ...formattedKeystatic];

    allEditorialPosts.sort((a, b) => {
        const dateA = new Date(a.publishedDate).getTime();
        const dateB = new Date(b.publishedDate).getTime();
        return dateB - dateA;
    });

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Editorial</h1>
                <p className={styles.subtitle}>Official editorials and institutional commentary.</p>
            </header>

            <div className={styles.list}>
                {allEditorialPosts.length > 0 ? (
                    allEditorialPosts.map((post) => (
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
