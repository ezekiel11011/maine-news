import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get the dev machine IP for physical device testing
const getApiBaseUrl = () => {
    // Change this to true if you want to test against your local Next.js server
    const USE_LOCAL_BACKEND = false;

    if (__DEV__ && USE_LOCAL_BACKEND) {
        const debuggerHost = Constants.expoConfig?.hostUri || '';
        const localhost = debuggerHost.split(':')[0];
        if (localhost) {
            return `http://${localhost}:3000`;
        }
    }

    // Default to the live production server
    return 'https://mainenewsnow.com';
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
    isOriginal?: boolean;
}

export interface ForecastSlice {
    name: string;
    shortForecast: string;
    detailedForecast: string;
    temperature?: number;
    temperatureUnit?: string;
    windSpeed?: string;
    windDirection?: string;
    precipitationChance?: number | null;
}

export interface OutlookDay {
    name: string;
    shortForecast: string;
    temperature?: number;
    temperatureUnit?: string;
    precipitationChance?: number | null;
}

export interface RegionForecast {
    id: string;
    label: string;
    location: string;
    status: 'ok' | 'error';
    errorMessage?: string;
    today?: ForecastSlice;
    tonight?: ForecastSlice;
    tomorrow?: ForecastSlice;
    outlook: OutlookDay[];
}

export interface WeatherAlert {
    id: string;
    event: string;
    headline: string;
    severity: string;
    description: string;
    effective?: string;
    ends?: string;
}

export interface WeatherReport {
    date: string;
    displayDate: string;
    generatedAt: string;
    permalinkPath: string;
    source: string;
    regions: RegionForecast[];
    alerts: WeatherAlert[];
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
        const response = await axios.get<any>(`${API_BASE_URL}/api/posts`);
        const data = response.data;

        // Handle both old array format and new { posts: [] } format
        let posts: Post[] = [];
        if (Array.isArray(data)) {
            posts = data;
        } else if (data && Array.isArray(data.posts)) {
            posts = data.posts;
        }

        // Cache posts for offline mode
        await AsyncStorage.setItem('cached_posts', JSON.stringify(posts));

        return posts;
    } catch (error) {
        console.error('Failed to fetch posts:', error);

        // Try to load from cache
        const cached = await AsyncStorage.getItem('cached_posts');
        if (cached) {
            try {
                const data = JSON.parse(cached);
                return Array.isArray(data) ? data : (data.posts || []);
            } catch (e) {
                return [];
            }
        }

        return [];
    }
}

export async function fetchWeatherReport(date?: string): Promise<WeatherReport | null> {
    const cacheKey = date ? `cached_weather_report_${date}` : 'cached_weather_report_latest';
    const url = date ? `${API_BASE_URL}/api/weather?date=${date}` : `${API_BASE_URL}/api/weather`;

    try {
        const response = await axios.get<WeatherReport>(url);
        const report = response.data;
        if (report) {
            await AsyncStorage.setItem(cacheKey, JSON.stringify(report));
        }
        return report || null;
    } catch (error) {
        console.error('Failed to fetch weather report:', error);

        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached) as WeatherReport;
            } catch (e) {
                return null;
            }
        }

        return null;
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
