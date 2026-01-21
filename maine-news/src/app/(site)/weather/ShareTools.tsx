'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './WeatherReport.module.css';

interface ShareToolsProps {
    permalinkPath: string;
    title: string;
}

export default function ShareTools({ permalinkPath, title }: ShareToolsProps) {
    const [shareUrl, setShareUrl] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setShareUrl(`${window.location.origin}${permalinkPath}`);
        }
    }, [permalinkPath]);

    const finalUrl = shareUrl || permalinkPath;
    const encodedUrl = useMemo(() => encodeURIComponent(finalUrl), [finalUrl]);
    const encodedTitle = useMemo(() => encodeURIComponent(title), [title]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(finalUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };

    return (
        <div className={styles.shareBox}>
            <div>
                <div className={styles.shareTitle}>Share this report</div>
                <div className={styles.shareLink}>{finalUrl}</div>
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
