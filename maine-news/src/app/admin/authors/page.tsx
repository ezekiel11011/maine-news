import React from 'react';
import { db } from '@/db';
import { authors } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { Plus, Users, User, Calendar, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function AuthorsListPage() {
    const allAuthors = await db.query.authors.findMany({
        orderBy: [desc(authors.createdAt)],
    });

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Header section */}
            <div className="flex flex-col justify-between gap-4 border-b pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Authors</h1>
                    <p className="text-dim mt-1">Manage contributors and staff profiles.</p>
                </div>
                <Link
                    href="/admin/authors/new"
                    className="btn-primary"
                    style={{ alignSelf: 'flex-start' }}
                >
                    <Plus size={20} />
                    Add New Author
                </Link>
            </div>

            {/* Filters and search placeholder */}
            <div className="flex gap-4 items-center justify-between bg-card p-4 rounded-2xl border-all">
                <div className="relative flex-1" style={{ maxWidth: '400px' }}>
                    <Search size={18} className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                    <input
                        type="text"
                        placeholder="Search authors..."
                        className="w-full bg-muted border-all rounded-xl py-2.5 text-sm"
                        style={{ paddingLeft: '3rem', paddingRight: '1rem', outline: 'none', color: 'white' }}
                    />
                </div>
            </div>

            {/* Authors List */}
            <div className="grid gap-4">
                {allAuthors.length > 0 ? (
                    allAuthors.map((author) => (
                        <div
                            key={author.id}
                            className="bg-card border-all hover-accent-border rounded-2xl p-4 flex gap-6 transition-all"
                        >
                            <div className="h-16 w-16 rounded-full bg-dim overflow-hidden relative flex-shrink-0">
                                {author.avatar ? (
                                    <Image src={author.avatar} alt={author.name} fill className="object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <User size={32} style={{ color: '#333' }} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-1" style={{ margin: 0 }}>
                                            {author.name}
                                        </h2>
                                        <p className="text-sm text-dim line-clamp-1">{author.bio || 'No bio provided.'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover-white text-dim transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                        <button className="p-2 hover-red text-dim transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-card border-all rounded-3xl" style={{ borderStyle: 'dashed' }}>
                        <div className="p-6 bg-dim rounded-full mb-4">
                            <Users size={48} style={{ color: '#333' }} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No authors found</h3>
                        <p className="text-dim mb-8 text-center max-w-sm">Manage your newsroom staff here. Add your first author to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
