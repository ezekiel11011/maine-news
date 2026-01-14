import Link from 'next/link';
import { Facebook, Instagram, Twitter, ShieldCheck } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.brand}>
                    <h2 className={styles.logo}>MAINE NEWS TODAY</h2>
                    <p className={styles.tagline}>Unbiased. Unafraid. Unfiltered.</p>

                    <div className={styles.socialLinks}>
                        <a href="https://www.facebook.com/share/1DWXu7JBHo/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <Facebook size={20} />
                        </a>
                        <a href="https://www.instagram.com/maine_news_today?igsh=NXo3OHJzMmRwbXRq&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <Instagram size={20} />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                            <Twitter size={20} />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Liberty Social" className={styles.libertySocial}>
                            <ShieldCheck size={20} />
                            <span>Liberty</span>
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
                </div>

                <div className={styles.bottomBar}>
                    <p>© {new Date().getFullYear()} Maine News Today. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
