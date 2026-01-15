import React from 'react';
import { db } from '@/db';
import { posts, videos, authors } from '@/db/schema';
import { count, desc } from 'drizzle-orm';
import { Newspaper, Video, Users, TrendingUp, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const [postsCount] = await db.select({ value: count() }).from(posts);
    const [videosCount] = await db.select({ value: count() }).from(videos);
    const [authorsCount] = await db.select({ value: count() }).from(authors);

    const recentPosts = await db.query.posts.findMany({
        limit: 5,
        orderBy: [desc(posts.createdAt)],
    });

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Overview</h1>
                    <p className="text-dim">Welcome back. Here&apos;s what&apos;s happening today.</p>
                </div>
                <Link
                    href="/admin/posts/new"
                    className="btn-primary"
                >
                    <Plus size={18} />
                    Create New Post
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                <StatCard
                    icon={<Newspaper size={24} className="text-accent" />}
                    label="Total Exclusives"
                    value={postsCount.value.toString()}
                    trend="+4 since last week"
                />
                <StatCard
                    icon={<Video size={24} className="text-accent" />}
                    label="Total Videos"
                    value={videosCount.value.toString()}
                    trend="+2 since last week"
                />
                <StatCard
                    icon={<Users size={24} className="text-accent" />}
                    label="Total Authors"
                    value={authorsCount.value.toString()}
                    trend="0 active today"
                />
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-card border-all rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Clock size={20} className="text-accent" />
                            <h2 className="text-xl font-semibold">Recent Posts</h2>
                        </div>
                        <Link href="/admin/posts" className="text-sm text-accent font-medium">
                            View all
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentPosts.length > 0 ? (
                            recentPosts.map((post) => (
                                <div key={post.id} className="flex items-center justify-between p-3 rounded-xl border-all" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <div className="flex items-center gap-4">
                                        <div className="avatar">
                                            {post.image ? (
                                                <Image src={post.image} alt="" fill className="object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <Newspaper size={16} style={{ color: '#444' }} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium" style={{ margin: 0 }}>
                                                {post.title}
                                            </h3>
                                            <p className="text-xs text-dim mt-0.5">
                                                {new Date(post.createdAt).toLocaleDateString()} • {post.category}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/admin/posts/${post.id}`}
                                        className="text-dim hover-white"
                                    >
                                        <TrendingUp size={16} />
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-dim text-sm" style={{ fontStyle: 'italic' }}>No posts yet. Start writing!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-card border-all rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-accent" />
                        Quick Draft
                    </h2>
                    <form className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Title of your next big story..."
                                className="w-full bg-muted border-all rounded-xl px-4 py-3 text-sm focus-accent"
                                style={{ border: '1px solid #1a1a1a', outline: 'none', color: 'white' }}
                            />
                        </div>
                        <div>
                            <textarea
                                placeholder="Write a quick summary or notes here..."
                                rows={4}
                                className="w-full bg-muted border-all rounded-xl px-4 py-3 text-sm focus-accent"
                                style={{ border: '1px solid #1a1a1a', outline: 'none', color: 'white', resize: 'none' }}
                            ></textarea>
                        </div>
                        <button className="w-full py-3 bg-dim font-semibold rounded-xl border-all text-dim hover-white">
                            Save Draft
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) {
    return (
        <div className="bg-card border-all rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-start justify-between">
                <div className="p-3 bg-dim rounded-xl">
                    {icon}
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'rgba(34, 197, 94, 0.8)' }}>
                    {trend}
                </span>
            </div>
            <div className="mt-4">
                <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
                <p className="text-sm font-medium text-dim mt-1">{label}</p>
            </div>
        </div>
    );
}
