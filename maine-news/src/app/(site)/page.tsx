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

  // Fetch Maine Minute Config
  let latestMinute = null;

  // 1. Check for manual DB entry for TODAY
  const today = new Date().toISOString().split('T')[0];
  const dbMinutes = await db.query.maineMinute.findMany({
    orderBy: [desc(maineMinute.date)],
    limit: 1
  });

  const isManualEntry = dbMinutes.length > 0 && dbMinutes[0].date === today;

  if (isManualEntry) {
    const entry = dbMinutes[0];
    const stories = await Promise.all((entry.stories as any[]).map(async (s: any) => {
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
    // 2. Auto-Generate from recent posts (Last 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Get all recent posts
    const recentPosts = allPosts.filter(post =>
      new Date(post.publishedDate) >= yesterday
    ); // 'allPosts' is already sorted by date

    // Ensure Category Diversity
    const uniqueCategories = Array.from(new Set(recentPosts.map(p => p.category || 'general')));
    const selectedStories: any[] = [];
    const selectedSlugs = new Set();

    // Pick top story from each category first
    uniqueCategories.forEach(cat => {
      const topForCat = recentPosts.find(p => (p.category || 'general') === cat);
      if (topForCat) {
        selectedStories.push(topForCat);
        selectedSlugs.add(topForCat.slug);
      }
    });

    // Fill remaining slots up to 15
    for (const post of recentPosts) {
      if (selectedStories.length >= 15) break;
      if (!selectedSlugs.has(post.slug)) {
        selectedStories.push(post);
        selectedSlugs.add(post.slug);
      }
    }

    // Sort final selection by date descending
    selectedStories.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

    if (selectedStories.length > 0) {
      latestMinute = {
        tagline: `Live daily digest. ${selectedStories.length} headlines from across Maine.`,
        stories: selectedStories.map(p => ({
          title: p.title,
          slug: p.slug
        }))
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
