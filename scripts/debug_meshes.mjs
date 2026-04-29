import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://127.0.0.1:4175/designer?preview', { waitUntil: 'networkidle' });
await page.waitForSelector('canvas', { timeout: 15000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(5000);

const meshInfo = await page.evaluate(() => {
  const canvas = document.querySelector('canvas');
  if (!canvas) return { error: 'no canvas' };

  const r3f = canvas.__r3f;
  if (!r3f) return { error: 'no r3f store' };

  const scene = r3f.store?.getState()?.scene;
  if (!scene) return { error: 'no scene' };

  const meshes = [];
  scene.traverse((child) => {
    meshes.push({
      name: child.name || '(unnamed)',
      parent: child.parent?.name || '(root)',
      type: child.type,
      isMesh: !!child.isMesh,
      visible: child.visible,
      childCount: child.children?.length || 0,
    });
  });

  return { total: meshes.length, meshes };
});

console.log(JSON.stringify(meshInfo, null, 2));
await browser.close();
