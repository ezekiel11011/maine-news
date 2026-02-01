import React from 'react';
import { db } from '@/db';
import MaineMinuteForm from '@/components/admin/MaineMinuteForm';
import { desc } from 'drizzle-orm';
import { posts as dbPosts } from '@/db/schema';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewMaineMinutePage() {
    // Fetch all available posts to choose from
    const authoredPosts = await db.query.posts.findMany({
        orderBy: [desc(dbPosts.publishedDate)],
    });

    const allPosts = authoredPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        publishedDate: post.publishedDate.toISOString(),
        category: post.category,
    }));

    // Filter for posts from the last 24 hours
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 1);

    let recentPosts = allPosts.filter(post =>
        new Date(post.publishedDate) >= cutoff
    );

    // Apply diversity logic (match auto-gen)
    // Ensure Category Diversity
    const uniqueCategories = Array.from(new Set(recentPosts.map(p => p.category || 'general')));
    const selectedStories: any[] = [];
    const selectedSlugs = new Set();

    // Pick top story from each category first
    uniqueCategories.forEach(cat => {
        const topForCat = recentPosts.find(p => ((p as any).category || 'general') === cat);
        if (topForCat) {
            selectedStories.push(topForCat);
            selectedSlugs.add(topForCat.slug);
        }
    });

    // Fill remaining slots up to 15
    for (const post of recentPosts) {
        if (selectedStories.length >= 15) break;
        if (!selectedSlugs.has(post.slug)) {
            selectedStories.push(post);
            selectedSlugs.add(post.slug);
        }
    }

    // Sort
    selectedStories.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
    recentPosts = selectedStories;

    // Pre-fill stories with placeholders
    const initialStories = recentPosts.map(post => ({
        postSlug: post.slug,
        summary: post.title
    }));

    // If no recent stories, ensure at least one empty slot
    if (initialStories.length === 0) {
        initialStories.push({ postSlug: '', summary: '' });
    }

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/maine-minute"
                    className="p-2 bg-dim rounded-xl border-all text-dim hover-white transition-all"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Create Maine Minute</h1>
                    <p className="text-dim mt-1">
                        {recentPosts.length > 0
                            ? `Auto-selected ${recentPosts.length} headlines from the last 24 hours.`
                            : "No stories found from the last 24 hours. Select manually below."}
                    </p>
                </div>
            </div>

            <MaineMinuteForm
                availablePosts={allPosts}
                initialData={{
                    date: new Date().toISOString().split('T')[0],
                    tagline: 'Everything that matters. One minute.',
                    stories: initialStories
                }}
            />
        </div>
    );
}
