import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get the dev machine IP for physical device testing
const getApiBaseUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri || '';
    const localhost = debuggerHost.split(':')[0];

    if (localhost) {
        return `http://${localhost}:3000`;
    }
    return 'http://localhost:3000';
};

export const API_BASE_URL = getApiBaseUrl();

export interface Post {
    slug: string;
    title: string;
    author: string;
    category: string;
    publishedDate: string;
    image?: string;
    excerpt?: string;
    content?: string;
}

export const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
};

export interface ApiResponse {
    posts: Post[];
    count: number;
}

// Fetch all posts
export async function fetchPosts(): Promise<Post[]> {
    try {
        const response = await axios.get<Post[]>(`${API_BASE_URL}/api/posts`);

        // Cache posts for offline mode
        await AsyncStorage.setItem('cached_posts', JSON.stringify(response.data));

        return response.data;
    } catch (error) {
        console.error('Failed to fetch posts:', error);

        // Try to load from cache
        const cached = await AsyncStorage.getItem('cached_posts');
        if (cached) {
            return JSON.parse(cached);
        }

        return [];
    }
}

// Fetch single post with content
export async function fetchPostBySlug(slug: string): Promise<any> {
    const cacheKey = `cached_article_${slug}`;
    const slugsKey = 'cached_article_slugs';

    try {
        const response = await axios.get(`${API_BASE_URL}/api/posts?slug=${slug}`);
        const postData = response.data;

        // Cache the full article
        if (postData) {
            await AsyncStorage.setItem(cacheKey, JSON.stringify(postData));

            // Manage the list of last 10 cached articles
            const currentSlugsJson = await AsyncStorage.getItem(slugsKey);
            let currentSlugs: string[] = currentSlugsJson ? JSON.parse(currentSlugsJson) : [];

            // Remove if already exists (to move to front)
            currentSlugs = currentSlugs.filter(s => s !== slug);
            // Add to front
            currentSlugs.unshift(slug);

            // Keep only top 10
            if (currentSlugs.length > 10) {
                const slugsToRemove = currentSlugs.slice(10);
                for (const s of slugsToRemove) {
                    await AsyncStorage.removeItem(`cached_article_${s}`);
                }
                currentSlugs = currentSlugs.slice(0, 10);
            }

            await AsyncStorage.setItem(slugsKey, JSON.stringify(currentSlugs));
        }

        return postData;
    } catch (error) {
        console.error(`Failed to fetch post ${slug}:`, error);

        // Try to load from cache
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            console.log(`Loading ${slug} from offline cache`);
            return JSON.parse(cached);
        }

        return null;
    }
}

// Search posts
export function searchPosts(posts: Post[], query: string): Post[] {
    const lowerQuery = query.toLowerCase();
    return posts.filter(
        post =>
            post.title.toLowerCase().includes(lowerQuery) ||
            post.author.toLowerCase().includes(lowerQuery) ||
            post.category.toLowerCase().includes(lowerQuery)
    );
}

// Filter by category
export function filterByCategory(posts: Post[], category: string): Post[] {
    if (category === 'all') return posts;
    return posts.filter(post => post.category === category);
}

export interface Video {
    id: string;
    title: string;
    videoUrl: string;
    thumbnail: string;
    duration: string;
    views: string;
    category: string;
    publishedDate: string;
    isLive?: boolean;
}

// Fetch all videos
export async function fetchVideos(): Promise<Video[]> {
    try {
        const response = await axios.get<{ videos: Video[] }>(`${API_BASE_URL}/api/videos`);
        const videos = response.data.videos;

        // Cache videos
        await AsyncStorage.setItem('cached_videos', JSON.stringify(videos));

        return videos;
    } catch (error) {
        console.error('Failed to fetch videos:', error);

        // Try to load from cache
        const cached = await AsyncStorage.getItem('cached_videos');
        if (cached) {
            return JSON.parse(cached);
        }

        return [];
    }
}
