/**
 * Museum Explorer Script
 *
 * Uses Playwright to navigate the museum and take screenshots.
 * This helps the Curator Agent see what they're building.
 */

import { chromium } from 'playwright';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const BASE_URL = 'http://localhost:3000/coding-jams/genuary-2026/#museum';
const OUTPUT_DIR = path.join(import.meta.dir, '..', 'outputs');

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Museum Explorer - Starting...');

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Launch browser with better WebGL support
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

    // Navigate to museum
    console.log(`Navigating to ${BASE_URL}...`);

    // Listen for console messages
    page.on('console', (msg) => {
      console.log(`[Page] ${msg.text()}`);
    });

    page.on('pageerror', (err) => {
      console.error(`[Page Error] ${err.message}`);
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    // Wait for museum to load
    console.log('Waiting for museum to load...');
    await page.waitForSelector('#museum-container', { timeout: 30000, state: 'attached' });
    await page.waitForSelector('#museum-container canvas', { timeout: 30000 });
    console.log('Museum loaded, waiting for artwork...');
    await sleep(8000); // Let scene and artwork load

    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '');

    // Helper to take screenshot (using page screenshot to avoid stability issues with animated canvas)
    async function screenshot(name: string) {
      // Wait a tiny bit for any render to complete
      await sleep(200);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `museum-${name}-${timestamp}.png`),
        fullPage: false,
      });
      console.log(`  Captured: museum-${name}-${timestamp}.png`);
    }

    // Take initial screenshot (entrance view)
    console.log('Taking screenshots...');
    await screenshot('entrance');

    // Move forward into the gallery
    console.log('Moving into gallery...');
    await page.keyboard.down('KeyW');
    await sleep(3000);
    await page.keyboard.up('KeyW');
    await sleep(300);
    await screenshot('gallery-approach');

    // Continue forward to center
    await page.keyboard.down('KeyW');
    await sleep(2500);
    await page.keyboard.up('KeyW');
    await sleep(300);
    await screenshot('gallery-center');

    // Turn right to face first exhibit (Day 1)
    console.log('Visiting exhibits...');
    await page.keyboard.down('ArrowRight');
    await sleep(1500);
    await page.keyboard.up('ArrowRight');
    await sleep(300);
    await screenshot('exhibit-day1');

    // Walk closer
    await page.keyboard.down('KeyW');
    await sleep(1000);
    await page.keyboard.up('KeyW');
    await sleep(300);
    await screenshot('exhibit-day1-close');

    // Back up
    await page.keyboard.down('KeyS');
    await sleep(1000);
    await page.keyboard.up('KeyS');

    // Turn left ~90° to next exhibit
    await page.keyboard.down('ArrowLeft');
    await sleep(2000);
    await page.keyboard.up('ArrowLeft');
    await sleep(300);
    await screenshot('exhibit-day7');

    // Walk closer to exhibit 2
    await page.keyboard.down('KeyW');
    await sleep(1000);
    await page.keyboard.up('KeyW');
    await sleep(300);
    await screenshot('exhibit-day7-close');

    // Back up and turn to exhibit 3
    await page.keyboard.down('KeyS');
    await sleep(1000);
    await page.keyboard.up('KeyS');
    await page.keyboard.down('ArrowLeft');
    await sleep(2000);
    await page.keyboard.up('ArrowLeft');
    await sleep(300);
    await screenshot('exhibit-day11');

    // Walk closer
    await page.keyboard.down('KeyW');
    await sleep(1000);
    await page.keyboard.up('KeyW');
    await sleep(300);
    await screenshot('exhibit-day11-close');

    // Back up and turn to exhibit 4
    await page.keyboard.down('KeyS');
    await sleep(1000);
    await page.keyboard.up('KeyS');
    await page.keyboard.down('ArrowLeft');
    await sleep(2000);
    await page.keyboard.up('ArrowLeft');
    await sleep(300);
    await screenshot('exhibit-day13');

    // Walk closer
    await page.keyboard.down('KeyW');
    await sleep(1000);
    await page.keyboard.up('KeyW');
    await sleep(300);
    await screenshot('exhibit-day13-close');

    // Look toward a wing (north doorway)
    console.log('Looking toward wings...');
    await page.keyboard.down('KeyS');
    await sleep(1500);
    await page.keyboard.up('KeyS');
    await page.keyboard.down('ArrowLeft');
    await sleep(1500);
    await page.keyboard.up('ArrowLeft');
    await sleep(300);
    await screenshot('north-doorway');

    // Walk toward north wing
    await page.keyboard.down('KeyW');
    await sleep(3000);
    await page.keyboard.up('KeyW');
    await sleep(300);
    await screenshot('north-wing-entrance');

    console.log('\n=== Screenshots complete! ===');
    console.log(`Saved to: ${OUTPUT_DIR}`);

    await context.close();
  } finally {
    await browser.close();
  }

  console.log('\nExploration complete!');
}

main().catch(console.error);
