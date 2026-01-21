'use client';

import type { MouseEvent } from 'react';
import Image from 'next/image';
import { useCallback } from 'react';
import styles from './Footer.module.css';

const APP_LINK = 'https://www.mainenewsnow.com/article';
const APP_STORE_URL = 'https://apps.apple.com';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.mainenewstoday.app';
const ANDROID_PACKAGE = 'com.mainenewstoday.app';

function isAndroid() {
    return /Android/i.test(navigator.userAgent || '');
}

function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent || '');
}

export default function StoreBadges() {
    const openAppOrStore = useCallback((platform: 'android' | 'ios', event: MouseEvent<HTMLAnchorElement>) => {
        if (!isAndroid() && !isIOS()) {
            return;
        }

        event.preventDefault();

        const fallbackUrl = platform === 'android' ? PLAY_STORE_URL : APP_STORE_URL;
        let fallbackTimer: number | undefined;

        const handleVisibility = () => {
            if (document.visibilityState === 'hidden') {
                if (fallbackTimer) window.clearTimeout(fallbackTimer);
                document.removeEventListener('visibilitychange', handleVisibility);
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        fallbackTimer = window.setTimeout(() => {
            window.location.href = fallbackUrl;
        }, 900);

        if (platform === 'android') {
            const intentUrl = `intent://www.mainenewsnow.com/article#Intent;scheme=https;package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`;
            window.location.href = intentUrl;
        } else {
            window.location.href = APP_LINK;
        }
    }, []);

    return (
        <div className={styles.appLinksGroup}>
            <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.storeBadge}
                onClick={(event) => openAppOrStore('ios', event)}
            >
                <div className={styles.badgeIcon}>
                    <Image src="/App_Store.svg" alt="App Store" width={24} height={24} />
                </div>
                <div className={styles.badgeText}>
                    <span className={styles.badgeSmall}>Download on</span>
                    <span className={styles.badgeLarge}>App Store</span>
                </div>
            </a>
            <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.storeBadge}
                onClick={(event) => openAppOrStore('android', event)}
            >
                <div className={styles.badgeIcon}>
                    <Image src="/Google_Play.svg" alt="Google Play" width={24} height={24} />
                </div>
                <div className={styles.badgeText}>
                    <span className={styles.badgeSmall}>Get it on</span>
                    <span className={styles.badgeLarge}>Google Play</span>
                </div>
            </a>
        </div>
    );
}
