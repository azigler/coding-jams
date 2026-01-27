/**
 * Museum Testing Script
 *
 * Headlessly navigates the museum, captures screenshots at waypoints,
 * and reports console errors and performance metrics.
 *
 * Usage:
 *   bun run museum:test                    # Full test suite
 *   bun run museum:test --quick            # Just check it loads
 *   bun run museum:test --waypoints        # Navigate all waypoints
 *   bun run museum:test --screenshot       # Capture current view
 */

import { spawn, type Subprocess } from 'bun';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

// ============================================================================
// Configuration
// ============================================================================

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}/coding-jams/genuary-2026/`;
const MUSEUM_URL = `${BASE_URL}#museum`;
const OUTPUT_DIR = path.join(import.meta.dir, '..', 'outputs', 'museum-tests');
const WAYPOINTS_FILE = path.join(import.meta.dir, '..', '.claude', 'analysis', 'waypoints.json');

// Default waypoints if none defined
const DEFAULT_WAYPOINTS = [
  { name: 'entrance', x: 0, y: 1.6, z: 5, lookAt: { x: 0, y: 1.6, z: 0 } },
  { name: 'center', x: 0, y: 1.6, z: 0, lookAt: { x: 5, y: 1.6, z: 0 } },
];

interface Waypoint {
  name: string;
  x: number;
  y: number;
  z: number;
  lookAt?: { x: number; y: number; z: number };
}

interface TestResult {
  timestamp: string;
  success: boolean;
  loadTime: number;
  consoleErrors: string[];
  consoleWarnings: string[];
  waypoints: WaypointResult[];
  fps?: number;
  screenshots: string[];
}

interface WaypointResult {
  name: string;
  reached: boolean;
  screenshot?: string;
  fps?: number;
  error?: string;
}

// ============================================================================
// Dev Server Management
// ============================================================================

let devServer: Subprocess<'ignore', 'pipe', 'pipe'> | null = null;

async function startDevServer(): Promise<void> {
  try {
    const response = await fetch(BASE_URL);
    if (response.ok) {
      console.log('Dev server already running');
      return;
    }
  } catch {
    // Need to start
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

// ============================================================================
// Testing Functions
// ============================================================================

async function loadWaypoints(): Promise<Waypoint[]> {
  try {
    const content = await readFile(WAYPOINTS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    console.log('No waypoints file found, using defaults');
    return DEFAULT_WAYPOINTS;
  }
}

async function runMuseumTest(options: {
  quick?: boolean;
  waypoints?: boolean;
  screenshot?: boolean;
}): Promise<TestResult> {
  const result: TestResult = {
    timestamp: new Date().toISOString(),
    success: false,
    loadTime: 0,
    consoleErrors: [],
    consoleWarnings: [],
    waypoints: [],
    screenshots: [],
  };

  await mkdir(OUTPUT_DIR, { recursive: true });

  let chromium;
  try {
    const pw = await import('playwright');
    chromium = pw.chromium;
  } catch {
    throw new Error('Playwright not installed');
  }

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
      viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();

    // Collect console messages
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        result.consoleErrors.push(text);
      } else if (msg.type() === 'warning') {
        result.consoleWarnings.push(text);
      }
    });

    page.on('pageerror', (err) => {
      result.consoleErrors.push(`Page error: ${err.message}`);
    });

    // Navigate to museum
    console.log('Loading museum...');
    const loadStart = Date.now();

    try {
      await page.goto(MUSEUM_URL, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      console.log('Museum route not found or failed to load');
      result.consoleErrors.push(`Load failed: ${e}`);
      return result;
    }

    result.loadTime = Date.now() - loadStart;
    console.log(`Loaded in ${result.loadTime}ms`);

    // Wait for Three.js canvas
    await sleep(2000);

    const canvas = await page.locator('canvas').first();
    const canvasVisible = await canvas.isVisible().catch(() => false);

    if (!canvasVisible) {
      console.log('No canvas found - museum may not be implemented yet');
      result.consoleErrors.push('Canvas not found');
      return result;
    }

    // Quick mode: just verify it loads
    if (options.quick) {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const screenshotPath = path.join(OUTPUT_DIR, `museum-quick-${timestamp}.png`);
      await canvas.screenshot({ path: screenshotPath });
      result.screenshots.push(screenshotPath);
      result.success = true;
      console.log(`Screenshot saved: ${screenshotPath}`);
      return result;
    }

    // Full test: navigate waypoints
    if (options.waypoints !== false) {
      const waypoints = await loadWaypoints();
      console.log(`Testing ${waypoints.length} waypoints...`);

      for (const waypoint of waypoints) {
        const wpResult: WaypointResult = {
          name: waypoint.name,
          reached: false,
        };

        try {
          // Move camera to waypoint via injected JS
          await page.evaluate((wp) => {
            const w = window as any;
            if (w.museumSetCamera) {
              w.museumSetCamera(wp.x, wp.y, wp.z, wp.lookAt);
              return true;
            }
            return false;
          }, waypoint);

          await sleep(1000); // Let scene settle

          // Capture screenshot
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
          const screenshotPath = path.join(OUTPUT_DIR, `museum-${waypoint.name}-${timestamp}.png`);
          await canvas.screenshot({ path: screenshotPath });
          wpResult.screenshot = screenshotPath;
          wpResult.reached = true;
          result.screenshots.push(screenshotPath);

          console.log(`  ${waypoint.name}: ✓ ${screenshotPath}`);
        } catch (e) {
          wpResult.error = String(e);
          console.log(`  ${waypoint.name}: ✗ ${e}`);
        }

        result.waypoints.push(wpResult);
      }
    }

    // Measure FPS if possible
    try {
      const fps = await page.evaluate(() => {
        const w = window as any;
        return w.museumGetFPS ? w.museumGetFPS() : null;
      });
      if (fps) {
        result.fps = fps;
        console.log(`FPS: ${fps}`);
      }
    } catch {
      // FPS measurement not available
    }

    result.success = result.consoleErrors.length === 0;

    await context.close();
  } finally {
    await browser.close();
  }

  return result;
}

// ============================================================================
// CLI
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Museum Testing Script

Usage:
  bun run museum:test              Full test (load + waypoints)
  bun run museum:test --quick      Quick test (just verify loads)
  bun run museum:test --waypoints  Navigate all defined waypoints

Output:
  Screenshots saved to outputs/museum-tests/
  Results written to outputs/museum-tests/result.json
`);
    process.exit(0);
  }

  return {
    quick: args.includes('--quick'),
    waypoints: !args.includes('--no-waypoints'),
    screenshot: args.includes('--screenshot'),
  };
}

async function main() {
  const options = parseArgs();

  console.log('='.repeat(60));
  console.log('Museum Test Suite');
  console.log('='.repeat(60));

  try {
    await startDevServer();
    const result = await runMuseumTest(options);

    // Write result
    const resultPath = path.join(OUTPUT_DIR, 'result.json');
    await writeFile(resultPath, JSON.stringify(result, null, 2));

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Test Summary');
    console.log('='.repeat(60));
    console.log(`Success: ${result.success ? '✓' : '✗'}`);
    console.log(`Load time: ${result.loadTime}ms`);
    console.log(`Screenshots: ${result.screenshots.length}`);
    console.log(`Errors: ${result.consoleErrors.length}`);
    console.log(`Warnings: ${result.consoleWarnings.length}`);

    if (result.consoleErrors.length > 0) {
      console.log('\nErrors:');
      result.consoleErrors.forEach((e) => console.log(`  - ${e}`));
    }

    if (result.fps) {
      console.log(`FPS: ${result.fps}`);
    }

    console.log(`\nFull results: ${resultPath}`);

    process.exit(result.success ? 0 : 1);
  } finally {
    stopDevServer();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();
