import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.brand}>
                    <h2 className={styles.logo}>MAINE NEWS TODAY</h2>
                    <p className={styles.tagline}>Unbiased. Unafraid. Unfiltered.</p>
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
