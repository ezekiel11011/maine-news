import fs from 'fs';
import path from 'path';

const postsDir = path.join(process.cwd(), 'maine-news/src/content/posts');

function sanitizeForFilename(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function fixSlugs() {
    if (!fs.existsSync(postsDir)) {
        console.error(`Directory not found: ${postsDir}`);
        return;
    }

    const files = fs.readdirSync(postsDir);
    console.log(`Found ${files.length} files. Checking slugs...`);

    let renamedCount = 0;
    for (const file of files) {
        if (!file.endsWith('.mdoc')) continue;

        const filePath = path.join(postsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Extract title from frontmatter
        const titleMatch = content.match(/title:\s*"(.*)"/);
        if (titleMatch && titleMatch[1]) {
            const title = titleMatch[1];
            const correctSlug = sanitizeForFilename(title);
            const correctFilename = `${correctSlug}.mdoc`;

            if (file !== correctFilename) {
                const newPath = path.join(postsDir, correctFilename);
                console.log(`Renaming: ${file} -> ${correctFilename}`);
                if (fs.existsSync(newPath)) {
                    console.log(`Target already exists, merging...`);
                    fs.unlinkSync(filePath);
                } else {
                    fs.renameSync(filePath, newPath);
                }
                renamedCount++;
            }
        }
    }
    console.log(`Finished. Renamed ${renamedCount} files.`);
}

fixSlugs();
