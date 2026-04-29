import { chromium } from 'playwright';
import fs from 'node:fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 2048, height: 1024 } });

await page.setContent(`
<html>
<head>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
  body { margin: 0; background: transparent; }
  canvas { display: block; }
</style>
</head>
<body>
<canvas id="c" width="2048" height="1024"></canvas>
<script>
async function render() {
  await document.fonts.ready;

  const c = document.getElementById('c');
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  const lines = ['MAKE EARTH', 'GREAT AGAIN'];
  const fontSize = 280;

  ctx.font = '900 ' + fontSize + 'px "Playfair Display", "Times New Roman", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Gold color matching the provided image
  ctx.fillStyle = '#F5C800';

  const lineHeight = fontSize * 1.1;
  const startY = c.height / 2 - lineHeight * 0.5;

  lines.forEach((line, i) => {
    ctx.fillText(line, c.width / 2, startY + i * lineHeight);
  });

  const data = ctx.getImageData(0, 0, c.width, c.height);
  let filled = 0;
  for (let i = 0; i < data.data.length; i += 4) {
    if (data.data[i + 3] > 20) filled++;
  }
  document.title = 'pixels:' + filled;
}
render();
</script>
</body>
</html>
`);

await page.waitForTimeout(3000);
const title = await page.title();
console.log('Render result:', title);

const dataUrl = await page.evaluate(() => {
  return document.getElementById('c').toDataURL('image/png');
});

const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
fs.writeFileSync('/Users/z/work/mega/store/public/images/mega_front_text.png', Buffer.from(base64, 'base64'));
console.log('Saved mega_front_text.png');

await browser.close();
