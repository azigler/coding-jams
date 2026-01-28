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

  // Launch browser with SwiftShader for WebGL
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-gl=swiftshader',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
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
    await sleep(4000); // Let scene fully load

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

    // Look around - turn left
    console.log('Looking around gallery...');
    await page.keyboard.down('ArrowLeft');
    await sleep(800);
    await page.keyboard.up('ArrowLeft');
    await sleep(300);

    await canvas.screenshot({
      path: path.join(OUTPUT_DIR, `museum-gallery-left-${timestamp}.png`)
    });

    // Turn more to see exhibits
    await page.keyboard.down('ArrowLeft');
    await sleep(600);
    await page.keyboard.up('ArrowLeft');
    await sleep(300);

    await canvas.screenshot({
      path: path.join(OUTPUT_DIR, `museum-exhibit-wall1-${timestamp}.png`)
    });

    // Continue turning
    await page.keyboard.down('ArrowLeft');
    await sleep(800);
    await page.keyboard.up('ArrowLeft');
    await sleep(300);

    await canvas.screenshot({
      path: path.join(OUTPUT_DIR, `museum-exhibit-wall2-${timestamp}.png`)
    });

    // Turn to see more
    await page.keyboard.down('ArrowLeft');
    await sleep(800);
    await page.keyboard.up('ArrowLeft');
    await sleep(300);

    await canvas.screenshot({
      path: path.join(OUTPUT_DIR, `museum-gallery-north-${timestamp}.png`)
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
    console.log(`  museum-gallery-left-${timestamp}.png`);
    console.log(`  museum-exhibit-wall1-${timestamp}.png`);
    console.log(`  museum-exhibit-wall2-${timestamp}.png`);
    console.log(`  museum-gallery-north-${timestamp}.png`);
    console.log(`  museum-exhibit-closeup-${timestamp}.png`);

    await context.close();
  } finally {
    await browser.close();
  }

  console.log('\nExploration complete!');
}

main().catch(console.error);
