import fs from 'fs';
import path from 'path';

const postsDir = path.join(process.cwd(), 'maine-news/src/content/posts');

function cleanContent(content) {
    // 1. Extract image from HTML if frontmatter image is null
    let frontmatter = content.match(/---([\s\S]*?)---/)[1];
    let body = content.replace(/---([\s\S]*?)---/, '').trim();

    // Look for <img src="..."> in the body
    const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/i;
    const imgMatch = body.match(imgRegex);

    if (imgMatch && imgMatch[1]) {
        const imageUrl = imgMatch[1];

        // If frontmatter image is null, update it
        if (frontmatter.includes('image: null')) {
            frontmatter = frontmatter.replace('image: null', `image: "${imageUrl}"`);
            console.log(`  Updating frontmatter image to: ${imageUrl}`);
        }

        // Convert HTML img to Markdown img
        body = body.replace(/<figure>[\s\S]*?<img[^>]+src="([^">]+)"[^>]*>[\s\S]*?<\/figure>/gi, (match, src) => {
            return `![image](${src})`;
        });

        body = body.replace(imgRegex, (match, src) => {
            return `![image](${src})`;
        });
    }

    // 2. Remove other common HTML tags that Turndown might have missed or were literal
    body = body.replace(/<p>/gi, '').replace(/<\/p>/gi, '\n\n');
    body = body.replace(/<br\s*\/?>/gi, '\n');
    body = body.replace(/<div[^>]*>/gi, '').replace(/<\/div>/gi, '\n');
    body = body.replace(/<figure[^>]*>/gi, '').replace(/<\/figure>/gi, '\n');

    // 3. Fix potential double newlines
    body = body.replace(/\n{3,}/g, '\n\n');

    return `---${frontmatter}---

${body.trim()}
`;
}

async function fixContent() {
    if (!fs.existsSync(postsDir)) {
        console.error(`Directory not found: ${postsDir}`);
        return;
    }

    const files = fs.readdirSync(postsDir);
    console.log(`Found ${files.length} files. Cleaning content...`);

    let cleanedCount = 0;
    for (const file of files) {
        if (!file.endsWith('.mdoc')) continue;

        const filePath = path.join(postsDir, file);
        const originalContent = fs.readFileSync(filePath, 'utf-8');

        const cleaned = cleanContent(originalContent);

        if (originalContent !== cleaned) {
            fs.writeFileSync(filePath, cleaned, 'utf-8');
            console.log(`  Cleaned: ${file}`);
            cleanedCount++;
        }
    }
    console.log(`Finished. Cleaned ${cleanedCount} files.`);
}

fixContent();
