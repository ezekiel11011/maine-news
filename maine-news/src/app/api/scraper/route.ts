import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import TurndownService from 'turndown';
export const dynamic = 'force-dynamic';

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
    { url: 'https://www.newscentermaine.com/feeds/syndication/rss/news/local', name: 'News Center Maine', type: 'maine' },
    { url: 'https://www.pressherald.com/feed/', name: 'Press Herald', type: 'maine' },
    // { url: 'https://www.bangordailynews.com/feed/', name: 'Bangor Daily News', type: 'maine' },
    { url: 'https://www.maine.gov/tools/whatsnew/rss.php?id=portal-news', name: 'Maine.gov', type: 'maine' },
    { url: 'https://www.wabi.tv/feeds/syndication/rss/sports', name: 'WABI Sports', type: 'maine' },
];

const NATIONAL_FEEDS = [
    { url: 'https://moxie.foxnews.com/google-publisher/latest.xml', name: 'Fox News', type: 'national' },
    { url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', name: 'WSJ World', type: 'national' },
    { url: 'https://www.newsmax.com/rss/Newsfront/1/', name: 'Newsmax', type: 'national' },
    { url: 'https://news.google.com/rss/search?q=source:Associated+Press&hl=en-US&gl=US&ceid=US:en', name: 'AP News', type: 'national' },
    { url: 'https://moxie.foxnews.com/google-publisher/politics.xml', name: 'Fox Politics', type: 'national' },
    { url: 'https://www.pbs.org/newshour/feeds/rss/politics', name: 'PBS NewsHour', type: 'national' },
    { url: 'https://www.politico.com/rss/politicopicks.xml', name: 'Politico', type: 'national' },
];

const VIDEO_FEEDS = [
    { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCYfdidRxbB8Qhf0Nx7ioOYw', name: 'News Center Maine', type: 'broadcast' },
    { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCLubgoPg9ahtXP1Mpq3J0uA', name: 'WABI 5 News', type: 'broadcast' },
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

// Topic keywords for auto-categorization - NOW BASED ON TITLE ONLY
const TOPIC_KEYWORDS = {
    'politics': ['legislature', 'governor', 'election', 'vote', 'policy', 'bill', 'senate', 'house', 'congress', 'white house', 'biden', 'trump', 'mills', 'ballot'],
    'opinion': ['editorial', 'opinion', 'commentary', 'letter to editor', 'columnist', 'perspective'],
    'top-stories': ['breaking', 'urgent', 'alert', 'major', 'emergency', 'fatality', 'crash', 'police', 'arrested'],
    'health': ['health', 'medical', 'disease', 'vaccine', 'cdc', 'fda', 'medicine', 'hospital', 'virus', 'pandemic', 'flu'],
    'sports': ['team', 'player', 'game', 'score', 'coach', 'championship', 'tournament', 'basketball', 'football', 'hockey', 'baseball', 'bruins', 'celtics', 'patriots'],
    'entertainment': ['movie', 'film', 'music', 'actor', 'celebrity', 'concert', 'theater', 'arts', 'culture', 'festival'],
    'business': ['economy', 'market', 'jobs', 'unemployment', 'revenue', 'profit', 'industry', 'retail', 'company', 'startup', 'bank', 'interest rates', 'inflation'],
    'crime': ['police', 'arrest', 'shooting', ' robbery', 'theft', 'burglary', 'murder', 'assault', 'jail', 'prison', 'sentenced', 'charged', 'court', 'investigation'],
    'lifestyle': ['recipe', 'cooking', 'travel', 'home', 'garden', 'fashion', 'outdoors', 'fishing', 'hunting', 'hiking', 'nature', 'community'],
    'weather': ['weather forecast', 'winter storm', 'snow totals', 'snowfall', 'rain shower', 'wind chill', 'weather warning', 'weather advisory', 'meteorologist', 'weather radar', 'weather report', 'ice storm', 'icy roads', 'black ice', 'blizzard warning', 'temperature', 'snow forecast', 'lake effect snow', 'snowstorm', 'rainstorm', 'lightning', 'thunderstorm', 'humidity', 'wind gusts', 'icy conditions', 'snow sleet'],
    'obituaries': ['obituary', 'death notice']
};

interface ScrapedStory {
    title: string;
    excerpt: string;
    content: string;
    source: string;
    sourceUrl: string;
    category: 'local' | 'national' | 'politics' | 'opinion' | 'top-stories' | 'health' | 'sports' | 'weather' | 'entertainment' | 'obituaries' | 'business' | 'crime' | 'lifestyle';
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

function categorizeStory(title: string, feedType: string): 'local' | 'national' | 'politics' | 'opinion' | 'top-stories' | 'health' | 'sports' | 'weather' | 'entertainment' | 'obituaries' {
    const lowerTitle = title.toLowerCase();

    // STRICT CHECK FOR OBITUARIES FIRST
    if (lowerTitle.includes('obituary') || lowerTitle.includes('death notice')) {
        return 'obituaries';
    }

    // If from health feed, default to health category
    if (feedType === 'health') {
        return 'health';
    }

    let maxScore = 0;
    let category: 'local' | 'national' | 'politics' | 'opinion' | 'top-stories' | 'health' | 'sports' | 'weather' | 'entertainment' | 'obituaries' = feedType === 'national' ? 'national' : 'local';

    for (const [cat, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (cat === 'obituaries') continue; // Handled above

        const score = keywords.filter(kw => lowerTitle.includes(kw)).length;
        if (score > maxScore) {
            maxScore = score;
            category = cat as any;
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
        .replace(/^-+|-+$/g, '');
}

function normalizeImageUrl(rawUrl?: string, baseUrl?: string): string | undefined {
    if (!rawUrl) return undefined;
    const url = rawUrl.trim();
    if (!url || url.startsWith('data:')) return undefined;
    if (url.startsWith('//')) return `https:${url}`;

    try {
        return baseUrl ? new URL(url, baseUrl).toString() : new URL(url).toString();
    } catch {
        return baseUrl ? undefined : url;
    }
}

function pickUrlFromSrcset(srcset?: string, baseUrl?: string): string | undefined {
    if (!srcset) return undefined;
    const first = srcset.split(',')[0]?.trim().split(/\s+/)[0];
    return normalizeImageUrl(first, baseUrl);
}

function extractFirstImageFromHtml(html: string, baseUrl?: string): string | undefined {
    if (!html) return undefined;

    const imgTags = html.match(/<img[^>]+>/gi) || [];
    const badPatterns = /(logo|icon|sprite|badge|avatar|tracking|pixel|spacer)/i;

    for (const tag of imgTags) {
        const srcMatch = tag.match(/\s(?:src|data-src|data-original|data-lazy-src)=["']([^"']+)["']/i);
        const srcsetMatch = tag.match(/\s(?:srcset|data-srcset|data-lazy-srcset)=["']([^"']+)["']/i);
        const url = srcMatch?.[1]?.trim() || pickUrlFromSrcset(srcsetMatch?.[1], baseUrl);
        const normalized = normalizeImageUrl(url, baseUrl);

        if (!normalized) continue;
        if (badPatterns.test(normalized)) continue;
        if (/\.svg(\?|#|$)/i.test(normalized)) continue;

        return normalized;
    }

    return undefined;
}

function extractFirstImageFromMarkdown(markdown: string, baseUrl?: string): string | undefined {
    if (!markdown) return undefined;
    const match = markdown.match(/!\[[^\]]*]\(([^)]+)\)/);
    if (!match) return undefined;
    return normalizeImageUrl(match[1], baseUrl);
}

function extractMediaUrl(value: any, baseUrl?: string): string | undefined {
    if (!value) return undefined;
    const candidates = Array.isArray(value) ? value : [value];

    for (const entry of candidates) {
        const url = entry?.$?.url || entry?.url || entry?.href;
        const normalized = normalizeImageUrl(url, baseUrl);
        if (normalized) return normalized;
    }

    return undefined;
}

function extractStoryImage(item: Record<string, any>, rawHtml: string, baseUrl?: string): string | undefined {
    const enclosureUrl = normalizeImageUrl(item.enclosure?.url, baseUrl);
    if (enclosureUrl) return enclosureUrl;

    const mediaContent = extractMediaUrl(item['media:content'], baseUrl);
    if (mediaContent) return mediaContent;

    const mediaThumbnail = extractMediaUrl(item['media:thumbnail'], baseUrl);
    if (mediaThumbnail) return mediaThumbnail;

    const imageField = extractMediaUrl(item.image, baseUrl);
    if (imageField) return imageField;

    const htmlImage = extractFirstImageFromHtml(rawHtml, baseUrl);
    if (htmlImage) return htmlImage;

    return extractFirstImageFromMarkdown(rawHtml, baseUrl);
}

async function parseRSSFeed(feedUrl: string, sourceName: string, feedType: 'maine' | 'national' | 'health'): Promise<ScrapedStory[]> {
    try {
        // Use fetch with a browser-like User-Agent to avoid bot-blocking 404s
        const res = await fetch(feedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml,application/rss+xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
                'Referer': 'https://www.google.com/'
            }
        });

        if (!res.ok) throw new Error(`Status ${res.status}`);
        const xml = await res.text();

        const feed = await parser.parseString(xml);
        const stories: ScrapedStory[] = [];

        for (const item of feed.items) {
            const title = item.title || 'Untitled';
            const link = item.link || '';
            const rawHtml = [
                item['content:encoded'],
                item.content,
                item.summary,
                item.contentSnippet
            ].filter(Boolean).join(' ');
            const baseUrl = link || feedUrl;
            const image = extractStoryImage(item as Record<string, any>, rawHtml, baseUrl);
            const contentSource = item['content:encoded'] || item.content || item.contentSnippet || item.summary || '';
            let content = turndown.turndown(contentSource);

            // Robust cleaning for future scrapes
            const cleanText = (text: string, storyTitle: string) => {
                let cleaned = text;

                // 1. Remove specific junk blocks by pattern (ads, app links, etc)
                const junkPatterns = [
                    /\[Local News\]\(.*?\)/gi,
                    /!\[x\]\(.*?\)/gi,
                    /!\[WCSH\]\(.*?\)/gi,
                    /Download the NCM app/g,
                    /To stream NCM on your phone, you need the (NCM|NEWS CENTER Maine) app\.?/g,
                    /stream NCM on your phone/g,
                    /\[!\[Download on the App Store\].*?\]\(.*?\)/g,
                    /\[!\[Get it on Google Play\].*?\]\(.*?\)/g,
                    /#### More Videos[\s\S]*?Next up in \d+/g,
                    /Example video title will go here/g,
                    /\[!\[Facebook\].*?\]\(.*?\)/g,
                    /Author:.*?Staff/gi,
                    /Published:.*?\d{4}/gi,
                    /Updated:.*?\d{4}/gi,
                    /Related Articles[\s\S]*?$/i, // Cut off everything after Related Articles
                    /Close Ad/gi,
                    /\[\s*\]\(\/\)/g, // Remove empty links
                    /\*\*\*+/g, // Remove horizontal rules with too many stars
                    /===+/g, // Remove excessive headers
                    /For the latest breaking news, weather, and traffic alerts, download the NEWS CENTER Maine mobile app\./gi
                ];

                junkPatterns.forEach(pattern => {
                    cleaned = cleaned.replace(pattern, '');
                });

                // 2. Remove redundant title at the start
                const escapedTitle = storyTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                cleaned = cleaned.replace(new RegExp(`^\\s*${escapedTitle}\\s*`, 'i'), '');

                // 3. Remove excessive punctuation/formatting
                cleaned = cleaned.replace(/([\.=-]){2,}/g, '$1');

                // 4. Remove ONLY UI/Icon images, KEEP story images
                cleaned = cleaned.replace(/!\[.*?\]\((?:\/assets\/|http).*?(?:icon|logo|badge|close-menu|amp|shared-images).*?\)/gi, '');

                // 5. Remove widowed bullet points and fragments
                cleaned = cleaned.replace(/^\s*[\*\-]\s*$/gm, '');
                cleaned = cleaned.replace(/^\s*[\*\-]\s*!\[\].*?$/gm, '');

                return cleaned.trim();
            };

            content = cleanText(content, title);

            let excerpt = content.replace(/!\[.*?\]\(.*?\)/g, '').substring(0, 300).replace(/[\\#\\*]/g, '') + (content.length > 300 ? '...' : '');

            // Final polish to ensure no trailing junk or weird formatting
            content = content.replace(/\n{3,}/g, '\n\n').trim();
            excerpt = excerpt.replace(/\s+/g, ' ').trim();

            stories.push({
                title,
                excerpt,
                content,
                source: sourceName,
                sourceUrl: link || feedUrl,
                category: 'local', // Will be overridden
                locations: [],
                publishedDate: item.pubDate || new Date().toISOString(),
                urgency: 0,
                author: item.creator || sourceName,
                image: image || '/hero-fallback.jpeg',
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

async function getExistingSlugs(repo: string, token: string): Promise<Set<string>> {
    const slugs = new Set<string>();
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MaineNewsToday-Scraper/1.0'
    };

    try {
        // Fetch files from posts and videos directories - explicitly checking maine-news subdirectory
        const directories = ['maine-news/src/content/posts', 'maine-news/src/content/videos'];
        for (const dir of directories) {
            const res = await fetch(`https://api.github.com/repos/${repo}/contents/${dir}`, { headers });
            if (res.ok) {
                const files = await res.json();
                if (Array.isArray(files)) {
                    files.forEach(file => {
                        if (file.name.endsWith('.mdoc')) {
                            slugs.add(file.name.replace('.mdoc', ''));
                        }
                    });
                }
            }
        }
        return slugs;
    } catch (error) {
        console.error('Failed to fetch existing slugs:', error);
        return slugs;
    }
}

async function commitBatchToGitHub(files: { path: string, content: string }[], message: string): Promise<number> {
    const token = process.env.KEYSTATIC_GITHUB_TOKEN;
    if (!token || files.length === 0) return 0;

    const repo = 'ezekiel11011/maine-news';
    const baseUrl = `https://api.github.com/repos/${repo}`;
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MaineNewsToday-Scraper/1.0'
    };

    try {
        // 1. Get the latest commit SHA of the main branch
        const branchRes = await fetch(`${baseUrl}/git/refs/heads/main`, { headers });
        if (!branchRes.ok) throw new Error(`[Step 1] Branch ref failed: ${branchRes.status}`);
        const branchData = await branchRes.json();
        const baseCommitSha = branchData.object.sha;

        // 2. Get the tree SHA of that commit
        const commitRes = await fetch(`${baseUrl}/git/commits/${baseCommitSha}`, { headers });
        if (!commitRes.ok) throw new Error(`[Step 2] Base commit failed: ${commitRes.status}`);
        const commitData = await commitRes.json();
        const baseTreeSha = commitData.tree.sha;

        // 3. Create a new tree with the added files
        const treeItems = files.map(file => ({
            path: file.path,
            mode: '100644',
            type: 'blob',
            content: file.content
        }));

        const treeRes = await fetch(`${baseUrl}/git/trees`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                base_tree: baseTreeSha,
                tree: treeItems
            })
        });
        if (!treeRes.ok) throw new Error(`[Step 3] Tree creation failed: ${treeRes.status}`);
        const treeData = await treeRes.json();
        const newTreeSha = treeData.sha;

        // 4. Create the commit
        const newCommitRes = await fetch(`${baseUrl}/git/commits`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                message: `${message} [skip ci]`,
                tree: newTreeSha,
                parents: [baseCommitSha]
            })
        });
        if (!newCommitRes.ok) throw new Error(`[Step 4] Commit creation failed: ${newCommitRes.status}`);
        const newCommitData = await newCommitRes.json();
        const newCommitSha = newCommitData.sha;

        // 5. Update the branch reference
        const refRes = await fetch(`${baseUrl}/git/refs/heads/main`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                sha: newCommitSha,
                force: false
            })
        });

        if (!refRes.ok) {
            const errorText = await refRes.text();
            throw new Error(`[Step 5] Ref update failed: ${refRes.status} - ${errorText}`);
        }

        console.log(`[GITHUB] Successfully committed ${files.length} files in one batch.`);
        return files.length;
    } catch (error) {
        console.error('[GITHUB] Batch commit failed:', error);
        return 0;
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

async function saveVideoToKeystatic(video: ScrapedVideo, existingSlugs?: Set<string>): Promise<{ path: string, content: string } | null> {
    try {
        const slug = sanitizeForFilename(video.title);

        // Skip if slug already exists in remote repo
        if (existingSlugs?.has(slug)) {
            console.log(`Video already exists (remote): ${slug}`);
            return null;
        }

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
            return { path: `maine-news/${relativePath}`, content: frontmatter };
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
            return null;
        } catch { }

        await fs.writeFile(filepath, frontmatter, 'utf-8');
        return { path: filepath, content: frontmatter };
    } catch (error) {
        console.error(`Failed to save video "${video.title}":`, error);
        return null;
    }
}

async function saveToKeystatic(story: ScrapedStory, existingSlugs?: Set<string>): Promise<{ path: string, content: string } | null> {
    try {
        const slug = sanitizeForFilename(story.title);

        // Skip if slug already exists in remote repo
        if (existingSlugs?.has(slug)) {
            console.log(`Story already exists (remote): ${slug}`);
            return null;
        }

        const filename = `${slug}.mdoc`;
        const relativePath = `src/content/posts/${filename}`;
        const filepath = path.join(process.cwd(), relativePath);

        const frontmatter = `---
title: ${JSON.stringify(story.title)}
image: ${story.image ? JSON.stringify(story.image) : 'null'}
author: ${JSON.stringify(story.author || story.source)}
publishedDate: ${new Date(story.publishedDate).toISOString().split('T')[0]}
category: ${story.category}
isNational: ${story.isNational}
sourceUrl: ${JSON.stringify(story.sourceUrl)}
---

${story.content}

---

*Source: [${story.source}](${story.sourceUrl})*
${story.locations.length > 0 ? `\n*Locations: ${story.locations.join(', ')}*` : ''}
${story.region ? `\n*Region: ${story.region}*` : ''}
`;

        if (process.env.NODE_ENV === 'production') {
            return { path: `maine-news/${relativePath}`, content: frontmatter };
        }

        // Check if file already exists
        try {
            await fs.access(filepath);
            console.log(`Story already exists: ${slug}`);
            return null;
        } catch {
            // File doesn't exist, proceed
        }

        await fs.writeFile(filepath, frontmatter, 'utf-8');
        console.log(`Saved story: ${slug}`);
        return { path: filepath, content: frontmatter };
    } catch (error) {
        console.error(`Failed to save story "${story.title}":`, error);
        return null;
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
            const category = categorizeStory(story.title, story.feedType);
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
                category: categorizeStory(story.title, story.feedType),
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

        // Fetch existing slugs from GitHub if in production to avoid duplicates
        const repo = 'ezekiel11011/maine-news';
        const token = process.env.KEYSTATIC_GITHUB_TOKEN;
        const existingSlugs = (process.env.NODE_ENV === 'production' && token)
            ? await getExistingSlugs(repo, token)
            : new Set<string>();

        // Save to Keystatic if requested
        let savedCount = 0;
        let savedVideoCount = 0;
        if (save) {
            const batchFiles: { path: string, content: string }[] = [];

            for (const story of finalStories) {
                const result = await saveToKeystatic(story, existingSlugs);
                if (result) {
                    if (process.env.NODE_ENV === 'production') {
                        batchFiles.push(result);
                    } else {
                        savedCount++;
                    }
                }
            }
            for (const video of allVideos) {
                const result = await saveVideoToKeystatic(video, existingSlugs);
                if (result) {
                    if (process.env.NODE_ENV === 'production') {
                        batchFiles.push(result);
                    } else {
                        savedVideoCount++;
                    }
                }
            }

            if (process.env.NODE_ENV === 'production' && batchFiles.length > 0) {
                const pushedCount = await commitBatchToGitHub(batchFiles, `chore: automated news update (${batchFiles.length} items)`);
                savedCount = pushedCount; // Rough estimate for the summary
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
