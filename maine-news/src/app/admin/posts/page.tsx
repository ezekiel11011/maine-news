import React from 'react';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { Plus, Newspaper, Calendar, User, Search, Filter, Edit2, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function PostsListPage() {
    const allPosts = await db.query.posts.findMany({
        orderBy: [desc(posts.publishedDate)],
    });

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Header section */}
            <div className="flex flex-col justify-between gap-4 border-b pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Exclusives</h1>
                    <p className="text-dim mt-1">Manage your original authored content.</p>
                </div>
                <Link
                    href="/admin/posts/new"
                    className="btn-primary"
                    style={{ alignSelf: 'flex-start' }}
                >
                    <Plus size={20} />
                    Create New Post
                </Link>
            </div>

            {/* Filters and search placeholder */}
            <div className="flex gap-4 items-center justify-between bg-card p-4 rounded-2xl border-all">
                <div className="relative flex-1" style={{ maxWidth: '400px' }}>
                    <Search size={18} className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        className="w-full bg-muted border-all rounded-xl py-2.5 text-sm"
                        style={{ paddingLeft: '3rem', paddingRight: '1rem', outline: 'none', color: 'white' }}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-dim text-sm font-medium text-dim hover-white rounded-xl border-all">
                        <Filter size={16} />
                        Filter
                    </button>
                </div>
            </div>

            {/* Posts List */}
            <div className="grid gap-4">
                {allPosts.length > 0 ? (
                    allPosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-card border-all hover-accent-border rounded-2xl p-4 flex gap-6 transition-all"
                        >
                            <div className="aspect-video rounded-xl bg-dim overflow-hidden relative" style={{ width: '200px', flexShrink: 0 }}>
                                {post.image ? (
                                    <Image src={post.image} alt="" fill className="object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <Newspaper size={32} style={{ color: '#333' }} />
                                    </div>
                                )}
                                <div className="absolute" style={{ top: '0.5rem', left: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', color: '#bf9b30', textTransform: 'uppercase' }}>
                                    {post.category}
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl font-bold text-white mb-0" style={{ margin: 0 }}>
                                        {post.title}
                                    </h2>
                                    <div className="flex gap-1 ml-4">
                                        <button className="p-2 text-dim hover-white transition-all" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="p-2 text-dim hover-red transition-all" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-dim">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-accent" />
                                        <span>{post.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-accent" />
                                        <span>{new Date(post.publishedDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
                                        <Link
                                            href={`/article/${post.slug}`}
                                            target="_blank"
                                            className="text-accent"
                                            style={{ textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <ExternalLink size={14} />
                                            Live Link
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-card border-all rounded-3xl" style={{ borderStyle: 'dashed' }}>
                        <div className="p-6 bg-dim rounded-full mb-4">
                            <Newspaper size={48} style={{ color: '#333' }} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Exclusives yet</h3>
                        <p className="text-dim mb-8 text-center max-w-sm">You haven&apos;t authored any original site posts yet. Your first story is waiting to be told.</p>
                        <Link
                            href="/admin/posts/new"
                            className="px-8 py-3 bg-dim text-white rounded-xl border-all hover-white"
                            style={{ textDecoration: 'none' }}
                        >
                            Start Writing
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
