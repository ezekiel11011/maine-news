'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Hero from '@/components/home/Hero';
import LiveTicker from '@/components/home/LiveTicker';
import MaineMinuteCard from '@/components/home/MaineMinuteCard';
import SectionList from '@/components/home/SectionList';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { Filter, ArrowUpDown, X } from 'lucide-react';
import styles from './HomeFeed.module.css';

interface Post {
    id: string;
    title: string;
    slug: string;
    image?: string;
    category: string;
    isNational: boolean;
    publishedDate: string;
    author: string;
    isOriginal?: boolean;
}

interface HomeFeedProps {
    initialPosts: Post[];
    latestMinute?: {
        tagline: string;
        stories: {
            title: string;
            slug: string;
        }[];
    } | null;
}

const CATEGORIES = [
    { id: 'all', label: 'News' },
    { id: 'editorial', label: 'Editorial' },
    { id: 'exclusives', label: 'Exclusives' },
    { id: 'top-stories', label: 'Top Stories' },
    { id: 'local', label: 'Local' },
    { id: 'national', label: 'National' },
    { id: 'politics', label: 'Politics' },
    { id: 'sports', label: 'Sports' },
    { id: 'health', label: 'Health' },
    { id: 'weather', label: 'Weather' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'business', label: 'Business' },
    { id: 'crime', label: 'Crime' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'obituaries', label: 'Obituaries' }
];

export default function HomeFeed({ initialPosts, latestMinute }: HomeFeedProps) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [visibleCount, setVisibleCount] = useState(15);
    const [showFilters, setShowFilters] = useState(false);
    const [showEditorialAlert, setShowEditorialAlert] = useState(false);

    const latestEditorial = useMemo(() => {
        return initialPosts.find(post => post.category === 'editorial');
    }, [initialPosts]);

    useEffect(() => {
        if (!latestEditorial) return;
        const publishedAt = new Date(latestEditorial.publishedDate).getTime();
        const lastSeen = typeof window !== 'undefined'
            ? Number(window.localStorage.getItem('editorialAlertSeenAt') || 0)
            : 0;

        if (!Number.isNaN(publishedAt) && publishedAt > lastSeen) {
            setShowEditorialAlert(true);
        }
    }, [latestEditorial]);

    // Filter and Sort Logic
    const filteredPosts = initialPosts.filter(post => {
        // 1. Obituaries are ALWAYS excluded from the main 'all' feed
        if (activeCategory === 'all') {
            return post.category !== 'obituaries';
        }

        // 2. Handle Exclusives filter
        if (activeCategory === 'exclusives') {
            return post.isOriginal === true;
        }

        // 3. Handle Local/National distinction
        if (activeCategory === 'local') {
            return post.isNational === false;
        }
        if (activeCategory === 'national') {
            return post.isNational === true;
        }

        // 4. Handle other specific category filters
        return post.category === activeCategory;
    });

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        const dateA = new Date(a.publishedDate).getTime();
        const dateB = new Date(b.publishedDate).getTime();
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    const visiblePosts = sortedPosts.slice(0, visibleCount);

    // Create ticker items including Lottery mention
    const newsHeadlines = initialPosts.slice(0, 5).map(post => post.title.toUpperCase());
    const tickerHeadlines = ["MAINE LOTTERY: LATEST RESULTS IN TOP BAR", ...newsHeadlines];
    const heroPosts = initialPosts.slice(0, 6);

    return (
        <div className={styles.feedContainer}>
            <Hero posts={heroPosts} />

            <LiveTicker headlines={tickerHeadlines} />

            {latestMinute && (
                <MaineMinuteCard
                    tagline={latestMinute.tagline}
                    stories={latestMinute.stories}
                />
            )}

            {showEditorialAlert && latestEditorial && (
                <div className={styles.editorialAlert} role="status">
                    <div className={styles.editorialAlertBody}>
                        <span className={styles.editorialAlertKicker}>New Editorial</span>
                        <Link href={`/article/${latestEditorial.slug}`} className={styles.editorialAlertTitle}>
                            {latestEditorial.title}
                        </Link>
                        <span className={styles.editorialAlertMeta}>
                            Published {new Date(latestEditorial.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <button
                        type="button"
                        className={styles.editorialAlertClose}
                        onClick={() => {
                            const publishedAt = new Date(latestEditorial.publishedDate).getTime();
                            window.localStorage.setItem('editorialAlertSeenAt', String(publishedAt || Date.now()));
                            setShowEditorialAlert(false);
                        }}
                        aria-label="Dismiss editorial alert"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className={styles.stickyNav}>
                <div className={styles.categoryTabs}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                setVisibleCount(15); // Reset count on category change
                            }}
                            className={`${styles.tabButton} ${activeCategory === cat.id ? styles.activeTab : ''} ${cat.id === 'editorial' ? styles.editorialTab : ''} ${activeCategory === cat.id && cat.id === 'editorial' ? styles.editorialTabActive : ''}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className={styles.controlsBar}>
                    <div className={styles.activeFilters}>
                        <span className={styles.filterSource}>Source: All Maine</span>
                        <span className={styles.filterCount}>{sortedPosts.length} Stories</span>
                    </div>

                    <div className={styles.actions}>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`${styles.actionButton} ${showFilters ? styles.activeAction : ''}`}
                        >
                            <Filter size={18} />
                            <span>Filter</span>
                        </button>
                        <button
                            onClick={() => setSortBy(prev => prev === 'newest' ? 'oldest' : 'newest')}
                            className={styles.actionButton}
                        >
                            <ArrowUpDown size={18} />
                            <span>{sortBy === 'newest' ? 'Newest' : 'Oldest'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {showFilters && (
                <div className={styles.filterDrawer}>
                    <div className={styles.drawerHeader}>
                        <h3>Select Category</h3>
                        <button onClick={() => setShowFilters(false)}><X size={20} /></button>
                    </div>
                    <div className={styles.chipGrid}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setVisibleCount(15);
                                    setShowFilters(false);
                                }}
                                className={`${styles.filterChip} ${activeCategory === cat.id ? styles.activeChip : ''} ${cat.id === 'editorial' ? styles.editorialChip : ''} ${activeCategory === cat.id && cat.id === 'editorial' ? styles.editorialChipActive : ''}`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="content-stack">
                <SectionList
                    title={activeCategory === 'all' ? "Latest News" : `${CATEGORIES.find(c => c.id === activeCategory)?.label} News`}
                    stories={visiblePosts}
                />

                {visibleCount < sortedPosts.length && (
                    <div className={styles.loadMoreWrapper}>
                        <button
                            onClick={() => setVisibleCount(prev => prev + 15)}
                            className={styles.loadMoreButton}
                        >
                            Load More Stories
                        </button>
                    </div>
                )}
            </div>

            <ScrollToTop />
        </div>
    );
}
