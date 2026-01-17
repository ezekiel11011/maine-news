'use client';

import { useState } from 'react';
import Hero from '@/components/home/Hero';
import LiveTicker from '@/components/home/LiveTicker';
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
}

const CATEGORIES = [
    { id: 'all', label: 'News' },
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

export default function HomeFeed({ initialPosts }: HomeFeedProps) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [visibleCount, setVisibleCount] = useState(15);
    const [showFilters, setShowFilters] = useState(false);

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

            <div className={styles.stickyNav}>
                <div className={styles.categoryTabs}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                setVisibleCount(15); // Reset count on category change
                            }}
                            className={`${styles.tabButton} ${activeCategory === cat.id ? styles.activeTab : ''}`}
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
                                className={`${styles.filterChip} ${activeCategory === cat.id ? styles.activeChip : ''}`}
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
