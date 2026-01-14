'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock, Grid, Search, MessageSquarePlus } from 'lucide-react';
import styles from './BottomNav.module.css';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Latest', href: '/latest', icon: Clock },
        { label: 'Submit', href: '/submit', icon: MessageSquarePlus },
        { label: 'Sections', href: '/sections', icon: Grid },
        { label: 'Search', href: '/search', icon: Search },
    ];

    return (
        <>
            <div className={styles.navProxy} aria-hidden="true" />
            <nav className={styles.bottomNav}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                            {isActive && <span className={styles.navLabel}>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
