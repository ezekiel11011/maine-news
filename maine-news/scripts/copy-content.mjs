import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src/content');
const destDir = path.join(__dirname, '../public/content');

function copyDir(src, dest) {
    if (!fs.existsSync(src)) {
        console.warn(`Source directory ${src} does not exist. Skipping copy.`);
        return;
    }

    fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log(`Copying content from ${srcDir} to ${destDir}...`);
copyDir(srcDir, destDir);
console.log('Content copy complete.');
