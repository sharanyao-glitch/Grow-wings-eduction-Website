// Renders build/og-image.html to src/og-image.png. Needs Chrome + puppeteer-core (not a project dependency):
//   npx -y -p puppeteer-core node build/og-image.mjs
import puppeteer from 'puppeteer-core';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const b = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--allow-file-access-from-files'] });
const p = await b.newPage();
await p.setViewport({ width: 1200, height: 630 });
await p.goto(pathToFileURL(path.join(ROOT, 'build', 'og-image.html')).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: path.join(ROOT, 'src', 'og-image.png') });
await b.close();
console.log('wrote src/og-image.png');
