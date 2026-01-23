'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import styles from './MaineMinuteBrief.module.css';

interface MinuteShareToolsProps {
    url: string;
    title: string;
}

export default function MinuteShareTools({ url, title }: MinuteShareToolsProps) {
    const [copied, setCopied] = useState(false);
    const encodedUrl = useMemo(() => encodeURIComponent(url), [url]);
    const encodedTitle = useMemo(() => encodeURIComponent(title), [title]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };

    return (
        <div className={styles.shareBox}>
            <div className={styles.shareInfo}>
                <div className={styles.shareTitle}>Share this brief</div>
                <div className={styles.shareLink}>{url}</div>
            </div>
            <div className={styles.shareActions}>
                <a
                    className={styles.shareButton}
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Facebook
                </a>
                <a
                    className={styles.shareButton}
                    href={`https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    X
                </a>
                <a
                    className={styles.shareButton}
                    href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
                >
                    Email
                </a>
                <button type="button" className={styles.copyButton} onClick={handleCopy}>
                    {copied ? 'Copied' : 'Copy link'}
                </button>
            </div>
            <div className={styles.shareSocialRow}>
                <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on Facebook"
                    className={styles.shareSocialButton}
                >
                    <Facebook size={20} color="#1877F2" fill="#1877F2" />
                </a>
                <a
                    href={`https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on X"
                    className={styles.shareSocialButton}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231h0.001zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" fill="#ffffff" />
                    </svg>
                </a>
                <a
                    href="https://www.instagram.com/maine_news_today?igsh=NXo3OHJzMmRwbXRq&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className={styles.shareSocialButton}
                >
                    <Instagram size={20} color="#E4405F" />
                </a>
                <a
                    href="https://www.youtube.com/@MaineNewsToday"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className={styles.shareSocialButton}
                >
                    <Youtube size={20} color="#FF0000" />
                </a>
                <a
                    href="https://www.mylibertysocial.com/app/pages/200"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Liberty Social"
                    className={`${styles.shareSocialButton} ${styles.shareLibertyIcon}`}
                >
                    <Image src="/liberty-social.png" alt="Liberty Social" width={20} height={20} />
                </a>
            </div>
        </div>
    );
}
