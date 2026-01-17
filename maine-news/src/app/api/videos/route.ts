import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const videosDir = path.join(process.cwd(), 'src/content/videos');

        // Ensure directory exists
        try {
            await fs.access(videosDir);
        } catch {
            return NextResponse.json({ videos: [], count: 0 });
        }

        const files = await fs.readdir(videosDir);
        const mdFiles = files.filter(f => f.endsWith('.mdoc') || f.endsWith('.md'));

        const videos = await Promise.all(mdFiles.map(async (file) => {
            const filePath = path.join(videosDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const { data } = matter(content);

            return {
                id: file.replace(/\.(mdoc|md)$/, ''),
                ...data,
                publishedDate: data.publishedDate ? new Date(data.publishedDate).toISOString() : null,
            };
        }));

        // Sort by published date descending
        videos.sort((a, b) => {
            if (!a.publishedDate || !b.publishedDate) return 0;
            return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
        });

        return NextResponse.json({
            videos,
            count: videos.length
        });
    } catch (error) {
        console.error('Failed to fetch videos:', error);
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
    }
}
