import Link from 'next/link';
import Image from 'next/image';
import { Search, Menu } from 'lucide-react';
import styles from './Header.module.css';

// Basic placeholders for interactivity
// In a real app we would use a context or state for these
// For now, ensuring UI elements are present as per spec

export default function Header() {
    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logoWrapper}>
                <Image
                    src="/maine-news-longer-img.jpeg"
                    alt="Maine News Today"
                    width={180}
                    height={40}
                    className={styles.logoImage}
                    priority
                />
                <span className={styles.siteName}>Maine News</span>
            </Link>

            <nav className={styles.desktopNav}>
                <Link href="/" className={styles.desktopNavLink}>Home</Link>
                <Link href="/latest" className={styles.desktopNavLink}>Latest</Link>
                <Link href="/sections" className={styles.desktopNavLink}>Sections</Link>
                <Link href="/opinion" className={styles.desktopNavLink}>Opinion</Link>
            </nav>

            <div className={styles.actions}>
                <Link href="/submit" className={styles.tipButton}>
                    <span>Send Tip</span>
                </Link>
                <Link href="/search" className={styles.iconButton} aria-label="Search">
                    <Search size={22} strokeWidth={1.5} />
                </Link>
            </div>
        </header>
    );
}
