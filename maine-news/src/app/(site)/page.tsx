import HomeFeed from '@/components/home/HomeFeed';
import { reader } from '@/lib/reader';
import { Metadata } from 'next';
import { db } from '@/db';
import { posts as dbPosts, maineMinute } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export const metadata: Metadata = {
  title: 'Home | Maine News Now',
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
    isNational: post.entry.isNational as boolean,
    publishedDate: post.entry.publishedDate as string || new Date().toISOString(),
    author: post.entry.author as string || 'Staff',
    isOriginal: !post.entry.sourceUrl && ['Staff', 'Maine News Now', 'Nathan Reardon'].includes(post.entry.author as string || '')
  }));

  // Transform database posts (these are always original)
  const formattedAuthoredPosts = authoredPosts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    image: post.image || undefined,
    category: post.category,
    isNational: post.isNational || false,
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

  // Fetch Maine Minute (Priority: Database)
  let latestMinute = null;
  const dbMinutes = await db.query.maineMinute.findMany({
    orderBy: [desc(maineMinute.date)],
    limit: 1
  });

  if (dbMinutes.length > 0) {
    const entry = dbMinutes[0];
    const stories = await Promise.all((entry.stories as any[]).map(async (s: any) => {
      // Resolve post title from either source
      let title = 'Untitled Story';
      const post = await reader.collections.posts.read(s.postSlug);
      if (post) {
        title = post.title as string;
      } else {
        const dbPost = await db.query.posts.findFirst({
          where: eq(dbPosts.slug, s.postSlug)
        });
        if (dbPost) title = dbPost.title as string;
      }
      return { title, slug: s.postSlug };
    }));
    latestMinute = {
      tagline: entry.tagline as string,
      stories
    };
  } else {
    // Fallback: Keystatic
    const minutes = await reader.collections.maineMinute.all();
    const sortedMinutes = minutes.sort((a, b) => b.slug.localeCompare(a.slug));
    const latestMinuteEntry = sortedMinutes[0];

    if (latestMinuteEntry) {
      const stories = await Promise.all(((latestMinuteEntry.entry as any).stories as any[]).map(async (s: any) => {
        if (!s.post) return null;
        const post = await reader.collections.posts.read(s.post);
        return {
          title: (post as any)?.title || 'Untitled Story',
          slug: s.post as string
        };
      }));

      latestMinute = {
        tagline: (latestMinuteEntry.entry as any).tagline as string,
        stories: stories.filter((s): s is { title: string; slug: string } => s !== null)
      };
    }
  }

  return (
    <div>
      <HomeFeed
        initialPosts={allPosts}
        latestMinute={latestMinute}
      />
    </div>
  );
}
