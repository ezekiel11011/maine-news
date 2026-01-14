import React from 'react';
import Image from 'next/image';
import styles from '../privacy/Policy.module.css';

export default function AboutPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>About Maine News Today</h1>
            <div className={styles.content}>
                <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Image
                        src="/nathan.jpeg"
                        alt="Nathan Reardon"
                        width={200}
                        height={200}
                        style={{ borderRadius: '50%', marginBottom: '1.5rem', objectFit: 'cover', border: '3px solid var(--color-accent)' }}
                    />
                    <p style={{ fontSize: '1.2rem', maxWidth: '800px' }}>
                        Founded by <strong>Nathan Reardon</strong> in 2025 because he was tired of local newspapers bias reporting.
                    </p>
                </div>

                <p><strong>Unbiased. Unafraid. Unfiltered.</strong></p>

                <section>
                    <h2>Our Mission</h2>
                    <p>Maine News Today is dedicated to providing high-fidelity, real-time news coverage for the people of Maine and beyond. In an era of increasing misinformation, we stand as a beacon of editorial minimalism and live intelligence.</p>
                </section>

                <section>
                    <h2>Live Intelligence</h2>
                    <p>Our platform leverages advanced aggregation and scraping technologies to curate the most relevant stories across local and national landscapes. From the Downeast coast to the Northern borders, we filter the signal from the noise.</p>
                </section>

                <section>
                    <h2>Editorial Minimalism</h2>
                    <p>We believe in a reading experience that honors the content. Our design system is engineered for high performance, accessibility, and focus. No distractions, just journalism.</p>
                </section>

                <section>
                    <h2>Contact Us</h2>
                    <p>Have a tip or a question? Reach out to our team at <a href="mailto:support@mymainenews.com" style={{ color: 'var(--color-accent)' }}>support@mymainenews.com</a>.</p>
                </section>

                <p>© 2026 Maine News Today. All rights reserved.</p>
            </div>
        </main>
    );
}
