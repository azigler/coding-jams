/**
 * Headless capture script for Genuary 2026
 *
 * Captures PNG screenshot and GIF recording using Playwright.
 * Used by /pull-request to create full-service PRs with media assets.
 *
 * Usage:
 *   bun run capture 12           # Capture day 12
 *   bun run capture 12 --png     # PNG only
 *   bun run capture 12 --gif     # GIF only
 *
 * Requirements:
 *   bun add -D playwright
 *   bunx playwright install chromium
 *   bunx playwright install-deps chromium  # For headless servers
 */

import { spawn, type Subprocess } from 'bun';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

// ============================================================================
// Configuration
// ============================================================================

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}/coding-jams/genuary-2026/`;
const OUTPUT_DIR = path.join(import.meta.dir, '..', 'outputs');

// Timing configuration
const CANVAS_WAIT_MS = 3000;      // Wait for canvas to initialize
const PNG_DELAY_MS = 2000;        // Wait before capturing PNG (let animation settle)
const GIF_RECORD_TIME_MS = 12000; // GIF recording takes 10s + encoding time
const GIF_TOTAL_TIMEOUT_MS = 180000; // Max time to wait for GIF download (3 minutes for recording + encoding)

// ============================================================================
// Types
// ============================================================================

interface CaptureOptions {
  day: number;
  png: boolean;
  gif: boolean;
}

interface CaptureResult {
  pngPath?: string;
  gifPath?: string;
  errors: string[];
}

// ============================================================================
// Dev Server Management
// ============================================================================

let devServer: Subprocess<'ignore', 'pipe', 'pipe'> | null = null;

/**
 * Start the Vite dev server
 */
async function startDevServer(): Promise<void> {
  console.log('Starting dev server...');

  // Check if port is already in use
  try {
    const response = await fetch(BASE_URL);
    if (response.ok) {
      console.log('Dev server already running on port', PORT);
      return;
    }
  } catch {
    // Port not in use, we need to start the server
  }

  devServer = spawn({
    cmd: ['bun', 'run', 'dev'],
    cwd: path.join(import.meta.dir, '..'),
    stdout: 'pipe',
    stderr: 'pipe',
  });

  // Wait for server to be ready
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
      // Not ready yet
    }
    await sleep(500);
  }

  throw new Error('Dev server failed to start within 30 seconds');
}

/**
 * Stop the dev server
 */
function stopDevServer(): void {
  if (devServer) {
    console.log('Stopping dev server...');
    devServer.kill();
    devServer = null;
  }
}

// ============================================================================
// Playwright Capture
// ============================================================================

/**
 * Capture PNG and/or GIF for a day using Playwright
 */
async function captureDay(options: CaptureOptions): Promise<CaptureResult> {
  const { day, png, gif } = options;
  const result: CaptureResult = { errors: [] };

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Import playwright dynamically (may not be installed yet)
  let chromium;
  try {
    const pw = await import('playwright');
    chromium = pw.chromium;
  } catch (error) {
    throw new Error(
      'Playwright not installed. Run:\n' +
      '  bun add -D playwright\n' +
      '  bunx playwright install chromium\n' +
      '  bunx playwright install-deps chromium  # For headless servers'
    );
  }

  const dayStr = day.toString().padStart(2, '0');
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  console.log(`\nCapturing Day ${day}...`);

  // Launch browser with SwiftShader for WebGL support on headless servers
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
      acceptDownloads: true,
    });

    const page = await context.newPage();

    // Navigate to the day
    const url = `${BASE_URL}#day${day}`;
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for content to be ready - either canvas or HTML panel (Day 28)
    console.log('Waiting for content...');
    let isHtmlMode = false;
    try {
      await page.waitForSelector('canvas', { timeout: 5000 });
    } catch {
      // No canvas found, try HTML mode panel (Day 28)
      console.log('No canvas found, checking for HTML mode panel...');
      try {
        await page.waitForSelector('.day28-panel', { timeout: 5000 });
        isHtmlMode = true;
        console.log('HTML mode panel detected');
      } catch {
        throw new Error('Neither canvas nor HTML panel found');
      }
    }
    await sleep(CANVAS_WAIT_MS);

    // Capture PNG
    if (png) {
      console.log('Capturing PNG...');
      await sleep(PNG_DELAY_MS);

      try {
        // Get either canvas or HTML panel element
        const targetElement = isHtmlMode
          ? await page.locator('.day28-panel').first()
          : await page.locator('canvas').first();
        const pngFilename = `genuary-2026-day-${dayStr}-${timestamp}.png`;
        const pngPath = path.join(OUTPUT_DIR, pngFilename);

        await targetElement.screenshot({ path: pngPath });
        result.pngPath = pngPath;
        console.log(`PNG saved: ${pngPath}`);
      } catch (error) {
        const msg = `PNG capture failed: ${error instanceof Error ? error.message : String(error)}`;
        result.errors.push(msg);
        console.error(msg);
      }
    }

    // Capture GIF
    if (gif) {
      console.log('Capturing GIF (this takes ~15-30 seconds)...');

      // Listen for console messages to debug
      page.on('console', (msg) => {
        const text = msg.text();
        if (text.includes('🎬') || text.includes('📹') || text.includes('✅') || text.includes('❌') || text.includes('Recording') || text.includes('GIF')) {
          console.log(`[Page Console] ${text}`);
        }
      });

      // Listen for errors
      page.on('pageerror', (err) => {
        console.error(`[Page Error] ${err.message}`);
      });

      try {
        // Set up download handler before clicking
        const downloadPromise = page.waitForEvent('download', {
          timeout: GIF_TOTAL_TIMEOUT_MS,
        });

        // Click the Record GIF button
        const recordBtn = page.locator('#download-timelapse-btn');
        await recordBtn.waitFor({ state: 'visible', timeout: 5000 });

        // Check if button is disabled
        const isDisabled = await recordBtn.isDisabled();
        if (isDisabled) {
          result.errors.push('GIF recording not enabled for this day');
          console.log('GIF recording not enabled for this day');
        } else {
          await recordBtn.click();
          console.log('Recording started...');

          // Poll button text to track progress
          const pollProgress = async () => {
            let lastText = '';
            const pollInterval = setInterval(async () => {
              try {
                const text = await recordBtn.textContent();
                if (text && text !== lastText) {
                  console.log(`[Button status] ${text}`);
                  lastText = text;
                }
              } catch {
                // Page might have closed
              }
            }, 2000);
            return pollInterval;
          };

          const progressInterval = await pollProgress();

          try {
            // Wait for download to complete
            const download = await downloadPromise;
            clearInterval(progressInterval);

            const gifFilename = `genuary-2026-day-${dayStr}-${timestamp}.gif`;
            const gifPath = path.join(OUTPUT_DIR, gifFilename);

            await download.saveAs(gifPath);
            result.gifPath = gifPath;
            console.log(`GIF saved: ${gifPath}`);
          } catch (downloadError) {
            clearInterval(progressInterval);
            throw downloadError;
          }
        }
      } catch (error) {
        const msg = `GIF capture failed: ${error instanceof Error ? error.message : String(error)}`;
        result.errors.push(msg);
        console.error(msg);
      }
    }

    await context.close();
  } finally {
    await browser.close();
  }

  return result;
}

// ============================================================================
// CLI
// ============================================================================

/**
 * Parse command line arguments
 */
function parseArgs(): CaptureOptions {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Genuary 2026 Capture Script

Usage:
  bun run capture <day>           Capture PNG and GIF for a day
  bun run capture <day> --png     Capture PNG only
  bun run capture <day> --gif     Capture GIF only

Examples:
  bun run capture 12              Capture day 12 (PNG + GIF)
  bun run capture 26 --png        Capture day 26 PNG only

Output:
  Files are saved to ./outputs/
`);
    process.exit(0);
  }

  const day = parseInt(args[0], 10);
  if (isNaN(day) || day < 1 || day > 31) {
    console.error('Error: Day must be a number between 1 and 31');
    process.exit(1);
  }

  const pngOnly = args.includes('--png');
  const gifOnly = args.includes('--gif');

  // If neither specified, capture both
  const png = pngOnly || (!pngOnly && !gifOnly);
  const gif = gifOnly || (!pngOnly && !gifOnly);

  return { day, png, gif };
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const options = parseArgs();

  console.log('='.repeat(60));
  console.log('Genuary 2026 Headless Capture');
  console.log('='.repeat(60));
  console.log(`Day: ${options.day}`);
  console.log(`Capture PNG: ${options.png}`);
  console.log(`Capture GIF: ${options.gif}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('='.repeat(60));

  try {
    // Start dev server
    await startDevServer();

    // Capture the day
    const result = await captureDay(options);

    // Report results
    console.log('\n' + '='.repeat(60));
    console.log('Capture Complete');
    console.log('='.repeat(60));

    if (result.pngPath) {
      console.log(`PNG: ${result.pngPath}`);
    }
    if (result.gifPath) {
      console.log(`GIF: ${result.gifPath}`);
    }
    if (result.errors.length > 0) {
      console.log('\nErrors:');
      result.errors.forEach((err) => console.log(`  - ${err}`));
    }

    // Exit with error if any captures failed
    if (result.errors.length > 0 && !result.pngPath && !result.gifPath) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\nFatal error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    stopDevServer();
  }
}

// ============================================================================
// Utilities
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Run
// ============================================================================

main();
