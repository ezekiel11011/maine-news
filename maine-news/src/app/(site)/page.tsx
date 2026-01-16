import HomeFeed from '@/components/home/HomeFeed';
import { reader } from '@/lib/reader';
import { Metadata } from 'next';
import { db } from '@/db';
import { posts as dbPosts } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const metadata: Metadata = {
  title: 'Home | Maine News Today',
  description: 'The latest news, politics, and stories from across the great state of Maine.',
};

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch from both sources with error handling
  let authoredPosts: any[] = [];

  try {
    authoredPosts = await db.query.posts.findMany({
      orderBy: [desc(dbPosts.publishedDate)],
    });
  } catch (error) {
    console.error('Database connection failed, using Keystatic posts only:', error);
  }

  const keystaticPosts = await reader.collections.posts.all();

  // Transform filesystem posts
  const formattedKeystaticPosts = keystaticPosts.map(post => ({
    id: post.slug,
    title: post.entry.title as string,
    slug: post.slug,
    image: (post.entry.image as unknown as string) || undefined,
    category: post.entry.category as string,
    publishedDate: post.entry.publishedDate as string || new Date().toISOString(),
    author: post.entry.author as string || 'Staff',
    isOriginal: !post.entry.sourceUrl && ['Staff', 'Maine News Today', 'Nathan Reardon'].includes(post.entry.author as string || '')
  }));

  // Transform database posts (these are always original)
  const formattedAuthoredPosts = authoredPosts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    image: post.image || undefined,
    category: post.category,
    publishedDate: post.publishedDate.toISOString(),
    author: post.author,
    isOriginal: true
  }));

  // Merge all posts
  const allPosts = [...formattedAuthoredPosts, ...formattedKeystaticPosts];

  // Sort by date (descending)
  allPosts.sort((a, b) => {
    const dateA = new Date(a.publishedDate).getTime();
    const dateB = new Date(b.publishedDate).getTime();
    return dateB - dateA;
  });

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{
        background: '#ff0000',
        color: 'white',
        padding: '1rem',
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: '1rem'
      }}>
        DEBUG DIAGNOSTIC: Keystatic Posts: {keystaticPosts.length} | Database Posts: {authoredPosts.length} | Total: {allPosts.length}
      </div>
      <HomeFeed initialPosts={allPosts} />
    </div>
  );
}
