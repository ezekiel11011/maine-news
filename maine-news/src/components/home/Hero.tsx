'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Hero.module.css';
import { formatTimeAgo } from '@/utils/formatDate';

interface HeroPost {
    title: string;
    slug: string;
    image?: string;
    category: string;
    author: string;
    publishedDate: string;
}

interface HeroProps {
    posts: HeroPost[];
}

export default function Hero({ posts }: HeroProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, [posts.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
    }, [posts.length]);

    useEffect(() => {
        if (!posts || posts.length <= 1 || isPaused) return;

        const timer = setInterval(nextSlide, 5000); // 5 seconds for a more relaxed pace

        return () => clearInterval(timer);
    }, [posts, isPaused, nextSlide]);

    if (!posts || posts.length === 0) {
        return (
            <section className={styles.hero}>
                <div className={styles.imageWrapper}>
                    <Image
                        src="/maine-news-longer-img.jpeg"
                        alt="Maine News Today"
                        fill
                        className={styles.image}
                        priority
                    />
                    <div className={styles.overlay} />
                </div>
                <div className={styles.content}>
                    <h1 className={styles.title}>Maine News Today</h1>
                    <p className={styles.subtitle}>Unbiased. Unafraid. Unfiltered.</p>
                </div>
            </section>
        );
    }

    const currentPost = posts[currentIndex];

    return (
        <section
            className={styles.hero}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <button
                className={`${styles.navButton} ${styles.prevButton}`}
                onClick={(e) => { e.preventDefault(); prevSlide(); }}
                aria-label="Previous story"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                className={`${styles.navButton} ${styles.nextButton}`}
                onClick={(e) => { e.preventDefault(); nextSlide(); }}
                aria-label="Next story"
            >
                <ChevronRight size={24} />
            </button>

            <Link href={`/article/${currentPost.slug}`} className={styles.link}>
                <div className={styles.imageWrapper}>
                    {posts.map((post, index) => (
                        <div
                            key={post.slug}
                            className={styles.slide}
                            style={{
                                opacity: index === currentIndex ? 1 : 0,
                                zIndex: index === currentIndex ? 1 : 0,
                                transition: 'opacity 1s ease-in-out'
                            }}
                        >
                            <Image
                                src={post.image || "/hero-fallback.jpeg"}
                                alt={post.title}
                                fill
                                className={styles.image}
                                priority
                                quality={90}
                                sizes="100vw"
                            />
                        </div>
                    ))}
                    <div className={styles.overlay} />
                </div>

                <div className={styles.content}>
                    <div className={styles.badges}>
                        <span className={styles.badge}>{currentPost.category}</span>
                    </div>
                    <h1 className={styles.title}>{currentPost.title}</h1>
                    <p className={styles.subtitle}>
                        By {currentPost.author} • {formatTimeAgo(currentPost.publishedDate)} • Unbiased. Unafraid. Unfiltered.
                    </p>

                    <div className={styles.indicators}>
                        {posts.map((_, index) => (
                            <div
                                key={index}
                                onClick={(e) => { e.preventDefault(); setCurrentIndex(index); }}
                                className={`${styles.indicator} ${index === currentIndex ? styles.activeIndicator : ''}`}
                                style={{ cursor: 'pointer' }}
                            />
                        ))}
                    </div>
                </div>
            </Link>
        </section>
    );
}
