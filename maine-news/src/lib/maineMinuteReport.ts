import { db } from '@/db';
import { lotteryResults, maineMinute, posts as dbPosts } from '@/db/schema';
import { findMaineLocation, hasMaineLocation, isAllowedSource, scoreStory, stripContent } from '@/lib/maineMinute';
import { desc, eq, gte } from 'drizzle-orm';

export interface MinuteLink {
    title: string;
    slug: string;
}

export interface MinuteSection {
    title: string;
    summary: string;
    links: MinuteLink[];
}

export interface MinuteLottery {
    game: string;
    numbers: string[];
    extra?: string | null;
    jackpot?: string | null;
    drawDate?: string | null;
}

export interface MaineMinuteReport {
    date: string;
    headline: string;
    subhead: string;
    sections: MinuteSection[];
    readMore: MinuteLink[];
    lottery: MinuteLottery[];
    timestamp: string;
    isManual: boolean;
}

interface MinuteStory {
    title: string;
    slug: string;
    category?: string;
    publishedDate: Date;
    content: string;
    sourceUrl?: string | null;
    isOriginal?: boolean | null;
    isNational?: boolean | null;
    summary?: string;
    score?: number;
    location?: string | null;
}

const SECTION_CONFIG = [
    { key: 'state', title: 'State Government', categories: ['politics'], maxSentences: 3 },
    { key: 'courts', title: 'Courts & Public Safety', categories: ['crime'], maxSentences: 3 },
    { key: 'business', title: 'Business & Economy', categories: ['business'], maxSentences: 2 },
    { key: 'communities', title: 'Communities', categories: ['local', 'health', 'sports', 'lifestyle', 'entertainment', 'top-stories'], maxSentences: 2 },
];

function formatTimestamp(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    }).format(date);
}

function getEasternDateString(date: Date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

function buildMinuteSentence(story: MinuteStory, index: number): string {
    const base = (story.summary || story.title || '').trim();
    if (!base) return '';

    const location = story.location?.trim();
    const usesLocation = location && !base.toLowerCase().startsWith(location.toLowerCase());
    const prefix = usesLocation ? `${location} — ` : '';
    const connector = index === 0 ? '' : 'Also, ';

    let sentence = `${connector}${prefix}${base}`;
    if (!/[.!?]$/.test(sentence)) {
        sentence = `${sentence}.`;
    }

    return sentence;
}

function buildSectionSummary(stories: MinuteStory[], maxSentences: number): string {
    const sentences: string[] = [];

    for (const story of stories) {
        const sentence = buildMinuteSentence(story, sentences.length);
        if (sentence) {
            sentences.push(sentence);
        }

        if (sentences.length >= maxSentences) break;
    }

    return sentences.join(' ');
}

function isMaineMinuteStory(story: MinuteStory) {
    if (story.isNational) return false;
    if (story.category === 'national') return false;
    if (!isAllowedSource(story.sourceUrl, story.isOriginal)) return false;

    const lead = stripContent(`${story.title} ${story.content}`).slice(0, 300);
    if (!hasMaineLocation(lead)) return false;

    return true;
}

function getStoryLead(story: MinuteStory) {
    return stripContent(`${story.title} ${story.content}`).slice(0, 300);
}

function getEasternRangeForDate(date: string) {
    const [year, month, day] = date.split('-').map(Number);
    const noonUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const easternAtNoon = new Date(noonUtc.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const offsetMs = noonUtc.getTime() - easternAtNoon.getTime();

    const startUtc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) + offsetMs);
    const endUtc = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999) + offsetMs);

    return { startUtc, endUtc };
}

async function loadAutoStories(date: string): Promise<MinuteStory[]> {
    const now = new Date();
    const { startUtc, endUtc } = getEasternRangeForDate(date);
    const rangeStart = endUtc < now ? startUtc : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const rangeEnd = endUtc < now ? endUtc : now;

    const dbResults = await db.query.posts.findMany({
        where: gte(dbPosts.publishedDate, rangeStart),
        orderBy: [desc(dbPosts.publishedDate)],
    });

    const merged = new Map<string, MinuteStory>();

    for (const post of dbResults) {
        if (post.publishedDate > rangeEnd) continue;
        merged.set(post.slug, {
            title: post.title,
            slug: post.slug,
            category: post.category,
            publishedDate: post.publishedDate,
            content: post.content || '',
            sourceUrl: post.sourceUrl,
            isOriginal: post.isOriginal,
            isNational: post.isNational,
        });
    }

    const filtered = Array.from(merged.values()).filter(isMaineMinuteStory);
    filtered.forEach(story => {
        const lead = getStoryLead(story);
        story.location = findMaineLocation(lead);
        story.score = scoreStory(story.category, story.isOriginal ?? undefined, story.publishedDate);
    });

    return filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
}

async function loadManualStories(date: string) {
    const entry = await db.query.maineMinute.findFirst({
        where: eq(maineMinute.date, date)
    });

    if (!entry) return null;

    const stories = await Promise.all((entry.stories as any[]).map(async (story: any) => {
        let title = 'Untitled Story';
        let category = 'local';
        let content = '';
        let publishedDate = new Date();
        let sourceUrl: string | null = null;
        let isOriginal: boolean | null = null;
        let isNational: boolean | null = null;

        try {
            const dbPost = await db.query.posts.findFirst({
                where: eq(dbPosts.slug, story.postSlug)
            });
            if (dbPost) {
                title = dbPost.title;
                category = dbPost.category;
                content = dbPost.content || '';
                publishedDate = dbPost.publishedDate;
                sourceUrl = dbPost.sourceUrl;
                isOriginal = dbPost.isOriginal;
                isNational = dbPost.isNational;
            } else {
                title = story.postSlug || title;
                content = story.summary || '';
                isOriginal = true;
                isNational = false;
            }
        } catch (error) {
            console.warn('Manual Minute story lookup failed:', error);
        }

        return {
            title,
            slug: story.postSlug,
            category,
            publishedDate,
            content,
            sourceUrl,
            isOriginal,
            isNational,
            summary: story.summary,
        } as MinuteStory;
    }));

    const filteredStories = stories.filter(isMaineMinuteStory);
    filteredStories.forEach(story => {
        const lead = getStoryLead(story);
        story.location = findMaineLocation(lead);
        story.score = scoreStory(story.category, story.isOriginal ?? undefined, story.publishedDate);
    });

    return {
        tagline: entry.tagline as string,
        stories: filteredStories
    };
}

async function loadLottery(): Promise<MinuteLottery[]> {
    const games = ['powerball', 'megabucks', 'gimme-5', 'pick-4', 'pick-3'];
    const results = await Promise.all(
        games.map(game => db.query.lotteryResults.findFirst({
            where: eq(lotteryResults.game, game)
        }).catch(() => null))
    );

    return results
        .filter(Boolean)
        .map(res => ({
            game: res!.game,
            numbers: res!.numbers.split(','),
            extra: res!.extra,
            jackpot: res!.jackpot,
            drawDate: res!.drawDate
        }));
}

export async function buildMaineMinuteReport(date?: string): Promise<MaineMinuteReport> {
    const reportDate = date || getEasternDateString();
    const manual = await loadManualStories(reportDate);
    const stories = manual ? manual.stories : await loadAutoStories(reportDate);

    const sections: MinuteSection[] = [];
    const readMore: MinuteLink[] = [];

    SECTION_CONFIG.forEach(section => {
        const matches = stories
            .filter(story => story.category && section.categories.includes(story.category))
            .sort((a, b) => (b.score || 0) - (a.score || 0));

        if (matches.length === 0) return;

        const summary = buildSectionSummary(matches, section.maxSentences);
        const links = matches.slice(0, 2).map(story => ({ title: story.title, slug: story.slug }));

        if (summary) {
            sections.push({
                title: section.title,
                summary,
                links
            });
            readMore.push(...links);
        }
    });

    sections.push({
        title: 'Weather',
        summary: 'Forecast details and active advisories are available in the Maine Weather Report.',
        links: [{ title: 'Maine Weather Report', slug: '/weather' }]
    });

    const lottery = await loadLottery();

    return {
        date: reportDate,
        headline: `The Maine Minute — ${reportDate}`,
        subhead: manual?.tagline || 'Everything that matters in Maine. One minute.',
        sections,
        readMore,
        lottery,
        timestamp: formatTimestamp(new Date()),
        isManual: !!manual
    };
}
