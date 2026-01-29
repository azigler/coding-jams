/**
 * Quick entrance shot to see welcome sign
 */
import { chromium } from 'playwright';
import path from 'node:path';

async function main() {
  console.log('Entrance Shot...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--use-gl=egl', '--enable-webgl', '--ignore-gpu-blocklist'],
  });

  const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });

  page.on('console', msg => {
    if (msg.text().includes('Museum loaded')) console.log('  Museum ready');
  });

  await page.goto('http://localhost:6009/coding-jams/genuary-2026/#museum', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 8000));

  // Turn around to face the welcome sign (behind spawn)
  await page.keyboard.down('ArrowLeft');
  await new Promise(r => setTimeout(r, 3000)); // Turn 180 degrees
  await page.keyboard.up('ArrowLeft');
  await new Promise(r => setTimeout(r, 500));

  const ts = Date.now();
  try {
    await page.screenshot({ path: `outputs/welcome-sign-${ts}.png`, timeout: 15000 });
    console.log(`  Saved: outputs/welcome-sign-${ts}.png`);
  } catch (e) {
    console.log('  Screenshot failed');
  }

  // Now face forward and go to gallery for orb shot
  await page.keyboard.press('Digit2'); // Teleport to gallery
  await new Promise(r => setTimeout(r, 2000));

  try {
    await page.screenshot({ path: `outputs/gallery-orb-${ts}.png`, timeout: 15000 });
    console.log(`  Saved: outputs/gallery-orb-${ts}.png`);
  } catch (e) {
    console.log('  Screenshot failed');
  }

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
