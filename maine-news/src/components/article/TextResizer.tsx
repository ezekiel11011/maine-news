'use client';

import { useState, useEffect } from 'react';
import { Type } from 'lucide-react';
import styles from './TextResizer.module.css';

export default function TextResizer() {
    const [fontSize, setFontSize] = useState(100); // percentage

    useEffect(() => {
        const articleBody = document.querySelector('[data-article-body]') as HTMLElement;
        if (articleBody) {
            articleBody.style.fontSize = `${fontSize}%`;
        }
    }, [fontSize]);

    const increaseSize = () => setFontSize(prev => Math.min(prev + 10, 150));
    const decreaseSize = () => setFontSize(prev => Math.max(prev - 10, 80));

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <button
                    onClick={decreaseSize}
                    className={styles.button}
                    aria-label="Decrease text size"
                >
                    <Type size={14} />
                </button>
                <div className={styles.label}>{fontSize}%</div>
                <button
                    onClick={increaseSize}
                    className={styles.button}
                    aria-label="Increase text size"
                >
                    <Type size={20} />
                </button>
            </div>
        </div>
    );
}
