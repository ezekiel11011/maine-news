import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.brand}>
                    <h2 className={styles.logo}>Maine News Now</h2>
                    <p className={styles.tagline}>Unbiased. Unafraid. Unfiltered.</p>

                    <div className={styles.socialLinks}>
                        <a href="https://www.facebook.com/share/1DWXu7JBHo/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <Facebook size={24} color="#1877F2" fill="#1877F2" />
                        </a>
                        <a href="https://www.instagram.com/maine_news_today?igsh=NXo3OHJzMmRwbXRq&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <Instagram size={24} color="#E4405F" />
                        </a>
                        <a href="https://x.com/MaineNews_Now" target="_blank" rel="noopener noreferrer" aria-label="X">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231h0.001zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" fill="#ffffff" />
                            </svg>
                        </a>
                        <a href="https://www.youtube.com/@MaineNewsToday" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                            <Youtube size={24} color="#FF0000" />
                        </a>
                        <a href="https://www.mylibertysocial.com/app/pages/200" target="_blank" rel="noopener noreferrer" aria-label="Liberty Social" className={styles.libertySocialIcon}>
                            <Image src="/liberty-social.png" alt="Liberty Social" width={24} height={24} />
                        </a>
                    </div>
                </div>

                <div className={styles.links}>
                    <div className={styles.linkGroup}>
                        <h3>Platform</h3>
                        <Link href="/">Home</Link>
                        <Link href="/latest">Latest</Link>
                        <Link href="/sections">Sections</Link>
                        <Link href="/submit">Submit a Story</Link>
                    </div>

                    <div className={styles.linkGroup}>
                        <h3>Company</h3>
                        <Link href="/about">About Us</Link>
                        <Link href="/privacy">Privacy Policy</Link>
                        <Link href="/terms">Terms of Service</Link>
                    </div>

                    <div className={styles.linkGroup}>
                        <h3>Download Our App</h3>
                        <div className={styles.appLinksGroup}>
                            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className={styles.storeBadge}>
                                <div className={styles.badgeIcon}>
                                    <Image src="/App_Store.svg" alt="App Store" width={24} height={24} />
                                </div>
                                <div className={styles.badgeText}>
                                    <span className={styles.badgeSmall}>Download on</span>
                                    <span className={styles.badgeLarge}>App Store</span>
                                </div>
                            </a>
                            <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className={styles.storeBadge}>
                                <div className={styles.badgeIcon}>
                                    <Image src="/Google_Play.svg" alt="Google Play" width={24} height={24} />
                                </div>
                                <div className={styles.badgeText}>
                                    <span className={styles.badgeSmall}>Get it on</span>
                                    <span className={styles.badgeLarge}>Google Play</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <p>© {new Date().getFullYear()} Maine News Now. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
