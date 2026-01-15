import Image from 'next/image';
import { notFound } from 'next/navigation';
import { reader } from '@/lib/reader';
import Markdoc from '@markdoc/markdoc';
import React from 'react';
import ArticleActions from '@/components/article/ArticleActions';
import TextResizer from '@/components/article/TextResizer';
import styles from './Article.module.css';
import { db } from '@/db';
import { posts as dbPosts } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    // Then check Keystatic
    const post = await reader.collections.posts.read(slug);
    if (!post) return {};

    return {
        title: post.title,
        openGraph: {
            title: post.title,
            images: post.image ? [post.image] : ['/hero-fallback.jpeg'],
            type: 'article',
            authors: [post.author],
            publishedTime: post.publishedDate,
        },
    };
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

                {dbPost.image && (
                    <figure className={styles.imageWrapper}>
                        <Image
                            src={dbPost.image}
                            alt={dbPost.title}
                            fill
                            className={styles.image}
                            priority
                        />
                    </figure>
                )}

                <div className={styles.centerContent}>
                    <TextResizer />
                </div>

                <div className={styles.body} data-article-body>
                    {/* For database posts, we render content directly as HTML or Markdown */}
                    <div dangerouslySetInnerHTML={{ __html: dbPost.content }} />
                </div>

                <ArticleActions
                    title={dbPost.title}
                    url={`${process.env.NEXT_PUBLIC_SITE_URL}/article/${slug}`}
                />
            </article>
        );
    }

    // 2. Try fetching from Keystatic
    const post = await reader.collections.posts.read(slug);

    if (!post) {
        notFound();
    }

    const title = post.title as string;
    const author = post.author as string;
    const publishedDate = post.publishedDate as string;
    const image = post.image as string | undefined;
    const content = post.content as () => Promise<{ node: any }>;
    const dateStr = new Date(publishedDate?.toString() || '').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <article className={styles.articleContainer}>
            <header className={styles.header}>
                <h1 className={styles.headline}>{title as string}</h1>
                <div className={styles.metadata}>
                    <span className={styles.author}>By {author}</span>
                    <span>{'///'}</span>
                    <span className={styles.timestamp}>{dateStr}</span>
                </div>
            </header>

            {image && (
                <figure className={styles.imageWrapper}>
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className={styles.image}
                        priority
                    />
                </figure>
            )}

            <div className={styles.centerContent}>
                <TextResizer />
            </div>

            <div className={styles.body} data-article-body>
                {Markdoc.renderers.react(Markdoc.transform((await content()).node), React)}
            </div>

            <ArticleActions
                title={title}
                url={`${process.env.NEXT_PUBLIC_SITE_URL}/article/${slug}`}
            />
        </article>
    );
}
