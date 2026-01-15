'use client';

import { useRef, useEffect, useState } from 'react';
import styles from './LiveTicker.module.css';

interface LiveTickerProps {
    headlines: string[];
}

export default function LiveTicker({ headlines }: LiveTickerProps) {
    const items = headlines.length > 0 ? headlines : ["No breaking news at this time"];
    const [scrollWidth, setScrollWidth] = useState(0);
    const itemsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (itemsRef.current) {
            // Measure the width of the first set of items
            const firstSetWidth = itemsRef.current.scrollWidth / 2;
            setScrollWidth(firstSetWidth);
        }
    }, [items]);

    return (
        <div className={styles.container}>
            <div className={styles.label}>LIVE</div>
            <div className={styles.tickerWrapper}>
                <div
                    className={styles.track}
                    ref={itemsRef}
                    style={{
                        '--scroll-width': `${scrollWidth}px`
                    } as React.CSSProperties}
                >
                    {items.map((item, i) => (
                        <span key={i} className={styles.item}>{item} <span className={styles.separator}>///</span></span>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {items.map((item, i) => (
                        <span key={`dup-${i}`} className={styles.item}>{item} <span className={styles.separator}>///</span></span>
                    ))}
                </div>
            </div>
        </div>
    );
}
