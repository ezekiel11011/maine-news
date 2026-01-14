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

            <div className={styles.actionsContainer}>
                <div className={styles.topActions}>
                    <Link href="/weather" className={styles.iconButton} aria-label="Weather">
                        <CloudSun size={24} strokeWidth={1.5} color="var(--color-accent)" />
                    </Link>
                    <Link href="/submit" className={styles.tipButton}>
                        <span>Send Tip</span>
                    </Link>
                    <Link href="/search" className={styles.iconButton} aria-label="Search">
                        <Search size={22} strokeWidth={1.5} />
                    </Link>
                </div>

                <div className={styles.headerSocials}>
                    <a href="https://www.facebook.com/share/1DWXu7JBHo/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
                        <Facebook size={14} />
                    </a>
                    <a href="https://www.instagram.com/maine_news_today?igsh=NXo3OHJzMmRwbXRq&utm_source=qr" target="_blank" rel="noopener noreferrer">
                        <Instagram size={14} />
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <Twitter size={14} />
                    </a>
                    <a href="https://www.mylibertysocial.com/app/pages/200" target="_blank" rel="noopener noreferrer" aria-label="Liberty Social">
                        <div className={styles.socialIconWrapper}>
                            <Image src="/liberty-social.png" alt="Liberty Social" width={14} height={14} />
                        </div>
                    </a>
                </div>
            </div>
        </header>
    );
}
