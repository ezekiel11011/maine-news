'use client';

import { useEffect, useState } from 'react';
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
        { label: 'Minute', href: '/news/maine-minute', isMinute: true },
    ];

    const [visible, setVisible] = useState(true);
    const [prevScrollPos, setPrevScrollPos] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset;
            const isScrollingUp = prevScrollPos > currentScrollPos;

            // Show if scrolling up or at the top
            setVisible(isScrollingUp || currentScrollPos < 10);
            setPrevScrollPos(currentScrollPos);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [prevScrollPos]);

    return (
        <>
            <div className={`${styles.navProxy} ${visible ? '' : styles.hidden}`} aria-hidden="true" />
            <nav className={`${styles.bottomNav} ${visible ? '' : styles.hidden}`}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''} ${item.isMinute ? styles.minuteLink : ''}`}
                        >
                            {item.isMinute ? (
                                <div className={`${styles.minuteLogoWrapper} ${isActive ? styles.minuteLogoActive : ''}`}>
                                    <img
                                        src="/maine-minutes.png"
                                        alt="Minute"
                                        className={styles.minuteLogo}
                                    />
                                </div>
                            ) : (
                                item.icon && <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                            )}
                            {isActive && !item.isMinute && <span className={styles.navLabel}>{item.label}</span>}
                            {item.isMinute && <span className={styles.navLabel}>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
