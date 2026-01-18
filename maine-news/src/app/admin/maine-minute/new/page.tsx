import React from 'react';
import { db } from '@/db';
import { reader } from '@/lib/reader';
import MaineMinuteForm from '@/components/admin/MaineMinuteForm';
import { desc } from 'drizzle-orm';
import { posts as dbPosts } from '@/db/schema';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewMaineMinutePage() {
    // Fetch all available posts to choose from
    const [keystaticPosts, authoredPosts] = await Promise.all([
        reader.collections.posts.all(),
        db.query.posts.findMany({
            orderBy: [desc(dbPosts.publishedDate)],
        })
    ]);

    const formattedKeystatic = keystaticPosts.map(post => ({
        id: post.slug,
        title: post.entry.title as string,
        slug: post.slug,
        publishedDate: post.entry.publishedDate as string || new Date().toISOString(),
    }));

    const formattedAuthored = authoredPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        publishedDate: post.publishedDate.toISOString(),
    }));

    const allPosts = [...formattedAuthored, ...formattedKeystatic].sort((a, b) =>
        new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );

    // Filter for posts from the last 48 hours to ensure we catch all of "yesterday"
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 2); // 48 hours ago
    cutoff.setHours(0, 0, 0, 0); // Start of that day

    const recentPosts = allPosts.filter(post =>
        new Date(post.publishedDate) >= cutoff
    ).slice(0, 6); // Take up to 6 most recent

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
                            ? `Auto-selected ${recentPosts.length} stories from the last 48 hours.`
                            : "No stories found from the last 48 hours. Select manually below."}
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
