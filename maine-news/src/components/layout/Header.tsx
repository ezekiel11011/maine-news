import Link from 'next/link';
import Image from 'next/image';
import { Search, CloudSun, Facebook, Instagram, Youtube } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logoWrapper}>
                <Image
                    src="/maine-news-now.png"
                    alt="Maine News Now"
                    width={180}
                    height={40}
                    className={styles.logoImage}
                    priority
                />
                <span className={styles.siteName}>Maine News Now</span>
            </Link>

            <nav className={styles.desktopNav}>
                <Link href="/" className={styles.desktopNavLink}>Home</Link>
                <Link href="/latest" className={styles.desktopNavLink}>Latest</Link>
                <Link href="/sections" className={styles.desktopNavLink}>Sections</Link>
                <Link href="/opinion" className={styles.desktopNavLink}>Opinion</Link>
            </nav>

            <div className={styles.headerRightSection}>
                <div className={styles.topActionsRow}>
                    <Link href="/submit" className={styles.tipButton} id="send-tip-header">
                        <span>Send News Tip</span>
                    </Link>
                    <Link href="/weather" className={styles.iconButton} aria-label="Weather">
                        <CloudSun size={22} strokeWidth={1.5} />
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
                <a href="https://x.com/MaineNews_Now" target="_blank" rel="noopener noreferrer" className={styles.socialBarLink} aria-label="X">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231h0.001zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" fill="#000000" />
                    </svg>
                </a>
                <a href="https://www.youtube.com/@MaineNewsToday" target="_blank" rel="noopener noreferrer" className={styles.socialBarLink}>
                    <Youtube size={16} color="#FF0000" />
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
