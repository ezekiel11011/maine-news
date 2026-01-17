import React from 'react';
import { db } from '@/db';
import { maineMinute } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { Plus, Clock, Calendar, Edit2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MaineMinuteListPage() {
    const allMinutes = await db.query.maineMinute.findMany({
        orderBy: [desc(maineMinute.date)],
    });

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col justify-between gap-4 border-b pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">The Maine Minute®️</h1>
                    <p className="text-dim mt-1">Manage your daily news digests.</p>
                </div>
                <Link
                    href="/admin/maine-minute/new"
                    className="btn-primary"
                    style={{ alignSelf: 'flex-start' }}
                >
                    <Plus size={20} />
                    Create New Minute
                </Link>
            </div>

            <div className="grid gap-4">
                {allMinutes.length > 0 ? (
                    allMinutes.map((minute) => (
                        <div
                            key={minute.id}
                            className="bg-card border-all hover-accent-border rounded-2xl p-6 flex items-center justify-between transition-all"
                        >
                            <div className="flex items-center gap-6">
                                <div className="p-3 bg-dim rounded-xl">
                                    <Clock size={24} className="text-accent" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">
                                        {new Date(minute.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </h2>
                                    <div className="flex items-center gap-4 text-sm text-dim">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {minute.date}
                                        </span>
                                        <span>•</span>
                                        <span>{(minute.stories as any[]).length} Stories</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href={`/news/maine-minute/${minute.date}`}
                                    target="_blank"
                                    className="p-2 bg-dim text-dim hover-white rounded-lg border-all transition-all"
                                    title="View Live"
                                >
                                    <ExternalLink size={18} />
                                </Link>
                                <Link
                                    href={`/admin/maine-minute/edit/${minute.date}`}
                                    className="p-2 bg-dim text-accent hover-white rounded-lg border-all transition-all"
                                    title="Edit"
                                >
                                    <Edit2 size={18} />
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-card border-all rounded-3xl" style={{ borderStyle: 'dashed' }}>
                        <div className="p-6 bg-dim rounded-full mb-4">
                            <Clock size={48} style={{ color: '#333' }} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Minutes yet</h3>
                        <p className="text-dim mb-8 text-center max-w-sm">Create your first daily digest to keep your readers informed in under a minute.</p>
                        <Link
                            href="/admin/maine-minute/new"
                            className="px-8 py-3 bg-dim text-white rounded-xl border-all hover-white"
                            style={{ textDecoration: 'none' }}
                        >
                            Create Today&apos;s Minute
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
