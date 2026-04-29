import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const outDir = path.resolve('output/playwright');
await fs.mkdir(outDir, { recursive: true });

const errors = [];
const modelResponses = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`);
});
page.on('pageerror', (err) => {
  errors.push(`[pageerror] ${err.message}`);
});
page.on('response', (res) => {
  const url = res.url();
  if (url.includes('baseball_cap.glb') || url.includes('/models/')) {
    modelResponses.push({ url, status: res.status() });
  }
});

// Support both local dev server and preview builds
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:5173';
const designerPath = process.env.DESIGNER_PATH || '/designer';
// Use preview mode to skip Fabric.js (uses projected decals for text, reliable in headless)
const url = `${baseUrl}${designerPath}?preview`;

async function loadAndWait() {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 15000 });

  // Wait for fonts to load, then give extra time for texture re-creation
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(4000);
}

console.log(`Navigating to ${url}`);
await loadAndWait();

const canvas = page.locator('canvas').first();
const box = await canvas.boundingBox();
if (!box) throw new Error('Canvas not found for drag interactions');

const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;

async function capture(name) {
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: false });
  console.log(`  Captured: ${name}`);
}

/**
 * Orbit via mouse drag on canvas.
 * OrbitControls: dragging mouse RIGHT orbits camera right → shows LEFT side of object
 *                dragging mouse LEFT orbits camera left → shows RIGHT side of object
 */
async function orbitTo(dx, dy, steps = 25) {
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + dx, cy + dy, { steps });
  await page.mouse.up();
  await page.waitForTimeout(600);
}

// ============================================================
// 8-angle capture matching the reference spec layout:
//
//   Row 1: Front | Back | Right Side | 3/4 Right (rear)
//   Row 2: 3/4 Left (front) | Left Side | Under Brim | Top Down
//
// OrbitControls: drag RIGHT → camera orbits right → see LEFT side
//                drag LEFT  → camera orbits left  → see RIGHT side
// So to see the RIGHT side: drag LEFT (-dx)
//    to see the LEFT side: drag RIGHT (+dx)
// ============================================================

console.log('\n=== Capturing 8 spec angles ===\n');

// 1. FRONT VIEW (default camera position)
await capture('01-front');

// 2. BACK VIEW - orbit 180 degrees
await orbitTo(-450, 0, 35);
await capture('02-back');

// 3. RIGHT SIDE - drag left to orbit camera left, showing right side
await loadAndWait();
await orbitTo(-240, 0, 25);
await capture('03-right-side');

// 4. 3/4 RIGHT (rear) - orbit ~135 degrees showing right-rear
await loadAndWait();
await orbitTo(-350, 15, 30);
await capture('04-three-quarter-right');

// 5. 3/4 LEFT (front) - orbit ~45 degrees left showing front-left
await loadAndWait();
await orbitTo(170, 15, 25);
await capture('05-three-quarter-left');

// 6. LEFT SIDE - drag right to orbit camera right, showing left side
await loadAndWait();
await orbitTo(240, 0, 25);
await capture('06-left-side');

// 7. UNDER BRIM - look from below
await loadAndWait();
await orbitTo(0, -250, 30);
await capture('07-under-brim');

// 8. TOP DOWN - look from above
await loadAndWait();
await orbitTo(0, 200, 30);
await capture('08-top-down');

// Write report
const report = {
  timestamp: new Date().toISOString(),
  url,
  errors,
  modelResponses,
  captures: [
    '01-front', '02-back', '03-right-side', '04-three-quarter-right',
    '05-three-quarter-left', '06-left-side', '07-under-brim', '08-top-down',
  ],
};

await fs.writeFile(
  path.join(outDir, 'playwright-report.json'),
  JSON.stringify(report, null, 2),
  'utf8',
);

console.log('\n=== Results ===');
console.log('Saved screenshots to', outDir);
console.log('Model responses:', JSON.stringify(modelResponses));
if (errors.length) {
  console.log('Errors:');
  for (const e of errors) console.log('  ', e);
} else {
  console.log('Errors: none');
}

await browser.close();
