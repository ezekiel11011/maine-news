'use client';

import { useState } from 'react';
import Hero from '@/components/home/Hero';
import LiveTicker from '@/components/home/LiveTicker';
import SectionList from '@/components/home/SectionList';
import { Filter, ArrowUpDown, X } from 'lucide-react';
import styles from './HomeFeed.module.css';

interface Post {
    id: string;
    title: string;
    slug: string;
    image?: string;
    category: string;
    publishedDate: string;
    author: string;
}

interface HomeFeedProps {
    initialPosts: Post[];
}

const CATEGORIES = ['all', 'local', 'politics', 'health', 'opinion'];

export default function HomeFeed({ initialPosts }: HomeFeedProps) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [showFilters, setShowFilters] = useState(false);

    // Filter and Sort Logic
    const filteredPosts = initialPosts.filter(post =>
        activeCategory === 'all' || post.category === activeCategory
    );

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        const dateA = new Date(a.publishedDate).getTime();
        const dateB = new Date(b.publishedDate).getTime();
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    const tickerHeadlines = initialPosts.slice(0, 5).map(post => post.title);
    const heroPosts = initialPosts.slice(0, 6);

    return (
        <div className={styles.feedContainer}>
            <Hero posts={heroPosts} />

            <LiveTicker headlines={tickerHeadlines} />

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

            {showFilters && (
                <div className={styles.filterDrawer}>
                    <div className={styles.drawerHeader}>
                        <h3>Select Category</h3>
                        <button onClick={() => setShowFilters(false)}><X size={20} /></button>
                    </div>
                    <div className={styles.chipGrid}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setActiveCategory(cat);
                                    setShowFilters(false);
                                }}
                                className={`${styles.filterChip} ${activeCategory === cat ? styles.activeChip : ''}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="content-stack">
                <SectionList
                    title={activeCategory === 'all' ? "Latest News" : `${activeCategory} News`}
                    stories={sortedPosts}
                />
            </div>
        </div>
    );
}
