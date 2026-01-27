/**
 * Capture Diagnostics for Genuary 2026
 *
 * Tests that all media types can be captured correctly.
 * Useful for verifying the capture system after changes.
 *
 * Usage:
 *   bun run scripts/capture-diagnostics.ts           # Test all days
 *   bun run scripts/capture-diagnostics.ts 27       # Test specific day
 *   bun run scripts/capture-diagnostics.ts --quick  # Quick mode (PNG only)
 */

import { spawn, type Subprocess } from 'bun';
import path from 'node:path';

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}/coding-jams/genuary-2026/`;

// Day metadata for diagnostics
const DAY_INFO: Record<number, { mode: string; complexity: 'low' | 'medium' | 'high' }> = {
  7: { mode: 'p5', complexity: 'low' },
  8: { mode: 'p5', complexity: 'medium' },
  9: { mode: 'p5', complexity: 'medium' },
  10: { mode: 'p5', complexity: 'medium' },
  11: { mode: 'p5', complexity: 'low' },
  12: { mode: 'three', complexity: 'medium' },
  13: { mode: 'p5', complexity: 'medium' },
  15: { mode: 'p5', complexity: 'medium' },
  16: { mode: 'p5', complexity: 'low' },
  17: { mode: 'three', complexity: 'medium' },
  18: { mode: 'p5', complexity: 'low' },
  19: { mode: 'p5', complexity: 'low' },
  20: { mode: 'p5', complexity: 'low' },
  21: { mode: 'p5', complexity: 'low' },
  22: { mode: 'p5', complexity: 'low' },
  23: { mode: 'p5', complexity: 'medium' },
  24: { mode: 'p5', complexity: 'low' },
  25: { mode: 'p5', complexity: 'medium' },
  26: { mode: 'p5', complexity: 'medium' },
  27: { mode: 'three', complexity: 'high' },
  31: { mode: 'glsl', complexity: 'medium' },
};

interface DiagnosticResult {
  day: number;
  mode: string;
  canvasFound: boolean;
  pngCapture: boolean;
  gifButtonEnabled: boolean;
  error?: string;
}

let devServer: Subprocess<'ignore', 'pipe', 'pipe'> | null = null;

async function startDevServer(): Promise<void> {
  try {
    const response = await fetch(BASE_URL);
    if (response.ok) {
      console.log('Dev server already running');
      return;
    }
  } catch {
    // Need to start server
  }

  devServer = spawn({
    cmd: ['bun', 'run', 'dev'],
    cwd: path.join(import.meta.dir, '..'),
    stdout: 'pipe',
    stderr: 'pipe',
  });

  const maxWait = 30000;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) {
        console.log('Dev server ready');
        return;
      }
    } catch {
      // Not ready
    }
    await sleep(500);
  }

  throw new Error('Dev server failed to start');
}

function stopDevServer(): void {
  if (devServer) {
    devServer.kill();
    devServer = null;
  }
}

async function testDay(dayNum: number): Promise<DiagnosticResult> {
  const info = DAY_INFO[dayNum] || { mode: 'p5', complexity: 'medium' };

  const result: DiagnosticResult = {
    day: dayNum,
    mode: info.mode,
    canvasFound: false,
    pngCapture: false,
    gifButtonEnabled: false,
  };

  let chromium;
  try {
    const pw = await import('playwright');
    chromium = pw.chromium;
  } catch {
    result.error = 'Playwright not installed';
    return result;
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--disable-gpu', '--no-sandbox'],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 1000 },
    });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}#day${dayNum}`, { waitUntil: 'networkidle' });
    await sleep(3000);

    // Check for canvas
    const canvas = await page.locator('canvas').first();
    result.canvasFound = await canvas.isVisible().catch(() => false);

    if (result.canvasFound) {
      // Test PNG capture
      try {
        const buffer = await canvas.screenshot();
        result.pngCapture = buffer.length > 1000; // Sanity check for non-empty image
      } catch (e) {
        result.error = `PNG capture failed: ${e}`;
      }
    }

    // Check GIF button
    const gifBtn = page.locator('#download-timelapse-btn');
    const isVisible = await gifBtn.isVisible().catch(() => false);
    const isEnabled = isVisible && !(await gifBtn.isDisabled().catch(() => true));
    result.gifButtonEnabled = isEnabled;

    await context.close();
  } finally {
    await browser.close();
  }

  return result;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const quickMode = args.includes('--quick');
  const specificDay = args.find((a) => /^\d+$/.test(a));

  console.log('='.repeat(70));
  console.log('Genuary 2026 Capture Diagnostics');
  console.log('='.repeat(70));

  const daysToTest = specificDay
    ? [parseInt(specificDay, 10)]
    : Object.keys(DAY_INFO).map(Number).sort((a, b) => a - b);

  console.log(`Testing days: ${daysToTest.join(', ')}`);
  console.log(`Mode: ${quickMode ? 'Quick (PNG only)' : 'Full'}\n`);

  try {
    await startDevServer();

    const results: DiagnosticResult[] = [];

    for (const day of daysToTest) {
      process.stdout.write(`Day ${day.toString().padStart(2, '0')}... `);
      const result = await testDay(day);
      results.push(result);

      const status = result.canvasFound && result.pngCapture
        ? '✅'
        : result.error
        ? '❌'
        : '⚠️';

      console.log(
        `${status} mode=${result.mode} canvas=${result.canvasFound ? '✓' : '✗'} ` +
        `png=${result.pngCapture ? '✓' : '✗'} gif_btn=${result.gifButtonEnabled ? '✓' : '✗'}` +
        (result.error ? ` (${result.error})` : '')
      );
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('Summary');
    console.log('='.repeat(70));

    const byMode = results.reduce((acc, r) => {
      acc[r.mode] = acc[r.mode] || { total: 0, working: 0 };
      acc[r.mode].total++;
      if (r.canvasFound && r.pngCapture) acc[r.mode].working++;
      return acc;
    }, {} as Record<string, { total: number; working: number }>);

    for (const [mode, stats] of Object.entries(byMode)) {
      console.log(`${mode}: ${stats.working}/${stats.total} working`);
    }

    const failedDays = results.filter((r) => !r.canvasFound || !r.pngCapture);
    if (failedDays.length > 0) {
      console.log(`\nFailed days: ${failedDays.map((r) => r.day).join(', ')}`);
      process.exit(1);
    } else {
      console.log('\nAll days pass capture diagnostics!');
    }
  } finally {
    stopDevServer();
  }
}

main();
