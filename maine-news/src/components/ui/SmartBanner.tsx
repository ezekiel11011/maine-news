'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ExternalLink } from 'lucide-react';
import styles from './SmartBanner.module.css';

export default function SmartBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show on mobile and if not dismissed
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isDismissed = localStorage.getItem('smart-banner-dismissed');

        if (isMobile && !isDismissed) {
            setIsVisible(true);
        }
    }, []);

    const dismiss = () => {
        setIsVisible(false);
        localStorage.setItem('smart-banner-dismissed', 'true');
    };

    if (!isVisible) return null;

    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.mainenewstoday.app";

    return (
        <div className={styles.banner}>
            <button onClick={dismiss} className={styles.closeBtn} aria-label="Dismiss">
                <X size={16} />
            </button>
            <div className={styles.iconWrapper}>
                <Image src="/favicon.ico" alt="App Icon" width={40} height={40} className={styles.icon} />
            </div>
            <div className={styles.info}>
                <span className={styles.title}>Maine News Now</span>
                <span className={styles.subtitle}>Get the full experience in our app</span>
            </div>
            <a href={playStoreUrl} target="_blank" rel="noopener noreferrer" className={styles.openBtn}>
                OPEN
                <ExternalLink size={12} />
            </a>
        </div>
    );
}
