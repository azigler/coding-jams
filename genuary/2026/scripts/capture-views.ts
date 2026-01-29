/**
 * Capture museum views with minimal navigation for reliability
 */
import { chromium } from 'playwright';

async function main() {
  console.log('Capturing museum views...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--use-gl=egl', '--enable-webgl', '--ignore-gpu-blocklist'],
  });

  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

  // Suppress most console output
  page.on('console', msg => {
    if (msg.text().includes('Teleported') || msg.text().includes('Museum loaded')) {
      console.log(`  ${msg.text()}`);
    }
  });

  const ts = Date.now();

  try {
    await page.goto('http://localhost:6009/coding-jams/genuary-2026/#museum', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('Waiting for museum to initialize...');
    await new Promise(r => setTimeout(r, 12000));

    // Take screenshot at spawn location
    console.log('Capturing entrance view...');
    await page.screenshot({
      path: `outputs/view-entrance-${ts}.png`,
      timeout: 10000
    });
    console.log('  ✓ Entrance captured');

    // Teleport to gallery and capture
    console.log('Teleporting to gallery...');
    await page.keyboard.press('Digit2');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({
      path: `outputs/view-gallery-${ts}.png`,
      timeout: 10000
    });
    console.log('  ✓ Gallery captured');

    // Teleport to north wing
    console.log('Teleporting to north wing...');
    await page.keyboard.press('Digit3');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({
      path: `outputs/view-north-${ts}.png`,
      timeout: 10000
    });
    console.log('  ✓ North wing captured');

    console.log(`\nScreenshots saved to outputs/view-*-${ts}.png`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

main();
