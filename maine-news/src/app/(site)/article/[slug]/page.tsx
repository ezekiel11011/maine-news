import Image from 'next/image';
import { notFound } from 'next/navigation';
import ArticleActions from '@/components/article/ArticleActions';
import TextResizer from '@/components/article/TextResizer';
import styles from './Article.module.css';
import { db } from '@/db';
import { posts as dbPosts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { EDITORIAL_DISCLAIMER_PARAGRAPHS } from '@/lib/editorialDisclaimer';

interface ArticlePageProps {
    params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ArticlePageProps) {
    const { slug } = await params;

    // Check DB first (with error handling)
    let dbPost = null;
    try {
        dbPost = await db.query.posts.findFirst({
            where: eq(dbPosts.slug, slug),
        });
    } catch (error) {
        console.error('Database connection failed in metadata generation:', error);
    }

    if (dbPost) {
        return {
            title: dbPost.title,
            openGraph: {
                title: dbPost.title,
                images: dbPost.image ? [dbPost.image] : ['/hero-fallback.jpeg'],
                type: 'article',
                authors: [dbPost.author],
                publishedTime: dbPost.publishedDate.toISOString(),
            },
        };
    }

    return {};
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { slug } = await params;

    // 1. Try fetching from Database (with error handling)
    let dbPost = null;
    try {
        dbPost = await db.query.posts.findFirst({
            where: eq(dbPosts.slug, slug),
        });
    } catch (error) {
        console.error('Database query failed, falling back to Keystatic:', error);
    }

    if (dbPost) {
        const isEditorial = dbPost.category === 'editorial';
        return (
            <article className={styles.articleContainer}>
                <header className={styles.header}>
                    <h1 className={styles.headline}>{dbPost.title}</h1>
                    <div className={styles.metadata}>
                        <span className={styles.author}>By {dbPost.author}</span>
                        <span>{'///'}</span>
                        <span className={styles.timestamp}>{new Date(dbPost.publishedDate).toLocaleDateString()}</span>
                    </div>
                </header>

                <figure className={styles.imageWrapper}>
                    <Image
                        src={dbPost.image || '/maine-news-now.png'}
                        alt={dbPost.title}
                        fill
                        className={styles.image}
                        priority
                    />
                </figure>

                <div className={styles.centerContent}>
                    <TextResizer />
                </div>

                <div className={styles.body} data-article-body>
                    {/* For database posts, we render content directly as HTML or Markdown */}
                    <div dangerouslySetInnerHTML={{ __html: dbPost.content }} />
                </div>

                {isEditorial && (
                    <aside className={styles.editorialDisclaimer}>
                        <h2 className={styles.editorialDisclaimerTitle}>Editorial Disclaimer</h2>
                        {EDITORIAL_DISCLAIMER_PARAGRAPHS.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </aside>
                )}

                <ArticleActions
                    title={dbPost.title}
                    url={`${process.env.NEXT_PUBLIC_SITE_URL}/article/${slug}`}
                />
            </article>
        );
    }

    notFound();
}
