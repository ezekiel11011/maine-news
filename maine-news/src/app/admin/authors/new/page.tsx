import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AuthorForm from '@/components/admin/AuthorForm';

export default function NewAuthorPage() {
    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/authors"
                    className="p-2 bg-dim rounded-xl border-all text-dim hover-white transition-all"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">New Author</h1>
                    <p className="text-dim mt-1">Create a new contributor profile.</p>
                </div>
            </div>

            <AuthorForm />
        </div>
    );
}
