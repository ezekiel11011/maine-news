'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './MinuteDetail.module.css';

interface MinuteStoryDetail {
    title: string;
    slug: string;
    summary: string;
    category?: string;
    publishedDate?: string;
}

interface MinuteDetailProps {
    date: string;
    tagline: string;
    stories: MinuteStoryDetail[];
    lottery?: Record<string, any>;
}

export default function MinuteDetail({ date, tagline, stories, lottery }: MinuteDetailProps) {
    const [logoError, setLogoError] = React.useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    useEffect(() => {
        // Hydration mismatch avoidance: only show time after mount
        const getMaineTime = () => new Date().toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        setCurrentTime(getMaineTime() + ' ET');

        const timer = setInterval(() => {
            setCurrentTime(getMaineTime() + ' ET');
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = useMemo(() => (
        new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    ), [date]);
    const headlineLabel = date === today ? 'Last 24 Hours' : formattedDate;

    const shouldShowSummary = (summary: string, title: string) => {
        const cleanSummary = summary?.trim();
        if (!cleanSummary) return false;
        return cleanSummary.toLowerCase() !== title.trim().toLowerCase();
    };

    const formatTimeAgo = (dateString?: string) => {
        if (!dateString) return '';
        const now = new Date();
        const past = new Date(dateString);
        const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
        if (Number.isNaN(diffInSeconds) || diffInSeconds < 0) return '';
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        }
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        }
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
    };

    return (
        <article className={styles.container}>
            <header className={styles.hero}>
                <div className={styles.heroTop}>
                    <div className={styles.heroCopy}>
                        <span className={styles.kicker}>The Maine Minute</span>
                        <h1 className={styles.title}>{headlineLabel}</h1>
                        <p className={styles.tagline}>{tagline}</p>
                        <p className={styles.dateStamp}>{formattedDate}</p>
                    </div>
                    <div className={styles.heroLogo}>
                        <Image
                            src="/maine-minutes.png"
                            alt="The Maine Minute"
                            width={240}
                            height={70}
                            className={styles.logo}
                            onError={() => setLogoError(true)}
                            style={{ display: logoError ? 'none' : 'block' }}
                        />
                        {logoError && (
                            <div className={styles.brand}>
                                The Maine Minute<sup style={{ fontSize: '0.6em', verticalAlign: 'top' }}>®</sup>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Headlines</span>
                        <span className={styles.statValue}>{stories.length}</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Window</span>
                        <span className={styles.statValue}>24 hrs</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Updated</span>
                        <span className={styles.statValue}>{currentTime || '—'}</span>
                    </div>
                </div>

                <p className={styles.heroNote}>
                    Condensed summaries of everything published in the last day. Tap any headline to expand the full story.
                </p>
            </header>

            {stories.length === 0 ? (
                <div className={styles.emptyState}>
                    <h2>Quiet Day in Maine</h2>
                    <p>No headlines published in the last 24 hours yet. Check back soon.</p>
                    <Link href="/" className={styles.readMore}>← Back to Newsroom</Link>
                </div>
            ) : (
                <div className={styles.stories}>
                    {stories.map((story, i) => (
                        <article key={story.slug} className={styles.storyCard}>
                            <div className={styles.storyMeta}>
                                <span className={styles.storyIndex}>{String(i + 1).padStart(2, '0')}</span>
                                {story.category && (
                                    <span className={styles.storyCategory}>{story.category}</span>
                                )}
                                {story.publishedDate && (
                                    <span className={styles.storyTime}>{formatTimeAgo(story.publishedDate)}</span>
                                )}
                            </div>
                            <Link href={`/article/${story.slug}`} className={styles.storyTitle}>
                                {story.title}
                            </Link>
                            {shouldShowSummary(story.summary, story.title) && (
                                <p className={styles.storySummary}>{story.summary}</p>
                            )}
                            <Link href={`/article/${story.slug}`} className={styles.storyLink}>
                                Read full story →
                            </Link>
                        </article>
                    ))}
                </div>
            )}

            {/* Lottery Results - Separate Section */}
            {lottery && Object.keys(lottery).length > 0 && (
                <div className={styles.lotteryContainer}>
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

            <footer className={styles.footer}>
                <div className={styles.footerBrand}>The Maine Minute<sup style={{ fontSize: '0.6em', verticalAlign: 'top' }}>®</sup></div>
                <p>Everything that matters. One minute.</p>
                <div className={styles.copyright}>© {new Date().getFullYear()} Maine News Now</div>
            </footer>
        </article>
    );
}
