'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import styles from './Search.module.css';

interface Post {
    slug: string;
    title: string;
    author: string;
    category: string;
    publishedDate: string;
}

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch all posts on mount
    useEffect(() => {
        async function fetchPosts() {
            try {
                const response = await fetch('/api/posts');
                const data = await response.json();
                setPosts(data.posts || []);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, []);

    // Filter posts based on query
    useEffect(() => {
        if (!query.trim()) {
            setFilteredPosts([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = posts.filter(post =>
            post.title.toLowerCase().includes(lowerQuery) ||
            post.author.toLowerCase().includes(lowerQuery) ||
            post.category.toLowerCase().includes(lowerQuery)
        );
        setFilteredPosts(results);
    }, [query, posts]);

    return (
        <main className={styles.container}>
            <div className={styles.searchWrapper}>
                <div className={styles.inputGroup}>
                    <SearchIcon size={24} className={styles.icon} />
                    <input
                        type="text"
                        placeholder="Search stories, authors, or topics..."
                        className={styles.input}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div className={styles.results}>
                {loading ? (
                    <p className={styles.placeholder}>Loading...</p>
                ) : !query.trim() ? (
                    <p className={styles.placeholder}>Type to start searching...</p>
                ) : filteredPosts.length === 0 ? (
                    <p className={styles.placeholder}>No results found for &quot;{query}&quot;</p>
                ) : (
                    <>
                        <p className={styles.resultCount}>
                            {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} found
                        </p>
                        <div className={styles.resultsList}>
                            {filteredPosts.map(post => (
                                <Link
                                    key={post.slug}
                                    href={`/article/${post.slug}`}
                                    className={styles.resultItem}
                                >
                                    <h3 className={styles.resultTitle}>{post.title}</h3>
                                    <div className={styles.resultMeta}>
                                        <span className={styles.category}>{post.category}</span>
                                        <span className={styles.separator}>•</span>
                                        <span className={styles.author}>{post.author}</span>
                                        <span className={styles.separator}>•</span>
                                        <span className={styles.date}>
                                            {new Date(post.publishedDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
