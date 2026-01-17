import Link from 'next/link';
import Image from 'next/image';
import styles from './StoryCard.module.css';
import { formatTimeAgo } from '@/utils/formatDate';
/* ... */
interface StoryCardProps {
    title: string;
    image?: string;
    slug: string;
    category?: string;
    isNational?: boolean;
    publishedDate?: string;
    priority?: boolean;
}

export default function StoryCard({ title, image, slug, category, isNational, publishedDate, priority = false }: StoryCardProps) {
    const fallbackImage = "/hero-fallback.jpeg";

    return (
        <Link href={`/article/${slug}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                <Image
                    src={image || fallbackImage}
                    alt={title}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={priority}
                />
            </div>
            <div className={styles.content}>
                <div className={styles.metaRow}>
                    {isNational && <span className={styles.nationalBadge}>NATIONAL</span>}
                    {category && <span className={styles.category}>{category}</span>}
                    {publishedDate && <span className={styles.date}>{formatTimeAgo(publishedDate)}</span>}
                </div>
                <h3 className={styles.title}>{title}</h3>
            </div>
        </Link>
    );
}
