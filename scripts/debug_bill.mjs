import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const logs = [];
page.on('console', (msg) => {
  const text = msg.text();
  if (text.includes('[HatModel]')) logs.push(text);
});

await page.goto('http://127.0.0.1:4176/designer?preview', { waitUntil: 'networkidle' });
await page.waitForSelector('canvas', { timeout: 15000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(5000);

console.log('=== Bill Debug Logs ===');
for (const l of logs) console.log(l);
if (logs.length === 0) console.log('(no HatModel logs captured)');

await browser.close();
