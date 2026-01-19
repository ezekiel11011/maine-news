import React from 'react';
import { db } from '@/db';
import { videos } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { Plus, Video, Calendar, Search, Play, Trash2, Edit2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function VideosListPage() {
    const allVideos = await db.query.videos.findMany({
        orderBy: [desc(videos.publishedDate)],
    });

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Header section */}
            <div className="flex flex-col justify-between gap-4 border-b pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Videos</h1>
                    <p className="text-dim mt-1">Manage broadcast and video reporting.</p>
                </div>
                <button
                    className="btn-primary opacity-50 cursor-not-allowed"
                    style={{ alignSelf: 'flex-start' }}
                    disabled
                >
                    <Plus size={20} />
                    Add New Video
                </button>
            </div>

            {/* Filters placeholder */}
            <div className="flex gap-4 items-center justify-between bg-card p-4 rounded-2xl border-all">
                <div className="relative flex-1" style={{ maxWidth: '400px' }}>
                    <Search size={18} className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                    <input
                        type="text"
                        placeholder="Search videos..."
                        className="w-full bg-muted border-all rounded-xl py-2.5 text-sm"
                        style={{ paddingLeft: '3rem', paddingRight: '1rem', outline: 'none', color: 'white' }}
                    />
                </div>
            </div>

            {/* Videos List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allVideos.length > 0 ? (
                    allVideos.map((video) => (
                        <div
                            key={video.id}
                            className="bg-card border-all hover-accent-border rounded-2xl overflow-hidden flex flex-col transition-all group"
                        >
                            <div className="aspect-video relative bg-dim">
                                {video.thumbnail ? (
                                    <Image src={video.thumbnail} alt="" fill className="object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <Video size={48} style={{ color: '#333' }} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play size={48} className="text-white fill-white" />
                                </div>
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-[10px] font-bold text-white uppercase">
                                    {video.duration || '0:00'}
                                </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <h2 className="text-sm font-bold text-white line-clamp-2 mb-3">
                                    {video.title}
                                </h2>

                                <div className="flex items-center justify-between text-[10px] text-dim font-bold uppercase tracking-wider">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} className="text-accent" />
                                        <span>{new Date(video.publishedDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="hover-white transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="hover-red transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 bg-card border-all rounded-3xl" style={{ borderStyle: 'dashed' }}>
                        <div className="p-6 bg-dim rounded-full mb-4">
                            <Video size={48} style={{ color: '#333' }} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No videos yet</h3>
                        <p className="text-dim mb-8 text-center max-w-sm">Broadcast stories will appear here after they are scraped or added manually.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
