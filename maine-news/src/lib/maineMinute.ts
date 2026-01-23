export const MAINE_LOCATIONS = [
    'Portland',
    'Lewiston',
    'Bangor',
    'South Portland',
    'Auburn',
    'Biddeford',
    'Sanford',
    'Saco',
    'Westbrook',
    'Augusta',
    'Waterville',
    'Presque Isle',
    'Ellsworth',
    'Bar Harbor',
    'Rockland',
    'Belfast',
    'Camden',
    'Brunswick',
    'Bath',
    'Kennebunk',
    'York',
    'Kittery',
    'Scarborough',
    'Gorham',
    'Falmouth',
    'Orono',
    'Old Orchard Beach',
    'Brewer',
    'Caribou',
    'Gardiner',
    'Machias',
    'Calais',
    'Fort Kent',
    'Houlton',
    'Fort Fairfield',
    'Skowhegan',
    'Farmington',
    'Rumford',
    'Lisbon',
    'Yarmouth',
    'Freeport',
    'Kennebunkport',
    'Boothbay Harbor',
    'Millinocket',
    'Androscoggin',
    'Aroostook',
    'Cumberland',
    'Franklin',
    'Hancock',
    'Kennebec',
    'Knox',
    'Lincoln',
    'Oxford',
    'Penobscot',
    'Piscataquis',
    'Sagadahoc',
    'Somerset',
    'Waldo',
    'Washington',
    'York'
];

export const ALLOWED_MAINE_SOURCES = [
    'mainenewsnow.com',
    'pressherald.com',
    'maine.gov',
    'wabi.tv',
    'newscentermaine.com',
    'bangordailynews.com'
];

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function findMaineLocation(text: string): string | null {
    if (!text) return null;

    const normalized = text.toLowerCase();
    for (const location of MAINE_LOCATIONS) {
        const escaped = escapeRegex(location.toLowerCase());
        if (new RegExp(`\\b${escaped}\\b`, 'i').test(normalized)) {
            return location;
        }
    }

    if (/\bMaine\b/i.test(text)) return 'Maine';
    if (/,\s*ME\b/.test(text) || /\bME\s+[—-]/.test(text)) return 'Maine';

    return null;
}

export function hasMaineLocation(text: string): boolean {
    return findMaineLocation(text) !== null;
}

export function isAllowedSource(sourceUrl?: string | null, isOriginal?: boolean | null): boolean {
    if (isOriginal) return true;
    if (!sourceUrl) return false;

    try {
        const hostname = new URL(sourceUrl).hostname.replace(/^www\./, '');
        return ALLOWED_MAINE_SOURCES.some(domain => hostname.endsWith(domain));
    } catch {
        return false;
    }
}

export function stripContent(content: string): string {
    return content
        .replace(/<[^>]*>/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[`*_>#-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function buildSummary(content: string, title: string): string {
    const cleaned = stripContent(content);
    if (!cleaned) return '';

    const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    const firstSentence = sentences[0]?.trim() || '';
    if (firstSentence && firstSentence.toLowerCase() !== title.toLowerCase()) {
        return firstSentence;
    }

    const fallback = cleaned.slice(0, 220).trim();
    if (fallback && fallback.toLowerCase() !== title.toLowerCase()) {
        return fallback.endsWith('.') ? fallback : `${fallback}...`;
    }

    return '';
}

export function scoreStory(category?: string, isOriginal?: boolean, publishedDate?: Date): number {
    const categoryWeight: Record<string, number> = {
        'top-stories': 5,
        politics: 5,
        crime: 4,
        business: 3,
        local: 3,
        health: 3,
        weather: 2,
        sports: 2,
        opinion: 1,
        editorial: 1,
        entertainment: 1,
        lifestyle: 1,
    };

    const base = categoryWeight[category || 'local'] || 1;
    const originalBoost = isOriginal ? 2 : 0;
    const recencyBoost = publishedDate ? Math.max(0, 2 - Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 12))) : 0;

    return base + originalBoost + recencyBoost;
}
