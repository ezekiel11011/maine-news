'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CloudSun, Ticket } from 'lucide-react';
import styles from './UtilityBar.module.css';
import { getLatestLotteryResults, LotteryResult } from '@/lib/lottery';

export default function UtilityBar() {
    const [lottery, setLottery] = useState<LotteryResult[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchLotto = async () => {
            const data = await getLatestLotteryResults();
            setLottery(data);
        };
        fetchLotto();

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % (lottery.length || 1));
        }, 5000);

        return () => clearInterval(timer);
    }, [lottery.length]);

    const activeLotto = lottery[currentIndex];

    return (
        <div className={styles.utilityBar}>
            <div className={styles.container}>
                <div className={styles.left}>
                    <Ticket size={14} className={styles.icon} />
                    <span className={styles.lottoLabel}>MAINE LOTTERY:</span>
                </div>

                <div className={styles.center}>
                    {activeLotto && (
                        <div className={styles.lottoItem} key={activeLotto.game}>
                            <span className={styles.gameName}>{activeLotto.game.toUpperCase()}</span>
                            <div className={styles.numbers}>
                                {activeLotto.numbers.map((n, i) => (
                                    <span key={i} className={styles.number}>{n}</span>
                                ))}
                                {activeLotto.extra && (
                                    <span className={`${styles.number} ${styles.extra}`}>{activeLotto.extra}</span>
                                )}
                            </div>
                            {activeLotto.jackpot && (
                                <span className={styles.jackpot}>{activeLotto.jackpot}</span>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.right}>
                    <span className={styles.date}>
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }).toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    );
}
