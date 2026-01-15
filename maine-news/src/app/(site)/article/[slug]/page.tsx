import Image from 'next/image';
import { notFound } from 'next/navigation';
import { reader } from '@/lib/reader';
import Markdoc from '@markdoc/markdoc';
import React from 'react';
import ArticleActions from '@/components/article/ArticleActions';
import TextResizer from '@/components/article/TextResizer';
import styles from './Article.module.css';

interface ArticlePageProps {
    params: Promise<{ slug: string }>;
}

// Generate static params for all stories (both manual and scraped)
export async function generateStaticParams() {
    const [manual, scraped] = await Promise.all([
        reader.collections.posts.list(),
        reader.collections.scraped.list(),
    ]);
    return [...manual, ...scraped].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
    const { slug } = await params;
    // Check both collections
    const post = await (reader.collections.posts.read(slug)) ||
        await (reader.collections.scraped.read(slug));

    if (!post) return {};

    const title = post.title as string;
    const author = post.author as string;
    const publishedDate = post.publishedDate as string;
    const image = post.image as any;

    return {
        title,
        openGraph: {
            title,
            images: image ? [image] : ['/hero-fallback.jpeg'],
            type: 'article',
            authors: [author],
            publishedTime: publishedDate,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            images: image ? [image] : ['/hero-fallback.jpeg'],
        }
    };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { slug } = await params;

    // Check both collections
    const post = await (reader.collections.posts.read(slug)) ||
        await (reader.collections.scraped.read(slug));

    if (!post) {
        notFound();
    }

    const title = post.title as string;
    const author = post.author as string;
    const publishedDate = post.publishedDate as string;
    const image = post.image as any;
    const content = post.content as any;

    // Format date if needed
    const dateStr = new Date(publishedDate?.toString() || '').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <article className={styles.articleContainer}>
            <header className={styles.header}>
                <h1 className={styles.headline}>{title}</h1>

                <div className={styles.metadata}>
                    <span className={styles.author}>By {author}</span>
                    <span>///</span>
                    <span className={styles.timestamp}>{dateStr}</span>
                </div>
            </header>

            {image && (
                <figure className={styles.imageWrapper}>
                    <Image
                        src={typeof image === 'string' ? image : '/hero-fallback.jpeg'}
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
                url={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/article/${slug}`}
            />
        </article>
    );
}
