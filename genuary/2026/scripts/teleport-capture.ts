/**
 * Teleport-based museum capture
 * Uses the new teleport keys to quickly capture different views
 */

import { chromium } from 'playwright';
import path from 'node:path';

const BASE_URL = 'http://localhost:6009/coding-jams/genuary-2026/#museum';
const OUTPUT_DIR = path.join(import.meta.dir, '..', 'outputs');

async function main() {
  console.log('Teleport Capture - Starting...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--use-gl=egl', '--enable-webgl', '--ignore-gpu-blocklist'],
  });

  const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });

  // Filter console for artwork loading
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('Loaded live artwork') && !text.includes('[Wing]')) {
      console.log(`  ${text}`);
    }
    if (text.includes('Teleported')) {
      console.log(`  ${text}`);
    }
  });

  console.log(`Loading museum...`);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  // Wait for museum and artwork to load
  await new Promise(r => setTimeout(r, 12000));

  const ts = Date.now();

  // Capture at each teleport point
  const points = [
    { key: 'Digit1', name: 'entrance' },
    { key: 'Digit2', name: 'gallery-center' },
    { key: 'Digit3', name: 'north-wing' },
    { key: 'Digit4', name: 'west-wing' },
    { key: 'Digit5', name: 'east-wing' },
  ];

  for (const point of points) {
    console.log(`Capturing ${point.name}...`);
    await page.keyboard.press(point.key);
    await new Promise(r => setTimeout(r, 1000)); // Brief wait after teleport

    try {
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `teleport-${point.name}-${ts}.png`),
        timeout: 10000,
      });
      console.log(`  Saved: teleport-${point.name}-${ts}.png`);
    } catch (e) {
      console.log(`  Screenshot failed for ${point.name}: ${e}`);
    }
  }

  await browser.close();
  console.log('\nDone!');
}

main().catch(console.error);
