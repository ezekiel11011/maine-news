import HomeFeed from '@/components/home/HomeFeed';
import { reader } from '@/lib/reader';

export default async function Home() {
  const posts = await reader.collections.posts.all();

  // Transform posts to match expected format
  const formattedPosts = posts.map(post => ({
    id: post.slug,
    title: post.entry.title,
    slug: post.slug,
    image: post.entry.image || undefined,
    category: post.entry.category,
    publishedDate: post.entry.publishedDate || new Date().toISOString(),
    author: post.entry.author || 'Staff'
  }));

  // Sort by date (descending) initially
  formattedPosts.sort((a, b) => {
    const dateA = new Date(a.publishedDate || '').getTime();
    const dateB = new Date(b.publishedDate || '').getTime();
    return dateB - dateA;
  });

  return (
    <div style={{ marginTop: '2rem' }}>
      <HomeFeed initialPosts={formattedPosts} />
    </div>
  );
}
