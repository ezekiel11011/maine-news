import Link from 'next/link';
import Image from 'next/image';
import styles from './MaineMinuteCard.module.css';

interface MinuteStory {
    title: string;
    slug: string;
}

interface MaineMinuteProps {
    tagline: string;
    stories: MinuteStory[];
}

export default function MaineMinuteCard({ tagline, stories }: MaineMinuteProps) {
    if (!stories || stories.length === 0) return null;

    return (
        <section className={styles.container}>
            <div className={styles.header}>
                <div className={styles.brand}>
                    <div className={styles.logoContainer}>
                        {/* Try to use the logo if it exists, otherwise fallback to text */}
                        <Image
                            src="/maine-minutes.png"
                            alt="The Maine Minute®️"
                            width={240}
                            height={60}
                            className={styles.logo}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                        <h2 className={styles.title}>The Maine Minute®️</h2>
                    </div>
                    <p className={styles.tagline}>{tagline}</p>
                </div>
                <Link href="/the-maine-minute" className={styles.ctaDesktop}>
                    Read the Full Minute →
                </Link>
            </div>

            <div className={styles.scroller}>
                <div className={styles.cardsGrid}>
                    {stories.map((story, i) => (
                        <Link
                            key={i}
                            href={`/article/${story.slug}`}
                            className={styles.storyCard}
                        >
                            <span className={styles.storyIndex}>0{i + 1}</span>
                            <h3 className={styles.storyTitle}>{story.title}</h3>
                        </Link>
                    ))}
                </div>
            </div>

            <Link href="/the-maine-minute" className={styles.ctaMobile}>
                Read the Full Minute →
            </Link>
        </section>
    );
}
