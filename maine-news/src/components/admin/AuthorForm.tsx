'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Loader2, User } from 'lucide-react';

interface AuthorFormProps {
    initialData?: {
        name: string;
        avatar: string | null;
        bio: string | null;
    };
    isEditing?: boolean;
}

export default function AuthorForm({ initialData, isEditing = false }: AuthorFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        avatar: initialData?.avatar || '',
        bio: initialData?.bio || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/authors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save author');
            }

            router.push('/admin/authors');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4">
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-card border-all rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-8 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-bold text-dim uppercase tracking-widest mb-2 block">Full Name</span>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-muted border-all rounded-xl px-4 py-3 text-white focus-accent outline-none"
                                placeholder="e.g. Stephen King"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-bold text-dim uppercase tracking-widest mb-2 block">Avatar URL</span>
                            <div className="flex gap-4 items-center">
                                <div className="h-12 w-12 rounded-full bg-dim flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Avatar Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <User size={20} className="text-dim" />
                                    )}
                                </div>
                                <input
                                    type="url"
                                    value={formData.avatar}
                                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                    className="w-full bg-muted border-all rounded-xl px-4 py-3 text-white focus-accent outline-none"
                                    placeholder="https://example.com/photo.jpg"
                                />
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-sm font-bold text-dim uppercase tracking-widest mb-2 block">Biography</span>
                            <textarea
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full bg-muted border-all rounded-xl px-4 py-3 text-white focus-accent outline-none resize-none"
                                placeholder="Tell us about this contributor..."
                            />
                        </label>
                    </div>
                </div>

                <div className="p-6 bg-dim border-t flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 rounded-xl border-all text-dim hover-white transition-all flex items-center gap-2"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary px-8"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        {isEditing ? 'Save Changes' : 'Create Author'}
                    </button>
                </div>
            </div>
        </form>
    );
}
