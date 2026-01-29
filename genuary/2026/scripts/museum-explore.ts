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
  // Try EGL first (hardware-accelerated), fall back to ANGLE
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=egl',  // Better than swiftshader for canvas textures
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 1000 },
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

    // Wait a bit for JS to initialize
    await sleep(2000);

    // Check what's on the page
    const bodyHTML = await page.evaluate(() => document.body.innerHTML.slice(0, 500));
    console.log('Body HTML preview:', bodyHTML);

    // Wait for museum container to be created
    console.log('Waiting for museum to load...');
    await page.waitForSelector('#museum-container', { timeout: 20000 });
    await sleep(1000);

    // Wait for canvas to appear inside museum container
    console.log('Waiting for canvas...');
    await page.waitForSelector('#museum-container canvas', { timeout: 10000 });
    await sleep(6000); // Let scene and live artwork fully load

    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '');

    // Take initial screenshot (entrance view)
    console.log('Taking entrance screenshot...');
    const canvas = page.locator('#museum-container canvas').first();
    await canvas.screenshot({
      path: path.join(OUTPUT_DIR, `museum-entrance-${timestamp}.png`)
    });

    // Move forward into the gallery
    console.log('Moving forward into gallery...');
    await page.keyboard.down('KeyW');
    await sleep(3000);
    await page.keyboard.up('KeyW');
    await sleep(500);

    await canvas.screenshot({
      path: path.join(OUTPUT_DIR, `museum-gallery-approach-${timestamp}.png`)
    });

    // Continue forward
    await page.keyboard.down('KeyW');
    await sleep(2500);
    await page.keyboard.up('KeyW');
    await sleep(500);

    await canvas.screenshot({
      path: path.join(OUTPUT_DIR, `museum-gallery-center-${timestamp}.png`)
    });

    // Full 360° rotation to see all exhibit walls
    console.log('Looking around gallery - full rotation...');

    // There are 4 exhibit walls (walls 1, 3, 5, 7) between the 4 doorways
    // Each wall segment is 45° (360° / 8 walls)
    // Exhibits are on walls 1, 3, 5, 7 which are at roughly 45°, 135°, 225°, 315°

    // Turn ~45° to face first exhibit (wall 1 - Day 1)
    await page.keyboard.down('ArrowLeft');
    await sleep(500);
    await page.keyboard.up('ArrowLeft');
    await sleep(300);

    await canvas.screenshot({
      path: path.join(OUTPUT_DIR, `museum-exhibit-day1-${timestamp}.png`)
    });

    // Turn ~90° more to face exhibit wall 3 (Day 7)
    await page.keyboard.down('ArrowLeft');
    await sleep(1000);
    await page.keyboard.up('ArrowLeft');
    await sleep(300);

    await canvas.screenshot({
      path: path.join(OUTPUT_DIR, `museum-exhibit-day7-${timestamp}.png`)
    });

    // Turn ~90° more to face exhibit wall 5 (Day 11)
    await page.keyboard.down('ArrowLeft');
    await sleep(1000);
    await page.keyboard.up('ArrowLeft');
    await sleep(300);

    await canvas.screenshot({
      path: path.join(OUTPUT_DIR, `museum-exhibit-day11-${timestamp}.png`)
    });

    // Turn ~90° more to face exhibit wall 7 (Day 13)
    await page.keyboard.down('ArrowLeft');
    await sleep(1000);
    await page.keyboard.up('ArrowLeft');
    await sleep(300);

    await canvas.screenshot({
      path: path.join(OUTPUT_DIR, `museum-exhibit-day13-${timestamp}.png`)
    });

    // Walk toward an exhibit
    console.log('Approaching an exhibit...');
    await page.keyboard.down('KeyW');
    await sleep(1500);
    await page.keyboard.up('KeyW');
    await sleep(300);

    await canvas.screenshot({
      path: path.join(OUTPUT_DIR, `museum-exhibit-closeup-${timestamp}.png`)
    });

    console.log('\n=== Screenshots saved to outputs/ ===');
    console.log('Files:');
    console.log(`  museum-entrance-${timestamp}.png`);
    console.log(`  museum-gallery-approach-${timestamp}.png`);
    console.log(`  museum-gallery-center-${timestamp}.png`);
    console.log(`  museum-exhibit-day1-${timestamp}.png`);
    console.log(`  museum-exhibit-day7-${timestamp}.png`);
    console.log(`  museum-exhibit-day11-${timestamp}.png`);
    console.log(`  museum-exhibit-day13-${timestamp}.png`);
    console.log(`  museum-exhibit-closeup-${timestamp}.png`);

    await context.close();
  } finally {
    await browser.close();
  }

  console.log('\nExploration complete!');
}

main().catch(console.error);
