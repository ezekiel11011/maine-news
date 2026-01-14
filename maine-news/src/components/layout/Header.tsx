import Link from 'next/link';
import Image from 'next/image';
import { Search, Menu, CloudSun, Facebook, Instagram, Twitter, ShieldCheck } from 'lucide-react';
import styles from './Header.module.css';

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

            <div className={styles.headerRightSection}>
                <div className={styles.topActionsRow}>
                    <Link href="/weather" className={styles.iconButton} aria-label="Weather">
                        <CloudSun size={24} strokeWidth={1.5} color="var(--color-accent)" />
                    </Link>
                    <Link href="/submit" className={styles.tipButton} id="send-tip-header">
                        <span>Send Tip</span>
                    </Link>
                    <Link href="/search" className={styles.iconButton} aria-label="Search">
                        <Search size={22} strokeWidth={1.5} />
                    </Link>
                </div>
            </div>

            <div className={styles.socialBar}>
                <a href="https://www.facebook.com/share/1DWXu7JBHo/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className={styles.socialBarLink}>
                    <Facebook size={16} color="#1877F2" fill="#1877F2" />
                </a>
                <a href="https://www.instagram.com/maine_news_today?igsh=NXo3OHJzMmRwbXRq&utm_source=qr" target="_blank" rel="noopener noreferrer" className={styles.socialBarLink}>
                    <Instagram size={16} color="#E4405F" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className={styles.socialBarLink}>
                    <Twitter size={16} color="#1DA1F2" fill="#1DA1F2" />
                </a>
                <a href="https://www.mylibertysocial.com/app/pages/200" target="_blank" rel="noopener noreferrer" aria-label="Liberty Social" className={styles.socialBarLink}>
                    <div className={styles.socialIconWrapper}>
                        <Image src="/liberty-social.png" alt="Liberty Social" width={16} height={16} />
                    </div>
                </a>
            </div>
        </header>
    );
}
