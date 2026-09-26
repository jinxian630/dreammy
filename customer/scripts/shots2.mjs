import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8123';
const OUT = 'storage/screens';
const browser = await chromium.launch();
const overflow = [];

for (const w of [390, 1440]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();

    // Login page (guest layout) — screenshot before authenticating
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/login-${w}.png`, fullPage: true });

    // Authenticate
    await page.fill('#email', 'luna.dreamer@example.com');
    await page.fill('#password', 'password');
    await Promise.all([page.waitForNavigation().catch(() => {}), page.click('button[type=submit]')]);

    // Create a fresh draft via the configurator, land on checkout
    await page.goto(`${BASE}/services/daily-candle-run`, { waitUntil: 'networkidle' });
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {}),
        page.getByRole('button', { name: /Continue/i }).first().click(),
    ]);
    await page.waitForTimeout(400);
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, url: location.pathname }));
    if (m.sw > m.iw + 1) overflow.push(`[${w}] checkout ${m.sw}>${m.iw}`);
    await page.screenshot({ path: `${OUT}/checkout-${w}.png`, fullPage: true });
    console.log(`[${w}] checkout url=${m.url} overflow=${m.sw > m.iw + 1}`);

    await ctx.close();
}
await browser.close();
console.log('overflow:', overflow.length ? overflow.join('; ') : 'none');
