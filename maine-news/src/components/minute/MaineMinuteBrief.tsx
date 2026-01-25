import Link from 'next/link';
import styles from './MaineMinuteBrief.module.css';
import { EDITORIAL_DISCLAIMER_PARAGRAPHS } from '@/lib/editorialDisclaimer';
import type { MaineMinuteReport } from '@/lib/maineMinuteReport';
import MinuteShareTools from './MinuteShareTools';

interface MaineMinuteBriefProps {
    report: MaineMinuteReport;
}

export default function MaineMinuteBrief({ report }: MaineMinuteBriefProps) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mainenewsnow.com';
    const permalink = `${siteUrl}/the-maine-minute/${report.date}`;
    const dateLabel = new Date(report.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <article className={styles.container}>
            <header className={styles.header}>
                <p className={styles.kicker}>The Maine Minute</p>
                <h1 className={styles.title}>The Maine Minute — {dateLabel}</h1>
                <p className={styles.subhead}>{report.subhead}</p>
                <div className={styles.meta}>Data timestamp: {report.timestamp}</div>
            </header>

            <MinuteShareTools url={permalink} title={`The Maine Minute — ${dateLabel}`} />

            <section className={styles.body}>
                {report.sections.map(section => (
                    <div key={section.title} className={styles.section}>
                        <h2 className={styles.sectionTitle}>{section.title}</h2>
                        <p className={styles.sectionSummary}>{section.summary}</p>
                        {section.links.length > 0 && (
                            <div className={styles.sectionLinks}>
                                {section.links.map(link => (
                                    <Link
                                        key={`${section.title}-${link.slug}`}
                                        href={link.slug.startsWith('/') ? link.slug : `/article/${link.slug}`}
                                        className={styles.sectionLink}
                                    >
                                        {link.title}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </section>

            {report.lottery.length > 0 && (
                <section className={styles.lottery}>
                    <h2 className={styles.sectionTitle}>Lottery</h2>
                    <div className={styles.lotteryGrid}>
                        {report.lottery.map(entry => (
                            <div key={entry.game} className={styles.lotteryCard}>
                                <div className={styles.lotteryGame}>{entry.game}</div>
                                <div className={styles.lotteryNumbers}>
                                    {entry.numbers.map((num, index) => (
                                        <span key={`${entry.game}-${index}`} className={styles.lotteryBall}>{num}</span>
                                    ))}
                                    {entry.extra && (
                                        <span className={`${styles.lotteryBall} ${styles.lotteryExtra}`}>{entry.extra}</span>
                                    )}
                                </div>
                                {entry.jackpot && <div className={styles.lotteryJackpot}>{entry.jackpot}</div>}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {report.readMore.length > 0 && (
                <section className={styles.readMore}>
                    <h2 className={styles.sectionTitle}>Read Full Coverage</h2>
                    <div className={styles.readMoreLinks}>
                        {report.readMore.map(link => (
                            <Link key={link.slug} href={`/article/${link.slug}`} className={styles.readMoreLink}>
                                {link.title}
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </article>
    );
}
