'use client';

import React from 'react';
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
    lottery?: Record<string, any>;
}

export default function MinuteDetail({ date, tagline, stories, lottery }: MinuteDetailProps) {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const [logoError, setLogoError] = React.useState(false);

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
                        onError={() => setLogoError(true)}
                        style={{ display: logoError ? 'none' : 'block' }}
                    />
                    {logoError && <div className={styles.brand}>The Maine Minute®️</div>}
                </div>
                <h1 className={styles.title}>{formattedDate}</h1>
                <p className={styles.tagline}>{tagline}</p>
                <div className={styles.divider} />
            </header>

            <div className={styles.content}>
                {/* News Stories */}
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

                {/* Lottery Results */}
                {lottery && Object.keys(lottery).length > 0 && (
                    <div className={styles.storyBlock} style={{ marginTop: '2rem' }}>
                        <div className={styles.storyHeader}>
                            <span className={styles.index} style={{ fontSize: '1rem', opacity: 0.8 }}>$$</span>
                            <h2 className={styles.storyTitle}>Daily Numbers</h2>
                        </div>
                        <div className={styles.lotteryGrid}>
                            {lottery.powerball && (
                                <div className={styles.lotteryItem}>
                                    <span className={styles.lottoLabel}>Powerball</span>
                                    <span className={styles.lottoNumbers}>{lottery.powerball.numbers} <span className="text-red-500 font-bold">{lottery.powerball.extra}</span></span>
                                    {lottery.powerball.jackpot && <span className={styles.jackpot}>{lottery.powerball.jackpot}</span>}
                                </div>
                            )}
                            {lottery.megabucks && (
                                <div className={styles.lotteryItem}>
                                    <span className={styles.lottoLabel}>Megabucks</span>
                                    <span className={styles.lottoNumbers}>{lottery.megabucks.numbers} <span className="text-green-500 font-bold">{lottery.megabucks.extra}</span></span>
                                    {lottery.megabucks.jackpot && <span className={styles.jackpot}>{lottery.megabucks.jackpot}</span>}
                                </div>
                            )}
                            {lottery['gimme-5'] && (
                                <div className={styles.lotteryItem}>
                                    <span className={styles.lottoLabel}>Gimme 5</span>
                                    <span className={styles.lottoNumbers}>{lottery['gimme-5'].numbers}</span>
                                </div>
                            )}
                            {lottery['pic-3'] && (
                                <div className={styles.lotteryItem}>
                                    <span className={styles.lottoLabel}>Pick 3</span>
                                    <span className={styles.lottoNumbers}>{lottery['pic-3'].numbers}</span>
                                </div>
                            )}
                            {lottery['pic-4'] && (
                                <div className={styles.lotteryItem}>
                                    <span className={styles.lottoLabel}>Pick 4</span>
                                    <span className={styles.lottoNumbers}>{lottery['pic-4'].numbers}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <footer className={styles.footer}>
                <div className={styles.footerBrand}>The Maine Minute®️</div>
                <p>Everything that matters. One minute.</p>
                <div className={styles.copyright}>© {new Date().getFullYear()} Maine News Now</div>
            </footer>
        </article>
    );
}
