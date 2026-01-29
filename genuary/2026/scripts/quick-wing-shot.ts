/**
 * Quick Wing Shot - Capture a screenshot of wing exhibits
 */

import { chromium } from 'playwright';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000/coding-jams/genuary-2026/#museum';
const OUTPUT_DIR = path.join(import.meta.dir, '..', 'outputs');

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Quick Wing Shot - Starting...');

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

    // Listen for console messages
    page.on('console', (msg) => {
      if (msg.text().includes('Loaded live artwork')) {
        console.log(`[Page] ${msg.text()}`);
      }
    });

    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    // Wait for museum to load
    await page.waitForSelector('#museum-container canvas', { timeout: 30000 });
    console.log('Museum loaded, waiting for artwork...');
    await sleep(12000); // Extra time for all artwork to load

    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '');

    async function screenshot(name: string) {
      await sleep(300);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `museum-${name}-${timestamp}.png`),
        fullPage: false,
      });
      console.log(`  Captured: museum-${name}-${timestamp}.png`);
    }

    // Move forward into the gallery
    console.log('Moving into gallery...');
    await page.keyboard.down('KeyW');
    await sleep(5500); // Go all the way to center
    await page.keyboard.up('KeyW');
    await sleep(500);

    // Turn to face north wing
    console.log('Turning to north wing...');
    await page.keyboard.down('ArrowLeft');
    await sleep(2500);
    await page.keyboard.up('ArrowLeft');
    await sleep(300);
    await screenshot('north-wing-view');

    // Enter north wing
    console.log('Entering north wing...');
    await page.keyboard.down('KeyW');
    await sleep(4000);
    await page.keyboard.up('KeyW');
    await sleep(300);
    await screenshot('north-wing-inside');

    // Turn to see left wall exhibits
    await page.keyboard.down('ArrowLeft');
    await sleep(1200);
    await page.keyboard.up('ArrowLeft');
    await sleep(300);
    await screenshot('north-wing-left-exhibits');

    // Turn around to see right wall exhibits
    await page.keyboard.down('ArrowRight');
    await sleep(2400);
    await page.keyboard.up('ArrowRight');
    await sleep(300);
    await screenshot('north-wing-right-exhibits');

    console.log('\n=== Done! ===');
    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
