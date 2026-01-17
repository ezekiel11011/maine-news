const fs = require('fs');
const path = require('path');

const TOPIC_KEYWORDS = {
    'politics': ['legislature', 'governor', 'election', 'vote', 'policy', 'bill', 'senate', 'house', 'congress', 'white house', 'biden', 'trump', 'mills', 'ballot'],
    'opinion': ['editorial', 'opinion', 'commentary', 'letter to editor', 'columnist', 'perspective'],
    'top-stories': ['breaking', 'urgent', 'alert', 'major', 'emergency', 'fatality', 'crash'],
    'health': ['health', 'medical', 'disease', 'vaccine', 'cdc', 'fda', 'medicine', 'hospital', 'virus', 'pandemic', 'flu'],
    'sports': ['team', 'player', 'game', 'score', 'coach', 'championship', 'tournament', 'basketball', 'football', 'hockey', 'baseball', 'bruins', 'celtics', 'patriots'],
    'entertainment': ['movie', 'film', 'music', 'actor', 'celebrity', 'concert', 'theater', 'arts', 'culture', 'festival'],
    'business': ['economy', 'market', 'jobs', 'unemployment', 'revenue', 'profit', 'industry', 'retail', 'company', 'startup', 'bank', 'interest rates', 'inflation'],
    'crime': ['police', 'arrest', 'shooting', ' robbery', 'theft', 'burglary', 'murder', 'assault', 'jail', 'prison', 'sentenced', 'charged', 'court', 'investigation'],
    'lifestyle': ['recipe', 'cooking', 'travel', 'home', 'garden', 'fashion', 'outdoors', 'fishing', 'hunting', 'hiking', 'nature', 'community'],
    'weather': ['weather forecast', 'winter storm', 'snow totals', 'snowfall', 'rain shower', 'wind chill', 'weather warning', 'weather advisory', 'meteorologist', 'weather radar', 'weather report', 'ice storm', 'icy roads', 'black ice', 'blizzard warning', 'temperature', 'snow forecast', 'lake effect snow', 'snowstorm', 'rainstorm', 'lightning', 'thunderstorm', 'humidity', 'wind gusts', 'icy conditions', 'snow sleet'],
    'obituaries': ['obituary', 'death notice']
};

function categorizeStory(title) {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('obituary') || lowerTitle.includes('death notice')) {
        return 'obituaries';
    }

    let maxScore = 0;
    let category = 'local'; // Default

    for (const [cat, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (cat === 'obituaries') continue;

        const score = keywords.filter(kw => lowerTitle.includes(kw)).length;
        if (score > maxScore) {
            maxScore = score;
            category = cat;
        }
    }

    return category;
}

const postsDir = path.join(process.cwd(), 'src/content/posts');

async function runMaintenance() {
    const files = fs.readdirSync(postsDir);
    let categoryCount = 0;
    let nationalCount = 0;

    for (const file of files) {
        if (!file.endsWith('.mdoc')) continue;

        const filePath = path.join(postsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
        if (!match) continue;

        let [_, frontmatter, body] = match;
        const fmLines = frontmatter.split('\n');

        let titleLineIndex = -1;
        let categoryLineIndex = -1;
        let isNationalFound = false;
        let isNationalValue = false;
        let title = '';
        let currentCategory = '';
        let sourceUrl = '';

        fmLines.forEach((line, idx) => {
            if (line.startsWith('title:')) {
                titleLineIndex = idx;
                title = line.replace('title:', '').trim().replace(/^"|"$/g, '');
            }
            if (line.startsWith('category:')) {
                categoryLineIndex = idx;
                currentCategory = line.replace('category:', '').trim();
            }
            if (line.startsWith('isNational:')) {
                isNationalFound = true;
                isNationalValue = line.includes('true');
            }
            if (line.startsWith('sourceUrl:')) {
                sourceUrl = line.replace('sourceUrl:', '').trim();
            }
        });

        const newCategory = categorizeStory(title);

        // National logic
        let shouldBeNational = isNationalValue;
        if (newCategory === 'national') shouldBeNational = true;
        const hasLocations = body.includes('*Locations:');
        if (hasLocations) shouldBeNational = false;
        if (!hasLocations && sourceUrl && sourceUrl !== 'null' && newCategory !== 'top-stories') {
            shouldBeNational = true;
        }

        let updated = false;
        let newFmLines = [...fmLines];

        if (newCategory !== currentCategory) {
            console.log(`[Category] "${title}": ${currentCategory} -> ${newCategory}`);
            if (categoryLineIndex !== -1) {
                newFmLines[categoryLineIndex] = `category: ${newCategory}`;
            } else {
                newFmLines.push(`category: ${newCategory}`);
            }
            categoryCount++;
            updated = true;
        }

        if (shouldBeNational !== isNationalValue || !isNationalFound) {
            console.log(`[National] "${title}": isNational -> ${shouldBeNational}`);
            if (isNationalFound) {
                newFmLines = newFmLines.map(line => {
                    if (line.startsWith('isNational:')) return `isNational: ${shouldBeNational}`;
                    return line;
                });
            } else {
                const sourceIdx = newFmLines.findIndex(l => l.startsWith('sourceUrl:'));
                if (sourceIdx !== -1) {
                    newFmLines.splice(sourceIdx, 0, `isNational: ${shouldBeNational}`);
                } else {
                    newFmLines.push(`isNational: ${shouldBeNational}`);
                }
            }
            nationalCount++;
            updated = true;
        }

        if (updated) {
            const newContent = `---\n${newFmLines.join('\n')}\n---\n${body}`;
            fs.writeFileSync(filePath, newContent, 'utf-8');
        }
    }
    console.log(`\nMaintenance Complete:`);
    console.log(`- Categories updated: ${categoryCount}`);
    console.log(`- National flags updated: ${nationalCount}`);
}

runMaintenance();
