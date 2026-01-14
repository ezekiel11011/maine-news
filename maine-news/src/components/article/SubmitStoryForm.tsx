'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import styles from './SubmitStoryForm.module.css';

export default function SubmitStoryForm() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        title: '',
        name: '',
        email: '',
        content: '',
        urgency: 'Standard'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/submit-story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to submit');

            setStatus('success');
            setFormData({ title: '', name: '', email: '', content: '', urgency: 'Standard' });
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className={styles.successContainer}>
                <CheckCircle size={64} className={styles.successIcon} />
                <h2>Submission Received</h2>
                <p>Thank you for contributing to Maine News Today. Our editorial team will review your tip shortly.</p>
                <button onClick={() => setStatus('idle')} className={styles.resetButton}>Submit Another</button>
            </div>
        );
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
                <h1>Submit a Story</h1>
                <p>Share a tip, photo, or full story with our newsroom. Your identity can remain anonymous upon request.</p>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="title">Headline / Subject</label>
                <input
                    id="title"
                    type="text"
                    placeholder="e.g. Traffic Incident on I-95"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label htmlFor="name">Your Name (Optional)</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="email">Contact Email</label>
                    <input
                        id="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label>Urgency Level</label>
                <div className={styles.radioGroup}>
                    {['Standard', 'Urgent', 'Breaking'].map((u) => (
                        <button
                            key={u}
                            type="button"
                            className={`${styles.radioTab} ${formData.urgency === u ? styles.activeRadio : ''}`}
                            onClick={() => setFormData({ ...formData, urgency: u })}
                        >
                            {u}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="content">Details / Story Content</label>
                <textarea
                    id="content"
                    required
                    rows={8}
                    placeholder="Provide as much detail as possible..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
            </div>

            {status === 'error' && (
                <div className={styles.errorMessage}>
                    <AlertCircle size={20} />
                    <span>Failed to submit. Please try again.</span>
                </div>
            )}

            <button type="submit" className={styles.submitButton} disabled={status === 'loading'}>
                {status === 'loading' ? (
                    <>
                        <Loader2 size={20} className={styles.spinner} />
                        <span>Sending...</span>
                    </>
                ) : (
                    <>
                        <Send size={20} />
                        <span>Transmit Submission</span>
                    </>
                )}
            </button>
        </form>
    );
}
