'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './MinuteDetail.module.css';

interface MinuteStoryDetail {
    title: string;
    slug: string;
    summary: string;
}

interface MinuteDetailProps {
    date: string;
    tagline: string;
    stories: MinuteStoryDetail[];
}

export default function MinuteDetail({ date, tagline, stories }: MinuteDetailProps) {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <article className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logoWrapper}>
                    <Image
                        src="/maine-minutes.png"
                        alt="The Maine Minute®️"
                        width={300}
                        height={80}
                        className={styles.logo}
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                    <div className={styles.brand}>The Maine Minute®️</div>
                </div>
                <h1 className={styles.title}>{formattedDate}</h1>
                <p className={styles.tagline}>{tagline}</p>
                <div className={styles.divider} />
            </header>

            <div className={styles.content}>
                {stories.map((story, i) => (
                    <div key={i} className={styles.storyBlock}>
                        <div className={styles.storyHeader}>
                            <span className={styles.index}>0{i + 1}</span>
                            <h2 className={styles.storyTitle}>{story.title}</h2>
                        </div>
                        <p className={styles.summary}>{story.summary}</p>
                        <Link href={`/article/${story.slug}`} className={styles.readMore}>
                            Full Internal Article →
                        </Link>
                    </div>
                ))}
            </div>

            <footer className={styles.footer}>
                <div className={styles.footerBrand}>The Maine Minute®️</div>
                <p>Everything that matters. One minute.</p>
                <div className={styles.copyright}>© {new Date().getFullYear()} Maine News Now</div>
            </footer>
        </article>
    );
}
