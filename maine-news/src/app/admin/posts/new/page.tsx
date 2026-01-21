'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Send, X, Settings, Image as ImageIcon, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Import Tiptap dynamically to avoid SSR issues
const TiptapEditor = dynamic(() => import('@/components/admin/TiptapEditor'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-[#111] animate-pulse rounded-2xl border border-[#1a1a1a]" />
});

export default function NewPostPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        author: 'Nathan Reardon',
        category: 'local',
        content: '',
        publishedDate: new Date().toISOString().split('T')[0],
    });

    const [imageFile, setImageFile] = useState<File | null>(null);

    // Auto-generate slug from title
    useEffect(() => {
        if (formData.title) {
            const generatedSlug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.title]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleContentChange = (newContent: string) => {
        setFormData(prev => ({ ...prev, content: newContent }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            alert('Please fill in both title and content');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });
            if (imageFile) {
                data.append('image', imageFile);
            }

            const response = await fetch('/api/admin/posts', {
                method: 'POST',
                body: data,
            });

            if (response.ok) {
                router.push('/admin/posts');
                router.refresh();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error || 'Failed to save post'}`);
            }
        } catch (error) {
            console.error('Submission failed:', error);
            alert('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }} className="space-y-8 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-6" style={{ position: 'sticky', top: 0, backdropFilter: 'blur(16px)', backgroundColor: 'rgba(5, 5, 5, 0.9)', zIndex: 20, paddingTop: '1rem' }}>
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/posts"
                        className="btn-icon"
                    >
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight oswald" style={{ marginBottom: '0.25rem' }}>CREATE EXCLUSIVE</h1>
                        <p className="text-muted text-sm">Original editorial content • Saving to database</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary"
                        style={{ padding: '0.875rem 2rem', fontSize: '0.95rem' }}
                    >
                        {loading ? (
                            <div className="spinner" style={{ width: '1.25rem', height: '1.25rem' }} />
                        ) : (
                            <Send size={20} />
                        )}
                        {loading ? 'Publishing...' : 'Publish Live'}
                    </button>
                </div>
            </div>

            <form className="grid gap-8" style={{ gridTemplateColumns: '1fr 340px' }}>
                {/* Main Editor Area */}
                <div className="space-y-6">
                    <div className="space-y-6">
                        <div>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Your story headline..."
                                className="oswald"
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '3.5rem',
                                    fontWeight: 700,
                                    color: '#fff',
                                    outline: 'none',
                                    lineHeight: 1.1,
                                    textTransform: 'uppercase',
                                    letterSpacing: '-0.02em'
                                }}
                                required
                            />
                            <div style={{ height: '2px', background: 'linear-gradient(to right, var(--accent), transparent)', marginTop: '1rem', opacity: 0.3 }} />
                        </div>

                        <TiptapEditor
                            content={formData.content}
                            onChange={handleContentChange}
                        />
                    </div>
                </div>

                {/* Sidebar Metadata */}
                <div className="space-y-6">
                    <div className="bg-card border-all rounded-2xl p-6 shadow-xl space-y-6" style={{ position: 'sticky', top: '120px' }}>
                        <div>
                            <h3 className="oswald" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '1.5rem', letterSpacing: '0.15rem' }}>
                                <Settings size={18} style={{ display: 'inline-block', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                POST METADATA
                            </h3>
                        </div>

                        {/* Author */}
                        <div>
                            <label style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Author</label>
                            <select
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'var(--bg-muted)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                <option value="Nathan Reardon">Nathan Reardon</option>
                                <option value="Maine News Now">Maine News Now</option>
                                <option value="Staff">Staff</option>
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'var(--bg-muted)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    textTransform: 'capitalize'
                                }}
                            >
                                <option value="local">Local News</option>
                                <option value="politics">Politics</option>
                                <option value="opinion">Opinion</option>
                                <option value="editorial">Editorial</option>
                                <option value="weather">Weather</option>
                                <option value="exclusives">Exclusives</option>
                            </select>
                        </div>

                        {/* Slug */}
                        <div>
                            <label style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>URL Slug</span>
                                <Globe size={12} style={{ color: 'var(--accent)' }} />
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'var(--bg-muted)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    color: 'var(--text-dim)',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {/* Image Upload */}
                        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                            <label style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Featured Image</label>
                            <div
                                className="relative overflow-hidden flex items-center justify-center"
                                style={{
                                    aspectRatio: '16 / 9',
                                    borderRadius: '1rem',
                                    border: '2px dashed var(--border-color)',
                                    backgroundColor: 'var(--bg-muted)',
                                    transition: 'all 0.2s',
                                    cursor: previewImage ? 'default' : 'pointer'
                                }}
                            >
                                {previewImage ? (
                                    <>
                                        <Image src={previewImage} alt="Preview" fill className="object-cover" unoptimized />
                                        <button
                                            type="button"
                                            onClick={() => { setPreviewImage(null); setImageFile(null); }}
                                            style={{
                                                position: 'absolute',
                                                top: '0.75rem',
                                                right: '0.75rem',
                                                padding: '0.5rem',
                                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                backdropFilter: 'blur(8px)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 10,
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'}
                                        >
                                            <X size={16} style={{ color: '#fff' }} />
                                        </button>
                                    </>
                                ) : (
                                    <label style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', cursor: 'pointer' }}>
                                        <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '1rem', marginBottom: '0.75rem' }}>
                                            <ImageIcon size={28} style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600, letterSpacing: '0.05rem' }}>
                                            CLICK TO UPLOAD
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
