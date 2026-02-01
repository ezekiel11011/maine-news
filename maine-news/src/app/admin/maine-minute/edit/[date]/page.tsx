import React from 'react';
import { db } from '@/db';
import MaineMinuteForm from '@/components/admin/MaineMinuteForm';
import { desc, eq } from 'drizzle-orm';
import { posts as dbPosts, maineMinute } from '@/db/schema';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface EditMaineMinutePageProps {
    params: Promise<{ date: string }>;
}

export default async function EditMaineMinutePage({ params }: EditMaineMinutePageProps) {
    const { date } = await params;

    // Fetch the minute to edit
    const minute = await db.query.maineMinute.findFirst({
        where: eq(maineMinute.date, date),
    });

    if (!minute) {
        notFound();
    }

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
                    <h1 className="text-3xl font-bold text-white tracking-tight">Edit Maine Minute</h1>
                    <p className="text-dim mt-1">Editing digest for {date}</p>
                </div>
            </div>

            <MaineMinuteForm
                availablePosts={allPosts}
                initialData={{
                    date: minute.date,
                    tagline: minute.tagline,
                    stories: minute.stories as { postSlug: string; summary: string }[]
                }}
            />
        </div>
    );
}
