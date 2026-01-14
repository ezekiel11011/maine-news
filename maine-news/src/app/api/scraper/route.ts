import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import TurndownService from 'turndown';

const parser = new Parser();
const turndown = new TurndownService();

// Maine towns/cities database for geographic filtering
const MAINE_LOCATIONS = [
    'Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn', 'Biddeford',
    'Sanford', 'Saco', 'Westbrook', 'Augusta', 'Waterville', 'Presque Isle',
    'Ellsworth', 'Bar Harbor', 'Rockland', 'Belfast', 'Camden', 'Brunswick',
    'Bath', 'Kennebunk', 'York', 'Kittery', 'Scarborough', 'Gorham', 'Falmouth',
    'Orono', 'Old Orchard Beach', 'Brewer', 'Caribou', 'Gardiner'
];

const REGIONS = {
    'Downeast': ['Ellsworth', 'Bar Harbor', 'Machias', 'Calais'],
    'Northern': ['Presque Isle', 'Caribou', 'Fort Kent', 'Houlton'],
    'Central': ['Augusta', 'Waterville', 'Bangor', 'Lewiston', 'Auburn'],
    'Southern': ['Portland', 'South Portland', 'Biddeford', 'Saco', 'Westbrook'],
    'Coastal': ['Rockland', 'Belfast', 'Camden', 'Bath', 'Brunswick']
};

// RSS Feed sources - Maine + National
const MAINE_FEEDS = [
    { url: 'https://www.maine.gov/tools/whatsnew/rss.php?id=portal-news', name: 'Maine.gov', type: 'maine' },
    { url: 'https://www.pressherald.com/feed/', name: 'Press Herald', type: 'maine' },
    { url: 'https://www.bangordailynews.com/feed/', name: 'Bangor Daily News', type: 'maine' },
];

const NATIONAL_FEEDS = [
    { url: 'https://moxie.foxnews.com/google-publisher/politics.xml', name: 'Fox News Politics', type: 'national' },
    { url: 'https://www.pbs.org/newshour/feeds/rss/politics', name: 'PBS NewsHour Politics', type: 'national' },
    { url: 'https://www.politico.com/rss/politicopicks.xml', name: 'Politico', type: 'national' },
];

const VIDEO_FEEDS = [
    { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6_K2_70rW3_8p_q6jM9Y5A', name: 'News Center Maine', type: 'broadcast' },
    { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCY7K2YmRIn25D0XU759kLXQ', name: 'WABI 5 News', type: 'broadcast' },
];

const ALL_FEEDS = [...MAINE_FEEDS, ...NATIONAL_FEEDS];

interface ScrapedVideo {
    title: string;
    videoUrl: string;
    thumbnail: string;
    duration: string;
    views: string;
    category: string;
    publishedDate: string;
    description: string;
    source: string;
}

// Topic keywords for auto-categorization
const TOPIC_KEYWORDS = {
    'local': ['town', 'city', 'community', 'local', 'municipal', 'school', 'county'],
    'politics': ['legislature', 'governor', 'election', 'vote', 'policy', 'bill', 'senate', 'house', 'congress', 'white house'],
    'opinion': ['editorial', 'opinion', 'commentary', 'letter to editor'],
    'top-stories': ['breaking', 'urgent', 'alert', 'major', 'emergency'],
    'health': ['health', 'medical', 'disease', 'vaccine', 'cdc', 'fda', 'medicine', 'hospital']
};

interface ScrapedStory {
    title: string;
    excerpt: string;
    content: string;
    source: string;
    sourceUrl: string;
    category: string;
    region?: string;
    locations: string[];
    publishedDate: string;
    urgency: number;
    author?: string;
    image?: string;
    feedType: 'maine' | 'national' | 'health'; // Track source type
    isNational: boolean; // Quick flag for filtering
}

function detectLocations(text: string): string[] {
    const found: string[] = [];
    const lowerText = text.toLowerCase();

    for (const location of MAINE_LOCATIONS) {
        if (lowerText.includes(location.toLowerCase())) {
            found.push(location);
        }
    }

    return [...new Set(found)]; // Remove duplicates
}

function detectRegion(locations: string[]): string | undefined {
    for (const [region, cities] of Object.entries(REGIONS)) {
        for (const city of cities) {
            if (locations.includes(city)) {
                return region;
            }
        }
    }
    return undefined;
}

function categorizeStory(text: string, feedType: string): 'local' | 'politics' | 'opinion' | 'top-stories' | 'health' {
    const lowerText = text.toLowerCase();

    // If from health feed, default to health category
    if (feedType === 'health') {
        return 'health';
    }

    let maxScore = 0;
    let category: 'local' | 'politics' | 'opinion' | 'top-stories' | 'health' = feedType === 'national' ? 'politics' : 'local';

    for (const [cat, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        const score = keywords.filter(kw => lowerText.includes(kw)).length;
        if (score > maxScore) {
            maxScore = score;
            category = cat as typeof category;
        }
    }

    return category;
}

function calculateUrgency(text: string): number {
    const urgentKeywords = ['breaking', 'urgent', 'alert', 'emergency', 'warning'];
    const lowerText = text.toLowerCase();

    return urgentKeywords.filter(kw => lowerText.includes(kw)).length;
}

function sanitizeForFilename(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
}

async function parseRSSFeed(feedUrl: string, sourceName: string, feedType: 'maine' | 'national' | 'health'): Promise<ScrapedStory[]> {
    try {
        // Use fetch with a browser-like User-Agent to avoid bot-blocking 404s
        const res = await fetch(feedUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        if (!res.ok) throw new Error(`Status ${res.status}`);
        const xml = await res.text();

        const feed = await parser.parseString(xml);
        const stories: ScrapedStory[] = [];

        for (const item of feed.items) {
            const title = item.title || 'Untitled';
            const rawContent = item.content || item.contentSnippet || item.summary || '';
            const content = turndown.turndown(rawContent);
            const excerpt = content.substring(0, 200).replace(/[\\#\\*]/g, '') + (content.length > 200 ? '...' : '');

            // Extract image
            let image = item.enclosure?.url;
            if (!image && (item as any)['media:content']) {
                image = (item as any)['media:content'].$.url;
            }

            stories.push({
                title,
                excerpt,
                content,
                source: sourceName,
                sourceUrl: item.link || feedUrl,
                category: 'local', // Will be overridden
                locations: [],
                publishedDate: item.pubDate || new Date().toISOString(),
                urgency: 0,
                author: item.creator || sourceName,
                image,
                feedType,
                isNational: feedType !== 'maine'
            });
        }

        return stories;
    } catch (error) {
        console.error(`Failed to parse RSS feed ${feedUrl}:`, error);
        return [];
    }
}

async function saveToGitHub(path: string, content: string, message: string): Promise<boolean> {
    const token = process.env.KEYSTATIC_GITHUB_TOKEN;
    if (!token) {
        console.error('[GITHUB] Persistence Error: KEYSTATIC_GITHUB_TOKEN is missing in Vercel Environment Variables.');
        return false;
    }

    const repo = 'carnage999-max/maine-news';
    const branch = 'main';
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;

    try {
        // Check if file exists to get SHA
        const checkRes = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        let sha: string | undefined;
        if (checkRes.ok) {
            const data = await checkRes.json();
            sha = data.sha;
        }

        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                content: Buffer.from(content).toString('base64'),
                branch,
                sha
            })
        });

        if (!res.ok) {
            const err = await res.text();
            console.error(`[GITHUB] Failed to push to ${path}:`, err);
            return false;
        }

        console.log(`[GITHUB] Successfully committed ${path}`);
        return true;
    } catch (error) {
        console.error(`[GITHUB] Error pushing ${path}:`, error);
        return false;
    }
}

async function parseVideoFeed(feedUrl: string, sourceName: string): Promise<ScrapedVideo[]> {
    try {
        const res = await fetch(feedUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        if (!res.ok) throw new Error(`Status ${res.status}`);
        const xml = await res.text();

        const feed = await parser.parseString(xml);
        return feed.items.map(item => {
            const videoId = item.link?.split('v=')[1] || item.id?.split(':')[2] || '';
            return {
                title: item.title || 'Untitled Video',
                videoUrl: item.link || '',
                thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                duration: '05:00', // YouTube RSS doesn't give duration directly, default to 5min
                views: '1.2k', // Placeholder as RSS doesn't give views
                category: 'broadcast',
                publishedDate: item.pubDate || new Date().toISOString(),
                description: item.contentSnippet || '',
                source: sourceName
            };
        });
    } catch (error) {
        console.error(`Failed to parse video feed ${feedUrl}:`, error);
        return [];
    }
}

async function saveVideoToKeystatic(video: ScrapedVideo): Promise<boolean> {
    try {
        const slug = sanitizeForFilename(video.title);
        const filename = `${slug}.mdoc`;
        const relativePath = `src/content/videos/${filename}`;
        const filepath = path.join(process.cwd(), relativePath);

        const frontmatter = `---
title: ${JSON.stringify(video.title)}
videoUrl: "${video.videoUrl}"
thumbnail: "${video.thumbnail}"
duration: "${video.duration}"
views: "${video.views}"
category: ${video.category}
publishedDate: ${new Date(video.publishedDate).toISOString().split('T')[0]}
---

${video.description}

---

*Source: ${video.source}*
`;

        if (process.env.NODE_ENV === 'production') {
            return await saveToGitHub(`maine-news/${relativePath}`, frontmatter, `chore: add video ${slug} [skip ci]`);
        }

        // Ensure directory exists
        const dir = path.dirname(filepath);
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }

        // Check if file already exists
        try {
            await fs.access(filepath);
            return false;
        } catch { }

        await fs.writeFile(filepath, frontmatter, 'utf-8');
        return true;
    } catch (error) {
        if ((error as any).code === 'EROFS') {
            console.warn(`[SCRAPER] Skipping write for "${video.title}" - Read-only filesystem detected (Vercel Production).`);
            return false;
        }
        console.error(`Failed to save video "${video.title}":`, error);
        return false;
    }
}

async function saveToKeystatic(story: ScrapedStory): Promise<boolean> {
    try {
        const slug = sanitizeForFilename(story.title);
        const filename = `${slug}.mdoc`;
        const relativePath = `src/content/posts/${filename}`;
        const filepath = path.join(process.cwd(), relativePath);

        const frontmatter = `---
title: ${JSON.stringify(story.title)}
image: ${story.image ? JSON.stringify(story.image) : 'null'}
author: ${JSON.stringify(story.author || story.source)}
publishedDate: ${new Date(story.publishedDate).toISOString().split('T')[0]}
category: ${story.category}
---

${story.content}

---

*Source: [${story.source}](${story.sourceUrl})*
${story.locations.length > 0 ? `\n*Locations: ${story.locations.join(', ')}*` : ''}
${story.region ? `\n*Region: ${story.region}*` : ''}
`;

        if (process.env.NODE_ENV === 'production') {
            return await saveToGitHub(`maine-news/${relativePath}`, frontmatter, `chore: add article ${slug} [skip ci]`);
        }

        // Check if file already exists
        try {
            await fs.access(filepath);
            console.log(`Story already exists: ${slug}`);
            return false;
        } catch {
            // File doesn't exist, proceed
        }

        await fs.writeFile(filepath, frontmatter, 'utf-8');
        console.log(`Saved story: ${slug}`);
        return true;
    } catch (error) {
        if ((error as any).code === 'EROFS') {
            console.warn(`[SCRAPER] Skipping write for "${story.title}" - Read-only filesystem detected.`);
            return false;
        }
        console.error(`Failed to save story "${story.title}":`, error);
        return false;
    }
}

export async function runScraper(options: { save: boolean, includeNational: boolean }) {
    const { save, includeNational } = options;

    try {
        const allStories: ScrapedStory[] = [];
        const allVideos: ScrapedVideo[] = [];

        // Fetch from all RSS feeds
        for (const feed of ALL_FEEDS) {
            const stories = await parseRSSFeed(feed.url, feed.name, feed.type as 'maine' | 'national' | 'health');
            allStories.push(...stories);
        }

        // Fetch from Video feeds
        for (const feed of VIDEO_FEEDS) {
            const videos = await parseVideoFeed(feed.url, feed.name);
            allVideos.push(...videos);
        }

        // Separate Maine and National stories
        const maineStories = allStories.filter(story => {
            if (story.isNational) return false;
            const locations = detectLocations(story.title + ' ' + story.excerpt + ' ' + story.content);
            return locations.length > 0;
        });

        const nationalStories = allStories.filter(story => story.isNational);

        // Enrich Maine stories with metadata
        const enrichedMaineStories = maineStories.map(story => {
            const locations = detectLocations(story.title + ' ' + story.excerpt + ' ' + story.content);
            const region = detectRegion(locations);
            const category = categorizeStory(story.title + ' ' + story.excerpt, story.feedType);
            const urgency = calculateUrgency(story.title + ' ' + story.excerpt);

            return {
                ...story,
                locations,
                region,
                category,
                urgency
            };
        });

        // Enrich National stories (limit to top 15 total)
        const enrichedNationalStories = nationalStories
            .map(story => ({
                ...story,
                category: categorizeStory(story.title + ' ' + story.excerpt, story.feedType),
                urgency: calculateUrgency(story.title + ' ' + story.excerpt)
            }))
            .sort((a, b) => b.urgency - a.urgency)
            .slice(0, 15);

        // Combine if requested
        const finalStories = includeNational
            ? [...enrichedMaineStories, ...enrichedNationalStories]
            : enrichedMaineStories;

        // Sort by urgency
        finalStories.sort((a, b) => b.urgency - a.urgency);

        // Save to Keystatic if requested
        let savedCount = 0;
        let savedVideoCount = 0;
        if (save) {
            for (const story of finalStories) {
                const saved = await saveToKeystatic(story);
                if (saved) savedCount++;
            }
            for (const video of allVideos) {
                const saved = await saveVideoToKeystatic(video);
                if (saved) savedVideoCount++;
            }
        }

        return {
            success: true,
            count: finalStories.length,
            videoCount: allVideos.length,
            saved: savedCount,
            savedVideos: savedVideoCount,
            stories: finalStories.slice(0, 10),
            videos: allVideos.slice(0, 5),
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('[SCRAPER] Global failure:', error);
        throw error;
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const authKey = searchParams.get('key');
    const save = searchParams.get('save') === 'true';
    const includeNational = searchParams.get('national') === 'true';

    // Simple auth check
    if (authKey !== process.env.SCRAPER_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await runScraper({ save, includeNational });
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({
            error: 'Scraping failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
