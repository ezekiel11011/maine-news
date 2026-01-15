import Link from 'next/link';
import { Home } from 'lucide-react';
import styles from './not-found.module.css';

export default function NotFound() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.code}>404</h1>
                <h2 className={styles.title}>Page Not Found</h2>
                <p className={styles.message}>
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link href="/" className={styles.homeButton}>
                    <Home size={20} />
                    <span>Back to Homepage</span>
                </Link>
            </div>
        </div>
    );
}
