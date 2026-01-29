/**
 * Gallery Tour - Capture a comprehensive tour of the museum
 */

import { chromium } from 'playwright';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000/coding-jams/genuary-2026/#museum';
const OUTPUT_DIR = path.join(import.meta.dir, '..', 'outputs');

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Gallery Tour - Starting...');

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=egl',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1000, height: 900 },
    });

    const page = await context.newPage();

    // Filtered console logging
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('Loaded live artwork') && !text.includes('[Wing]')) {
        console.log(`[Page] ${text}`);
      }
    });

    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('#museum-container canvas', { timeout: 30000 });
    console.log('Museum loaded, waiting for artwork...');
    await sleep(10000);

    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '');

    async function screenshot(name: string) {
      await sleep(200);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `tour-${name}-${timestamp}.png`),
        fullPage: false,
      });
      console.log(`  Captured: tour-${name}.png`);
    }

    // Entrance
    await screenshot('1-entrance');

    // Forward to gallery
    console.log('Moving to gallery center...');
    await page.keyboard.down('KeyW');
    await sleep(5000);
    await page.keyboard.up('KeyW');
    await sleep(300);
    await screenshot('2-gallery-center');

    // Rotate 360 to see all gallery exhibits
    console.log('Gallery panorama...');
    for (let i = 0; i < 4; i++) {
      await page.keyboard.down('ArrowRight');
      await sleep(1500);
      await page.keyboard.up('ArrowRight');
      await sleep(200);
      await screenshot(`3-gallery-view-${i + 1}`);
    }

    // Approach Day 1 exhibit
    console.log('Approaching Day 1 exhibit...');
    await page.keyboard.down('KeyW');
    await sleep(1500);
    await page.keyboard.up('KeyW');
    await sleep(200);
    await screenshot('4-day1-closeup');

    console.log('\n=== Done! ===');
    console.log(`Files saved with prefix: tour-*-${timestamp}.png`);
    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
