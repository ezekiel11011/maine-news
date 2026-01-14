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

// Generate static params for all posts
export async function generateStaticParams() {
    const posts = await reader.collections.posts.list();
    return posts.map((slug) => ({ slug }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { slug } = await params;
    const post = await reader.collections.posts.read(slug);

    if (!post) {
        notFound();
    }

    const { title, author, publishedDate, image, content } = post;

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
                {/* Subtitle is not in schema yet, skipping or could add to schema */}

                <div className={styles.metadata}>
                    <span className={styles.author}>By {author}</span>
                    <span>///</span>
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
                url={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/article/${slug}`}
            />
        </article>
    );
}
