import Link from 'next/link';
import Image from 'next/image';
import styles from './StoryCard.module.css';

interface StoryCardProps {
    title: string;
    image?: string;
    slug: string;
    category?: string;
    priority?: boolean;
}

export default function StoryCard({ title, image, slug, category, priority = false }: StoryCardProps) {
    const fallbackImage = "/hero-fallback.jpeg"; // Assuming this exists or using the one from the project

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
                {category && <span className={styles.category}>{category}</span>}
                <h3 className={styles.title}>{title}</h3>
            </div>
        </Link>
    );
}
