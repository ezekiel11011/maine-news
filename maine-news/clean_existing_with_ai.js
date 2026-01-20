const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function aiSummarize(text, title) {
    try {
        const prompt = `
            You are an editorial assistant for "Maine News Now", a news site focused on "Editorial Minimalism".
            
            TASK: Clean and summarize the following news article text.
            1. Remove all navigation artifacts, "Download our app" ads, social media links, and website clutter.
            2. Preserve the factual core of the story.
            3. Write a professional, unbiased, and clear summary of the article.
            4. Keep the length around 200-300 words.
            5. Return ONLY the cleaned summary text. Use proper paragraphs.
            
            ARTICLE TITLE: ${title}
            RAW CONTENT:
            ${text}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error(`AI Error for ${title}:`, error.message);
        return null;
    }
}

async function processFiles() {
    const directories = ['src/content/posts', 'src/content/scraped'];
    let count = 0;

    for (const dir of directories) {
        const fullDir = path.join(process.cwd(), dir);
        if (!fs.existsSync(fullDir)) continue;

        const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.mdoc'));
        console.log(`Processing ${files.length} files in ${dir}...`);

        for (const file of files) {
            const filePath = path.join(fullDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');

            const parts = content.split('---');
            if (parts.length < 3) continue;

            const frontmatter = parts[1];
            const body = parts[2].split('*Note:')[0].trim();

            const titleMatch = frontmatter.match(/title:\s*"(.*?)"/) || frontmatter.match(/title:\s*'(.*?)'/);
            const title = titleMatch ? titleMatch[1] : "";

            // Skip if it looks like it's already well summarized/short (optional)
            // But here we want to re-summarize everything properly with AI

            console.log(`[${++count}] Summarizing: ${title}...`);
            const summary = await aiSummarize(body, title);

            if (summary) {
                const newContent = `---${frontmatter}---\n\n${summary}\n\n---\n\n*Note: This is a summarized excerpt. Click the source link above to read the full story.*`;
                fs.writeFileSync(filePath, newContent);
            }

            // Respect rate limits of free tier (15 requests per minute usually, or 1500 per day)
            // Flash 1.5 free tier is 15 RPM
            await new Promise(r => setTimeout(r, 4000));

            if (count >= 50) {
                console.log("Stopping after 10 files for safety/testing.");
                return;
            }
        }
    }
}

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY in .env.local");
    process.exit(1);
}

processFiles();
