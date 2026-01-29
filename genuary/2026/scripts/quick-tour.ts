/**
 * Quick Museum Tour - Uses teleport keys for reliable screenshots
 */
import { chromium } from 'playwright';
import path from 'node:path';

async function main() {
  console.log('Quick Tour...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--use-gl=egl', '--enable-webgl', '--ignore-gpu-blocklist'],
  });

  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Museum') || text.includes('Loaded') || text.includes('Teleported')) {
      console.log(`  ${text}`);
    }
  });

  await page.goto('http://localhost:6009/coding-jams/genuary-2026/#museum', { waitUntil: 'domcontentloaded' });
  console.log('Waiting for scene...');
  await new Promise(r => setTimeout(r, 10000));

  const ts = Date.now();

  // 1. Entrance
  await page.keyboard.press('Digit1');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `outputs/tour-entrance-${ts}.png` });
  console.log('  Saved entrance');

  // 2. Gallery center
  await page.keyboard.press('Digit2');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `outputs/tour-gallery-${ts}.png` });
  console.log('  Saved gallery');

  // 3. North wing
  await page.keyboard.press('Digit3');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `outputs/tour-north-${ts}.png` });
  console.log('  Saved north wing');

  // 4. West wing
  await page.keyboard.press('Digit4');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `outputs/tour-west-${ts}.png` });
  console.log('  Saved west wing');

  // 5. East wing
  await page.keyboard.press('Digit5');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `outputs/tour-east-${ts}.png` });
  console.log('  Saved east wing');

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
