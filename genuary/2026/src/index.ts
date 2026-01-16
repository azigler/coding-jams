/**
 * Main entry point for Genuary 2026
 *
 * This is a thin shell that wires together the harness modules.
 * Core logic lives in:
 *   - harness/state.ts      — Centralized state management
 *   - harness/cleanup.ts    — Resource cleanup
 *   - harness/day-loader.ts — Day module loading and rendering
 *   - harness/navigation.ts — Async navigation
 *   - utils/controls.ts     — Control UI management
 *   - utils/recording.ts    — GIF recording with visual status
 */

import type { DayConfig, ControlsManager, ControlState } from './types';
import { initCleanupSystem } from './harness/cleanup';
import { getCurrentDay, getRenderer, setRecording } from './harness/state';
import {
  navigateToDay,
  navigateToNextDay,
  navigateToPrevDay,
  getDayFromURL,
  setDayInfoCallback,
  setControlsSetupCallback,
  setErrorCallback,
} from './harness/navigation';
import { LoadDayResult } from './harness/day-loader';
import {
  createControls,
  setControlsProgrammatically,
  loadControls,
} from './utils/controls';
import { recordGif, downloadBlob, updateRecordButton, type RecordingStatus, type CanvasSource } from './utils/recording';
import { createRecordingOverlay, type RecordingOverlay } from './utils/recording-overlay';

// ============================================================================
// Global API
// ============================================================================

// Expose programmatic control API
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).setGenuaryControls = (
    day: number,
    values: Partial<ControlState>
  ) => {
    console.log('🔧 setGenuaryControls called');
    return setControlsProgrammatically(day, values);
  };
}

// ============================================================================
// Recording State
// ============================================================================

// Recording state management
let recordingAbortController: AbortController | null = null;
let recordingOverlay: RecordingOverlay | null = null;

// ============================================================================
// Header Height Sync
// ============================================================================

/**
 * Keep CSS in sync with actual fixed header height
 */
function syncHeaderHeight(): void {
  const header = document.getElementById('header');
  if (!header) return;
  const h = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--header-height', `${h}px`);
}

// ============================================================================
// Day Info Display
// ============================================================================

/**
 * Update the day info display
 */
function updateDayInfo(config: DayConfig): void {
  const infoEl = document.getElementById('day-info');
  if (!infoEl) return;

  const creditLink = `<a href="${config.creditUrl}" target="_blank" rel="noopener noreferrer">${config.creditName}</a>`;
  const timelapseDisabled = !config.recording?.enabled ? 'disabled' : '';
  const timelapseStyle = !config.recording?.enabled
    ? 'opacity: 0.5; cursor: not-allowed;'
    : '';

  infoEl.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
      <h2 style="margin: 0;">Day ${config.day}</h2>
      <div id="download-buttons" style="display: flex; gap: 0.5rem;">
        <button id="download-image-btn" style="padding: 0.5rem 1rem; background: #2a2a2a; color: #e0e0e0; border: 1px solid #444; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">
          📷 Download Image
        </button>
        <button id="download-timelapse-btn" ${timelapseDisabled} style="padding: 0.5rem 1rem; background: #2a2a2a; color: #e0e0e0; border: 1px solid #444; border-radius: 4px; cursor: pointer; font-size: 0.9rem; ${timelapseStyle}">
          🎬 Record GIF
        </button>
      </div>
    </div>
    <p style="margin: 0.5rem 0 0.25rem 0;"><strong>Prompt:</strong> ${config.prompt}</p>
    <p style="margin: 0.25rem 0;"><strong>Prompt Credit:</strong> ${creditLink}</p>
  `;

  setupDownloadButtons(config);
  syncHeaderHeight();
}

// ============================================================================
// Download Functionality
// ============================================================================

/**
 * Generate timestamp filename
 */
function generateTimestampFilename(day: number): string {
  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join('');
  return `genuary-2026-day-${day.toString().padStart(2, '0')}-${timestamp}.png`;
}

/**
 * Download canvas as image
 */
function downloadCanvasImage(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) {
      console.error('Failed to create blob from canvas');
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    console.log(`✅ Image downloaded: ${filename}`);
  }, 'image/png');
}

/**
 * Set up download button handlers
 */
function setupDownloadButtons(config: DayConfig): void {
  const imageBtn = document.getElementById('download-image-btn');
  const timelapseBtn = document.getElementById('download-timelapse-btn');

  if (imageBtn) {
    imageBtn.addEventListener('click', () => {
      const renderer = getRenderer();
      const sketch = renderer?.getSketch();
      const canvas = renderer?.getCanvas();

      if (!canvas) {
        console.error('No canvas available');
        return;
      }

      const filename = generateTimestampFilename(config.day);

      // Use renderFinal if available (p5 mode)
      if (sketch && config.renderFinal) {
        const wasLooping = sketch.isLooping();
        sketch.noLoop();
        config.renderFinal(sketch);
        downloadCanvasImage(canvas, filename);
        if (wasLooping) {
          sketch.loop();
        } else {
          sketch.redraw();
        }
      } else {
        downloadCanvasImage(canvas, filename);
      }
    });
  }

  if (timelapseBtn && config.recording?.enabled) {
    timelapseBtn.addEventListener('click', () => {
      startTimelapseRecording(config);
    });
  }
}

/**
 * Start timelapse recording using the async/await flow with visual status
 */
async function startTimelapseRecording(config: DayConfig): Promise<void> {
  console.log('🎬 Start timelapse recording clicked');

  if (!config.recording) {
    console.error('Recording not enabled for this day');
    return;
  }

  // Cancel any existing recording
  if (recordingAbortController) {
    recordingAbortController.abort();
    recordingAbortController = null;
  }

  // Clean up existing overlay
  if (recordingOverlay) {
    recordingOverlay.destroy();
    recordingOverlay = null;
  }

  // Create new abort controller
  recordingAbortController = new AbortController();

  const dayNum = config.day;
  console.log('Reloading day', dayNum);

  try {
    // Reload day to restart animation
    await navigateToDay(dayNum, { forceReload: true });

    // Wait for sketch to initialize
    await delay(500);

    const renderer = getRenderer();
    const sketch = renderer?.getSketch();
    const canvas = renderer?.getCanvas();

    if (!canvas) {
      throw new Error('Canvas not available');
    }

    // Determine if this is a GLSL day (no sketch available)
    const isGLSLDay = !sketch;

    // Create recording overlay
    recordingOverlay = createRecordingOverlay(canvas);

    // Combined status callback: update both button and overlay
    const handleStatus = (status: RecordingStatus) => {
      updateRecordButton(status);
      recordingOverlay?.update(status);
    };

    // For p5.js days, ensure animation is running and load controls
    if (sketch) {
      sketch.loop();
      console.log('✅ Animation started (p5.js mode)');

      // Load and apply controls
      try {
        const dayModule = await import(`./days/${dayNum.toString().padStart(2, '0')}.ts`);
        const defaultControls: ControlState = dayModule.defaultControls || {};
        if (defaultControls && Object.keys(defaultControls).length > 0) {
          const savedControls = loadControls(dayNum, defaultControls);
          (sketch as unknown as Record<string, unknown>)._controls = savedControls;
          console.log('✅ Controls loaded for recording:', savedControls);

          // Reset cached data so it regenerates with correct control values
          const extSketch = sketch as unknown as Record<string, unknown>;
          extSketch._triangleData = null;
          extSketch._lastTriangleCount = null;
          extSketch._balls = null;
          extSketch._lastBallCount = null;
          extSketch._particles = null;
          extSketch._lastParticleCount = null;
        }
      } catch {
        console.log('No controls for this day');
      }

      // Reset frame count to start from beginning
      sketch.frameCount = 0;
    } else {
      console.log('✅ Animation running (GLSL mode)');
    }

    // Small delay to ensure first frame is drawn with correct controls
    await delay(300);

    console.log('🎬 Starting GIF recording...');
    console.log('Canvas check:', {
      canvas: canvas ? 'exists' : 'missing',
      mode: isGLSLDay ? 'GLSL' : 'p5.js',
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
    });

    setRecording(true);

    // Create a canvas source for recording
    // For p5.js, use the sketch (which has .canvas); for GLSL, wrap the canvas
    const recordingSource: CanvasSource = sketch
      ? (sketch as unknown as CanvasSource)
      : { canvas };

    // Record the GIF using the async API
    const blob = await recordGif(
      recordingSource,
      handleStatus,
      recordingAbortController.signal
    );

    // Download the result
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `genuary-2026-day-${dayNum.toString().padStart(2, '0')}-${timestamp}.gif`;
    downloadBlob(blob, filename);

    console.log('✅ Recording complete and downloaded!');

    // Clean up overlay after a delay to show completion
    setTimeout(() => {
      if (recordingOverlay) {
        recordingOverlay.update({ state: 'idle', progress: 0, message: '' });
      }
    }, 3000);

  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === 'Recording cancelled') {
      console.log('📹 Recording was cancelled');
      updateRecordButton({ state: 'idle', progress: 0, message: '' });
      recordingOverlay?.update({ state: 'idle', progress: 0, message: '' });
    } else {
      console.error('❌ Recording failed:', err);
      updateRecordButton({ state: 'error', progress: 0, message: err.message });
      recordingOverlay?.update({ state: 'error', progress: 0, message: err.message });
    }
  } finally {
    setRecording(false);
    recordingAbortController = null;
  }
}

// ============================================================================
// Controls Setup
// ============================================================================

/**
 * Set up controls UI for a day
 */
function setupControlsUI(dayNum: number, result: LoadDayResult): ControlsManager | null {
  if (!result.hasControls || !result.module.controlConfigs) {
    return null;
  }

  const contentArea = document.getElementById('content');
  if (!contentArea) return null;

  const manager = createControls(
    dayNum,
    result.module.controlConfigs,
    result.controls,
    (values) => {
      result.renderer.updateControls(values);
    },
    result.module.getClaudesChoice
  );

  contentArea.appendChild(manager.container);
  return manager;
}

// ============================================================================
// Navigation Setup
// ============================================================================

/**
 * Set up navigation controls
 */
function setupNavigation(initialDay: number): void {
  const navEl = document.getElementById('day-navigation');
  if (!navEl) return;

  // Day selector
  const select = document.createElement('select');
  select.id = 'day-selector';
  select.style.cssText = 'padding: 0.5rem; font-size: 1rem; margin: 1rem;';

  for (let i = 1; i <= 31; i++) {
    const option = document.createElement('option');
    option.value = i.toString();
    option.textContent = `Day ${i}`;
    if (i === initialDay) {
      option.selected = true;
    }
    select.appendChild(option);
  }

  select.addEventListener('change', (e) => {
    const dayNum = parseInt((e.target as HTMLSelectElement).value, 10);
    navigateToDay(dayNum);
  });

  // Prev/Next buttons
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '← Previous';
  prevBtn.style.cssText = 'padding: 0.5rem 1rem; font-size: 1rem; margin: 0.5rem;';
  prevBtn.addEventListener('click', () => {
    navigateToPrevDay();
    select.value = getCurrentDay().toString();
  });

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next →';
  nextBtn.style.cssText = 'padding: 0.5rem 1rem; font-size: 1rem; margin: 0.5rem;';
  nextBtn.addEventListener('click', () => {
    navigateToNextDay();
    select.value = getCurrentDay().toString();
  });

  navEl.appendChild(select);
  navEl.appendChild(prevBtn);
  navEl.appendChild(nextBtn);

  // Keep selector in sync on hash change
  window.addEventListener('hashchange', () => {
    select.value = getCurrentDay().toString();
  });
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Handle day load errors
 */
function handleError(dayNum: number, error: Error): void {
  console.error(`Error loading day ${dayNum}:`, error);

  const contentArea = document.getElementById('content');
  if (contentArea) {
    contentArea.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #e0e0e0;">
        <h2>Error Loading Day ${dayNum}</h2>
        <p>${error.message}</p>
        <button onclick="location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem;">
          Reload Page
        </button>
      </div>
    `;
  }
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Promisified delay
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the app
 */
async function init(): Promise<void> {
  // Initialize cleanup system
  initCleanupSystem();

  // Register callbacks
  setDayInfoCallback(updateDayInfo);
  setControlsSetupCallback(setupControlsUI);
  setErrorCallback(handleError);

  // Get initial day
  const dayNum = getDayFromURL();

  // Set up navigation
  setupNavigation(dayNum);

  // Sync header height
  syncHeaderHeight();

  // Set up header resize observer
  const header = document.getElementById('header');
  if (header && 'ResizeObserver' in window) {
    const ro = new ResizeObserver(() => syncHeaderHeight());
    ro.observe(header);
  } else {
    window.addEventListener('resize', syncHeaderHeight);
  }

  // Handle hash changes
  window.addEventListener('hashchange', () => {
    const newDay = getDayFromURL();
    navigateToDay(newDay, { skipUrlUpdate: true });
  });

  // Load initial day
  await navigateToDay(dayNum);
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
