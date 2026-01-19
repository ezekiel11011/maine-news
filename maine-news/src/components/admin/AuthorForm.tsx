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
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('bio', formData.bio);
            data.append('avatarUrl', formData.avatar);
            if (imageFile) {
                data.append('image', imageFile);
            }

            const res = await fetch('/api/admin/authors', {
                method: 'POST',
                body: data, // Browser handles multipart/form-data
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error || 'Failed to save author');
            }

            router.push('/admin/authors');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            // Create a preview URL locally
            const previewUrl = URL.createObjectURL(e.target.files[0]);
            setFormData(prev => ({ ...prev, avatar: previewUrl }));
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

                        <div className="block">
                            <span className="text-sm font-bold text-dim uppercase tracking-widest mb-2 block">Avatar</span>
                            <div className="flex gap-6 items-center bg-muted p-4 rounded-xl border-all">
                                <div className="h-24 w-24 rounded-full bg-dim flex items-center justify-center flex-shrink-0 overflow-hidden relative shadow-lg">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Avatar Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-dim" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <label className="cursor-pointer bg-accent hover:bg-white text-black font-bold py-2 px-4 rounded-lg transition-all text-sm">
                                            Upload Image
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                        {imageFile && (
                                            <span className="text-xs text-dim italic truncate max-w-[150px]">
                                                {imageFile.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                            <span className="text-xs text-dim">OR URL:</span>
                                        </div>
                                        <input
                                            type="url"
                                            value={formData.avatar.startsWith('blob:') ? '' : formData.avatar}
                                            onChange={(e) => {
                                                setImageFile(null);
                                                setFormData({ ...formData, avatar: e.target.value });
                                            }}
                                            className="w-full bg-dark border-all rounded-lg pl-16 pr-4 py-2 text-xs text-white focus-accent outline-none"
                                            placeholder="https://example.com/photo.jpg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

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
