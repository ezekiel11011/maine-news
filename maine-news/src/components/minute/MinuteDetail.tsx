'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './MinuteDetail.module.css';

interface MinuteStoryDetail {
    title: string;
    slug: string;
    summary: string;
    category?: string;
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
    const [currentTime, setCurrentTime] = useState('');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

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

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 350; // Approx card width
            const currentScroll = scrollContainerRef.current.scrollLeft;
            scrollContainerRef.current.scrollTo({
                left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <article className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logoWrapper}>
                    <Image
                        src="/maine-minutes.png"
                        alt="The Maine Minute"
                        width={300}
                        height={80}
                        className={styles.logo}
                        onError={() => setLogoError(true)}
                        style={{ display: logoError ? 'none' : 'block' }}
                    />
                    {logoError && <div className={styles.brand}>The Maine Minute<sup style={{ fontSize: '0.6em', verticalAlign: 'top' }}>®</sup></div>}
                </div>
                <h1 className={styles.title}>{formattedDate}</h1>
                {currentTime && <div className={styles.clock} style={{
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--color-accent)',
                    fontSize: '1.2rem',
                    marginBottom: '1rem',
                    fontWeight: 700
                }}>{currentTime}</div>}
                <p className={styles.tagline}>{tagline}</p>
                <div className={styles.divider} />
            </header>

            <div className={styles.galleryWrapper}>
                <button
                    onClick={() => scroll('left')}
                    className={`${styles.scrollBtn} ${styles.scrollBtnLeft}`}
                    aria-label="Scroll Left"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className={styles.content} ref={scrollContainerRef}>
                    {/* News Stories - Scrolling Gallery */}
                    {stories.map((story, i) => (
                        <div key={i} className={styles.storyBlock}>
                            <div className={styles.storyHeader}>
                                {story.category && (
                                    <span className={styles.categoryTag}>{story.category}</span>
                                )}
                                <h2 className={styles.storyTitle}>{story.title}</h2>
                            </div>
                            <p className={styles.summary}>{story.summary}</p>
                            <Link href={`/article/${story.slug}`} className={styles.readMore}>
                                Full Internal Article →
                            </Link>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => scroll('right')}
                    className={`${styles.scrollBtn} ${styles.scrollBtnRight}`}
                    aria-label="Scroll Right"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

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
