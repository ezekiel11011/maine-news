'use client';

import { useMemo, useState } from 'react';
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
        </div>
    );
}
