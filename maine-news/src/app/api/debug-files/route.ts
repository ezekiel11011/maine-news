import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { reader } from '@/lib/reader';

export const dynamic = 'force-dynamic';

export async function GET() {
    const cwd = process.cwd();
    const results: any = {
        cwd,
        env: process.env.NODE_ENV,
        hasGithubToken: !!process.env.KEYSTATIC_GITHUB_TOKEN,
        hasClientId: !!process.env.KEYSTATIC_GITHUB_CLIENT_ID,
        exists: {},
        tree: [],
        reader: {}
    };

    const targetDir = path.join(cwd, 'src/content');

    // Check main directories (for Local mode diagnostics)
    results.exists['src/content'] = fs.existsSync(targetDir);
    results.exists['src/content/posts'] = fs.existsSync(path.join(targetDir, 'posts'));
    results.exists['public/content'] = fs.existsSync(path.join(cwd, 'public/content'));

    // Walk src/content (for Local mode diagnostics)
    try {
        if (results.exists['src/content']) {
            const walk = (dir: string, filelist: string[] = []) => {
                const files = fs.readdirSync(dir);
                files.forEach(function (file) {
                    const filepath = path.join(dir, file);
                    const stat = fs.statSync(filepath);
                    if (stat.isDirectory()) {
                        walk(filepath, filelist);
                    } else {
                        // relative
                        filelist.push(filepath.replace(cwd, ''));
                    }
                });
                return filelist;
            };
            results.tree = walk(targetDir).slice(0, 20); // First 20 files
            results.totalFiles = walk(targetDir).length;
        }
    } catch (e: any) {
        results.treeError = e.message;
    }

    // Check Reader (Keystatic)
    try {
        const posts = await reader.collections.posts.all();
        results.reader.count = posts.length;
        results.reader.success = true;
        if (posts.length > 0) {
            results.reader.firstSlug = posts[0].slug;
            // Try to read content of first post to verify full access
            // results.reader.firstContent = (await posts[0].entry.content()).node ? 'Has Node' : 'Empty';
        }
    } catch (e: any) {
        results.reader.error = e.message;
        results.reader.stack = e.stack;
    }

    return NextResponse.json(results);
}
