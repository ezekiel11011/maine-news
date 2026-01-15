'use client';

import { useState } from 'react';
import { Share2, Volume2, X, Copy, Check } from 'lucide-react';
import styles from './ArticleActions.module.css';

interface ArticleActionsProps {
    title: string;
    url: string;
}

export default function ArticleActions({ title, url }: ArticleActionsProps) {
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleSpeak = () => {
        if ('speechSynthesis' in window) {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            } else {
                const articleText = document.querySelector('[data-article-body]')?.textContent || '';
                const utterance = new SpeechSynthesisUtterance(articleText);
                utterance.onend = () => setIsSpeaking(false);
                window.speechSynthesis.speak(utterance);
                setIsSpeaking(true);
            }
        } else {
            alert('Text-to-speech is not supported in your browser.');
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    url,
                });
            } catch {
                // User cancelled or error occurred
                setShowShareModal(true);
            }
        } else {
            setShowShareModal(true);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <>
            <div className={styles.actions}>
                <button
                    className={`${styles.actionButton} ${isSpeaking ? styles.active : ''}`}
                    onClick={handleSpeak}
                    aria-label={isSpeaking ? 'Stop reading' : 'Listen to article'}
                >
                    <Volume2 size={24} />
                    <span className={styles.buttonText}>{isSpeaking ? 'Stop' : 'Listen'}</span>
                </button>
                <button
                    className={styles.actionButton}
                    onClick={handleShare}
                    aria-label="Share article"
                >
                    <Share2 size={24} />
                    <span className={styles.buttonText}>Share</span>
                </button>
            </div>

            {showShareModal && (
                <div className={styles.modalOverlay} onClick={() => setShowShareModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Share Article</h3>
                            <button
                                className={styles.closeButton}
                                onClick={() => setShowShareModal(false)}
                                aria-label="Close"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <p className={styles.articleTitle}>{title}</p>

                            <div className={styles.linkContainer}>
                                <input
                                    type="text"
                                    value={url}
                                    readOnly
                                    className={styles.linkInput}
                                />
                                <button
                                    className={styles.copyButton}
                                    onClick={handleCopyLink}
                                >
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
