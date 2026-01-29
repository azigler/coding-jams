/**
 * Simple capture - just take one screenshot with extended timeout
 */
import { chromium } from 'playwright';

async function main() {
  console.log('Simple capture...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--use-gl=egl', '--enable-webgl', '--ignore-gpu-blocklist'],
  });

  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });

  try {
    await page.goto('http://localhost:6009/coding-jams/genuary-2026/#museum', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    console.log('Page loaded, waiting for render...');
    await new Promise(r => setTimeout(r, 15000));

    // Teleport to gallery for better view
    await page.keyboard.press('Digit2');
    await new Promise(r => setTimeout(r, 3000));

    const ts = Date.now();

    // Try capturing with omitBackground to see if that helps
    await page.screenshot({
      path: `outputs/simple-${ts}.png`,
      timeout: 60000,
      animations: 'disabled'
    });

    console.log(`Saved: outputs/simple-${ts}.png`);

  } catch (error) {
    console.error('Failed:', (error as Error).message);
  } finally {
    await browser.close();
  }
}

main();
