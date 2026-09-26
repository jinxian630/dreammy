import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE || 'http://127.0.0.1:8123';
const OUT = 'storage/screens';
fs.mkdirSync(OUT, { recursive: true });

const widths = [320, 390, 768, 1440];
const pages = [
    ['home', '/'],
    ['services', '/services'],
    ['service-detail', '/services/daily-candle-run'],
    ['orders', '/orders'],
    ['order-tracking', '/orders/DM-1024'],
    ['order-confirmed', '/orders/DM-1024/confirmed'],
    ['wallet', '/wallet'],
    ['rewards', '/rewards'],
    ['profile', '/profile'],
    ['help', '/help'],
];

const overflow = [];
const errors = [];

const browser = await chromium.launch();

for (const w of widths) {
    const context = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(`[${w}] JS: ${e.message}`));

    // Log in
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('#email', 'luna.dreamer@example.com');
    await page.fill('#password', 'password');
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {}),
        page.click('button[type=submit]'),
    ]);

    for (const [name, path] of pages) {
        await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(250);
        const metrics = await page.evaluate(() => ({
            sw: document.documentElement.scrollWidth,
            iw: window.innerWidth,
        }));
        if (metrics.sw > metrics.iw + 1) {
            overflow.push(`[${w}px] ${name}: scrollWidth ${metrics.sw} > viewport ${metrics.iw}`);
        }
        await page.screenshot({ path: `${OUT}/${name}-${w}.png`, fullPage: true });
    }
    await context.close();
}

await browser.close();

console.log('\n=== OVERFLOW ISSUES ===');
console.log(overflow.length ? overflow.join('\n') : 'none 🎉');
console.log('\n=== JS ERRORS ===');
console.log(errors.length ? errors.join('\n') : 'none 🎉');
console.log(`\nScreenshots written to ${OUT}/`);
