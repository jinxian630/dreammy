import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8123';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
const page = await context.newPage();

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('#email', 'luna.dreamer@example.com');
await page.fill('#password', 'password');
await Promise.all([page.waitForNavigation().catch(() => {}), page.click('button[type=submit]')]);

for (const path of ['/wallet', '/help']) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
    const offenders = await page.evaluate(() => {
        const vw = window.innerWidth;
        const out = [];
        document.querySelectorAll('*').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.right > vw + 1 && r.width > 40) {
                out.push({
                    tag: el.tagName.toLowerCase(),
                    cls: (el.className || '').toString().slice(0, 80),
                    right: Math.round(r.right),
                    width: Math.round(r.width),
                });
            }
        });
        // Keep the deepest / widest few
        return out.sort((a, b) => b.right - a.right).slice(0, 8);
    });
    console.log(`\n=== ${path} (offenders past 390px) ===`);
    offenders.forEach((o) => console.log(`${o.right}px w=${o.width} <${o.tag} class="${o.cls}">`));
}

await browser.close();
