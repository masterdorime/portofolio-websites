// One-shot production image optimization (idempotent, git-restorable).
// - lanyard-photo.jpg: 4320px/7MB -> max-w 1200 JPEG q72 (same path)
// - projects photographic PNGs -> .webp q82 max-w 1280 (paths updated in
//   src/data/projects.ts + src/data/experience.ts after verify)
// - projects JPEGs -> max-w 1280 q75 (same path)
// - urocheck-blueprint.png (diagram) -> PNG recompress in place
// Usage: node scripts/optimize-images.mjs
import sharp from 'sharp';
import { existsSync, statSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (...segs) => join(root, ...segs);
const MB = (n) => (n / 1048576).toFixed(2);

const jobs = [];
// [src, kind, opts]
const webpFromPng = [
  'public/images/projects/h2orizon.png',
  'public/images/projects/puresip.png',
  'public/images/projects/techware.png',
  'public/images/projects/showcase-chatgpt-01.png',
  'public/images/projects/showcase-chatgpt-02.png',
  'public/images/projects/showcase-chatgpt-03.png',
  'public/images/projects/urocheck-analyzer.png',
];
for (const src of webpFromPng) {
  jobs.push({ src, kind: 'png-to-webp', width: 1280, quality: 82 });
}
jobs.push({ src: 'public/images/lanyard-photo.jpg', kind: 'jpeg', width: 1200, quality: 72 });
for (const src of [
  'public/images/projects/showcase-gemini-01.jpeg',
  'public/images/projects/showcase-gemini-02.jpeg',
  'public/images/projects/urocheck-device.jpeg',
  'public/images/projects/techware-goku.jpeg',
]) {
  jobs.push({ src, kind: 'jpeg', width: 1280, quality: 75 });
}
jobs.push({ src: 'public/images/projects/urocheck-blueprint.png', kind: 'png' });

let totalBefore = 0;
let totalAfter = 0;
for (const job of jobs) {
  const srcPath = p(job.src);
  if (!existsSync(srcPath)) {
    console.log(`SKIP (missing): ${job.src}`);
    continue;
  }
  const before = statSync(srcPath).size;
  totalBefore += before;
  if (job.kind === 'png-to-webp') {
    const outPath = srcPath.replace(/\.png$/, '.webp');
    if (existsSync(outPath)) {
      console.log(`SKIP (exists): ${job.src} -> .webp`);
      totalAfter += statSync(outPath).size;
      continue;
    }
    const info = await sharp(srcPath)
      .resize({ width: job.width, withoutEnlargement: true })
      .webp({ quality: job.quality, effort: 6 })
      .toFile(outPath);
    if (info.size === 0 || info.width === 0) throw new Error(`bad output: ${outPath}`);
    totalAfter += info.size;
    unlinkSync(srcPath);
    console.log(`${job.src}: ${MB(before)}MB -> ${outPath.split('/').pop()} ${MB(info.size)}MB (${info.width}x${info.height})`);
  } else if (job.kind === 'jpeg') {
    // Write via temp + rename: Windows locks in-place overwrites of large JPEGs.
    // Skip when the recompress is larger (e.g. small diagrams) — never grow files.
    const { renameSync, unlinkSync: rmTmp } = await import('node:fs');
    const info = await sharp(srcPath)
      .resize({ width: job.width, withoutEnlargement: true })
      .jpeg({ quality: job.quality, mozjpeg: true })
      .toBuffer();
    if (info.length >= before) {
      totalAfter += before;
      console.log(`${job.src}: SKIP (larger): ${MB(before)}MB -> ${MB(info.length)}MB`);
    } else {
      const meta = await sharp(info).metadata();
      const tmpPath = `${srcPath}.tmp`;
      await sharp(info).toFile(tmpPath);
      renameSync(tmpPath, srcPath);
      totalAfter += info.length;
      console.log(`${job.src}: ${MB(before)}MB -> ${MB(info.length)}MB (${meta.width}x${meta.height})`);
    }
  } else {
    const { renameSync } = await import('node:fs');
    const info = await sharp(srcPath).png({ compressionLevel: 9, effort: 10 }).toBuffer();
    if (info.length >= before) {
      totalAfter += before;
      console.log(`${job.src}: SKIP (larger): ${MB(before)}MB -> ${MB(info.length)}MB`);
    } else {
      const tmpPath = `${srcPath}.tmp`;
      await sharp(info).toFile(tmpPath);
      renameSync(tmpPath, srcPath);
      totalAfter += info.length;
      console.log(`${job.src}: ${MB(before)}MB -> ${MB(info.length)}MB`);
    }
  }
}
console.log(`TOTAL: ${MB(totalBefore)}MB -> ${MB(totalAfter)}MB`);
