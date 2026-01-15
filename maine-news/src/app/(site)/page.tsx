import { reader } from '@/lib/reader';
import HomeFeed from '@/components/home/HomeFeed';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const [manualPosts, scrapedPosts] = await Promise.all([
    reader.collections.posts.all(),
    reader.collections.scraped.all(),
  ]);

  const formattedManualPosts = manualPosts.map(post => ({
    id: post.slug,
    title: post.entry.title as string,
    slug: post.slug,
    image: (post.entry.image as any) || undefined,
    category: post.entry.category as string,
    publishedDate: post.entry.publishedDate as string || new Date().toISOString(),
    author: post.entry.author as string || 'Staff',
    isOriginal: true,
  }));

  const formattedScrapedPosts = scrapedPosts.map(post => ({
    id: post.slug,
    title: post.entry.title as string,
    slug: post.slug,
    image: (post.entry.image as unknown as string) || undefined,
    category: post.entry.category as string,
    publishedDate: post.entry.publishedDate as string || new Date().toISOString(),
    author: post.entry.author as string || 'Staff',
    isOriginal: false,
  }));

  const allPosts = [...formattedManualPosts, ...formattedScrapedPosts];

  // Sort by date (descending) initially
  allPosts.sort((a, b) => {
    const dateA = new Date(a.publishedDate).getTime();
    const dateB = new Date(b.publishedDate).getTime();
    return dateB - dateA;
  });

  return (
    <main className={styles.container}>
      <HomeFeed initialPosts={allPosts} />
    </main>
  );
}
