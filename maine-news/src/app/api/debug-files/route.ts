import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    const cwd = process.cwd();
    const results: any = {
        cwd,
        env: process.env.NODE_ENV,
        exists: {},
        tree: []
    };

    const targetDir = path.join(cwd, 'src/content');

    // Check main directories
    results.exists['src/content'] = fs.existsSync(targetDir);
    results.exists['src/content/posts'] = fs.existsSync(path.join(targetDir, 'posts'));
    results.exists['src/content/scraped'] = fs.existsSync(path.join(targetDir, 'scraped'));
    results.exists['public/content'] = fs.existsSync(path.join(cwd, 'public/content'));

    // Walk src/content
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
        results.error = e.message;
    }

    return NextResponse.json(results);
}
