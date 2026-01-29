/**
 * Quick Gallery Shot
 */

import { chromium } from 'playwright';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000/coding-jams/genuary-2026/#museum';
const OUTPUT_DIR = path.join(import.meta.dir, '..', 'outputs');

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Quick Gallery Shot...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--use-gl=egl', '--enable-webgl', '--ignore-gpu-blocklist'],
  });

  const context = await browser.newContext({ viewport: { width: 1000, height: 900 } });
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#museum-container canvas', { timeout: 30000 });
  await sleep(8000); // Wait for artwork

  const ts = Date.now();

  // Move to gallery center
  await page.keyboard.down('KeyW');
  await sleep(4500);
  await page.keyboard.up('KeyW');
  await sleep(400);

  // Screenshot
  await page.screenshot({ path: path.join(OUTPUT_DIR, `gallery-center-${ts}.png`) });
  console.log(`Captured: gallery-center-${ts}.png`);

  // Turn right
  await page.keyboard.down('ArrowRight');
  await sleep(1300);
  await page.keyboard.up('ArrowRight');
  await sleep(300);
  await page.screenshot({ path: path.join(OUTPUT_DIR, `gallery-exhibit-${ts}.png`) });
  console.log(`Captured: gallery-exhibit-${ts}.png`);

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
