import HomeFeed from '@/components/home/HomeFeed';
import { Metadata } from 'next';
import { db } from '@/db';
import { posts as dbPosts } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const metadata: Metadata = {
  title: 'Home | Maine News Now',
  description: 'The latest news, politics, and stories from across the great state of Maine.',
};

export const dynamic = 'force-dynamic';

export default async function Home() {
  const authoredPosts = await db.query.posts.findMany({
    orderBy: [desc(dbPosts.publishedDate)],
  });

  const formattedPosts = authoredPosts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    image: post.image || undefined,
    category: post.category,
    isNational: post.isNational || false,
    publishedDate: post.publishedDate.toISOString(),
    author: post.author,
    isOriginal: post.isOriginal
  }));

  return (
    <div>
      <HomeFeed
        initialPosts={formattedPosts}
      />
    </div>
  );
}
