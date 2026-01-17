'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, Search, Calendar, Type } from 'lucide-react';

interface Post {
    id: string;
    title: string;
    slug: string;
    publishedDate: string;
}

interface MaineMinuteFormProps {
    initialData?: {
        date: string;
        tagline: string;
        stories: { postSlug: string; summary: string }[];
    };
    availablePosts: Post[];
}

export default function MaineMinuteForm({ initialData, availablePosts }: MaineMinuteFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [tagline, setTagline] = useState(initialData?.tagline || 'Everything that matters. One minute.');
    const [stories, setStories] = useState<{ postSlug: string; summary: string }[]>(
        initialData?.stories || [{ postSlug: '', summary: '' }]
    );
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPosts = availablePosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 50);

    const handleAddStory = () => {
        if (stories.length < 6) {
            setStories([...stories, { postSlug: '', summary: '' }]);
        }
    };

    const handleRemoveStory = (index: number) => {
        setStories(stories.filter((_, i) => i !== index));
    };

    const handleStoryChange = (index: number, field: 'postSlug' | 'summary', value: string) => {
        const newStories = [...stories];
        newStories[index][field] = value;
        setStories(newStories);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/admin/maine-minute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    tagline,
                    stories: stories.filter(s => s.postSlug && s.summary)
                }),
            });

            if (response.ok) {
                router.push('/admin/maine-minute');
                router.refresh();
            } else {
                const err = await response.json();
                alert(err.error || 'Failed to save');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column: Basic Info */}
                <div className="space-y-6">
                    <div className="bg-card border-all rounded-2xl p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Calendar size={20} className="text-accent" />
                            General Information
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dim mb-2">Publish Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="input-admin w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dim mb-2">Tagline</label>
                                <div className="relative">
                                    <Type size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
                                    <input
                                        type="text"
                                        value={tagline}
                                        onChange={(e) => setTagline(e.target.value)}
                                        className="input-admin w-full pl-11"
                                        placeholder="Everything that matters. One minute."
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border-all rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Search size={20} className="text-accent" />
                                Quick Post Search
                            </h2>
                        </div>
                        <input
                            type="text"
                            placeholder="Search available posts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-admin w-full mb-4"
                        />
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {filteredPosts.map(post => (
                                <div
                                    key={post.id}
                                    className="p-3 rounded-xl border-all bg-muted/50 flex flex-col gap-1 cursor-pointer hover:border-accent transition-colors"
                                    onClick={() => {
                                        // Find first empty story and set its slug
                                        const emptyIndex = stories.findIndex(s => !s.postSlug);
                                        if (emptyIndex !== -1) {
                                            handleStoryChange(emptyIndex, 'postSlug', post.slug);
                                        } else if (stories.length < 6) {
                                            setStories([...stories, { postSlug: post.slug, summary: '' }]);
                                        }
                                    }}
                                >
                                    <span className="text-sm font-medium line-clamp-1">{post.title}</span>
                                    <span className="text-xs text-dim">
                                        {new Date(post.publishedDate).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Stories */}
                <div className="space-y-6">
                    <div className="bg-card border-all rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Plus size={20} className="text-accent" />
                                Stories ({stories.length}/6)
                            </h2>
                            <button
                                type="button"
                                onClick={handleAddStory}
                                disabled={stories.length >= 6}
                                className="text-xs font-bold text-accent uppercase tracking-widest disabled:opacity-50"
                            >
                                Add Story
                            </button>
                        </div>

                        <div className="space-y-8">
                            {stories.map((story, index) => (
                                <div key={index} className="relative p-6 rounded-2xl border-all bg-muted/30 space-y-4">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveStory(index)}
                                        className="absolute top-4 right-4 text-dim hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-black text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <h3 className="font-bold">Story Digest</h3>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-dim uppercase tracking-wider mb-2">Original Article Slug</label>
                                        <input
                                            type="text"
                                            value={story.postSlug}
                                            onChange={(e) => handleStoryChange(index, 'postSlug', e.target.value)}
                                            className="input-admin w-full"
                                            placeholder="e.g., local-news-story-slug"
                                            required
                                        />
                                        {story.postSlug && (
                                            <p className="mt-1 text-[10px] text-accent font-medium">
                                                Linked to: {availablePosts.find(p => p.slug === story.postSlug)?.title || 'Unknown Slug'}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-dim uppercase tracking-wider mb-2">Snapshot Summary (Max 250 chars)</label>
                                        <textarea
                                            value={story.summary}
                                            onChange={(e) => handleStoryChange(index, 'summary', e.target.value)}
                                            className="input-admin w-full min-h-[80px] resize-none"
                                            placeholder="Write a concise 2-sentence summary..."
                                            maxLength={250}
                                            required
                                        ></textarea>
                                        <div className="flex justify-end">
                                            <span className={`text-[10px] font-bold ${story.summary.length > 220 ? 'text-accent' : 'text-dim'}`}>
                                                {story.summary.length}/250
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-4 text-lg"
                            >
                                <Save size={20} />
                                {loading ? 'Saving...' : 'Publish Maine Minute'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
