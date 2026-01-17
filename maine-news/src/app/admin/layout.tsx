import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Newspaper, Video, Users, Home, Ticket, Clock } from 'lucide-react';
import { auth } from '@/auth';
import SignOutButton from '@/components/admin/SignOutButton';
import Image from 'next/image';
import { Providers } from '@/components/Providers';
import { Oswald, Inter } from "next/font/google";
import './admin.css';

const oswald = Oswald({
    variable: "--font-heading-sans",
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

const inter = Inter({
    variable: "--font-body-sans",
    subsets: ["latin"],
    weight: ["400", "600"],
});

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <div className={`admin-body ${oswald.variable} ${inter.variable}`}>
            <Providers>
                <div className="min-h-screen bg-dark text-white flex">
                    {session && (
                        <aside className="sidebar">
                            <div className="p-6">
                                <Link href="/admin" className="flex items-center gap-2 group" style={{ textDecoration: 'none', display: 'flex' }}>
                                    <div className="logo-icon">
                                        <Newspaper size={18} className="text-black" style={{ color: 'black' }} />
                                    </div>
                                    <span className="logo-text">
                                        Admin
                                    </span>
                                </Link>
                            </div>

                            <div className="px-6 mb-6">
                                <div className="user-badge">
                                    <div className="avatar">
                                        {session.user?.image ? (
                                            <Image src={session.user.image} alt={session.user.name || 'User'} fill className="object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-xs font-bold" style={{ color: '#444' }}>
                                                {session.user?.name?.charAt(0) || 'A'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold truncate" style={{ margin: 0, fontSize: '0.875rem' }}>{session.user?.name}</p>
                                        <p className="text-dim uppercase tracking-widest font-bold" style={{ margin: 0, fontSize: '10px' }}>Admin Level</p>
                                    </div>
                                </div>
                            </div>

                            <nav className="flex-1 px-4 py-2" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <AdminNavLink href="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                                <AdminNavLink href="/admin/posts" icon={<Newspaper size={18} />} label="Exclusives" />
                                <AdminNavLink href="/admin/maine-minute" icon={<Clock size={18} />} label="Minute" />
                                <AdminNavLink href="/admin/lottery" icon={<Ticket size={18} />} label="Lottery" />
                                <AdminNavLink href="/admin/videos" icon={<Video size={18} />} label="Videos" />
                                <AdminNavLink href="/admin/authors" icon={<Users size={18} />} label="Authors" />
                            </nav>

                            <div className="p-4 border-t" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <AdminNavLink href="/" icon={<Home size={18} />} label="View Site" />
                                <SignOutButton />
                            </div>
                        </aside>
                    )}

                    {/* Main Content */}
                    <main className="flex-1" style={{
                        marginLeft: session ? '16rem' : '0',
                        padding: session ? '2rem' : '0',
                        background: 'linear-gradient(to bottom, #0a0a0a, #050505)',
                        minHeight: '100vh'
                    }}>
                        {children}
                    </main>
                </div>
            </Providers>
        </div>
    );
}

function AdminNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="admin-nav-link"
        >
            <span className="admin-nav-link-icon">
                {icon}
            </span>
            <span>{label}</span>
        </Link>
    );
}
