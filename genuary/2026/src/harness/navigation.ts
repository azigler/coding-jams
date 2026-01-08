/**
 * Navigation system for the Genuary 2026 harness
 *
 * Handles async day navigation with proper cancellation,
 * replacing callback chains with async/await.
 */

import type {
  DayConfig,
  DayRenderer,
  ControlState,
  NavigationOptions,
  ControlsManager,
} from '../types';
import {
  createAbortController,
  setCurrentDay,
  setLoading,
  setRenderer,
  getRenderer,
  getCurrentDay,
  isAborted,
} from './state';
import { runAllCleanups, removeElement, clearContainer } from './cleanup';
import { loadDay, LoadDayResult } from './day-loader';
import { loadControls } from '../utils/controls';

// ============================================================================
// Navigation State
// ============================================================================

let currentControlsManager: ControlsManager | null = null;

// Callbacks for UI updates
type DayInfoCallback = (config: DayConfig) => void;
type ControlsUICallback = (
  dayNum: number,
  result: LoadDayResult
) => ControlsManager | null;
type ErrorCallback = (dayNum: number, error: Error) => void;

let onDayInfoUpdate: DayInfoCallback | null = null;
let onControlsSetup: ControlsUICallback | null = null;
let onError: ErrorCallback | null = null;

// ============================================================================
// Callback Registration
// ============================================================================

/**
 * Register callback for updating day info display
 */
export function setDayInfoCallback(callback: DayInfoCallback): void {
  onDayInfoUpdate = callback;
}

/**
 * Register callback for setting up controls UI
 */
export function setControlsSetupCallback(callback: ControlsUICallback): void {
  onControlsSetup = callback;
}

/**
 * Register callback for error handling
 */
export function setErrorCallback(callback: ErrorCallback): void {
  onError = callback;
}

// ============================================================================
// URL Handling
// ============================================================================

/**
 * Get day number from URL hash
 */
export function getDayFromURL(): number {
  const hash = window.location.hash;
  if (hash) {
    const match = hash.match(/#day(\d+)/);
    if (match) {
      const dayNum = parseInt(match[1], 10);
      if (dayNum >= 1 && dayNum <= 31) {
        return dayNum;
      }
    }
  }

  // Default to today's date in January, or day 1 if not in January
  const now = new Date();
  if (now.getMonth() === 0) {
    return now.getDate();
  }
  return 1;
}

/**
 * Update URL hash for a day
 */
export function updateURLForDay(dayNum: number): void {
  window.location.hash = `#day${dayNum}`;
}

// ============================================================================
// Container Management
// ============================================================================

/**
 * Get or create the p5 canvas container
 */
function getOrCreateContainer(): HTMLElement {
  const existing = document.getElementById('p5-canvas-container');
  if (existing) return existing;

  const contentArea = document.getElementById('content');
  if (!contentArea) {
    throw new Error('Content area not found');
  }

  const container = document.createElement('div');
  container.id = 'p5-canvas-container';
  contentArea.appendChild(container);

  return container;
}

/**
 * Clean up all containers and sketches
 */
export function cleanupContainers(): void {
  // Run all registered cleanups
  runAllCleanups();

  // Stop current renderer
  const renderer = getRenderer();
  if (renderer) {
    renderer.stop();
    setRenderer(null);
  }

  // Remove p5 canvas container
  removeElement('p5-canvas-container');

  // Remove HTML-only container (Day 28)
  removeElement('html-only-container');

  // Destroy controls manager
  if (currentControlsManager) {
    currentControlsManager.destroy();
    currentControlsManager = null;
  }
}

// ============================================================================
// Day 28 Special Handler
// ============================================================================

/**
 * Load Day 28's HTML-only content
 */
function loadDay28HTML(config: DayConfig): void {
  // Update day info
  onDayInfoUpdate?.(config);

  const contentArea = document.getElementById('content');
  if (!contentArea) {
    console.error('Content area not found');
    return;
  }

  // Reset content area margin
  contentArea.style.marginBottom = '0';

  // Create HTML-only container
  const container = document.createElement('div');
  container.id = 'html-only-container';
  container.style.cssText =
    'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;';
  contentArea.appendChild(container);

  // TODO: Implement Day 28 HTML-only content
  container.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <h1>Day 28: HTML Only</h1>
      <p>This day uses only HTML elements, no canvas or libraries.</p>
      <p>Implementation coming soon...</p>
    </div>
  `;
}

// ============================================================================
// Main Navigation
// ============================================================================

/**
 * Navigate to a specific day
 * This is the main entry point for day navigation
 */
export async function navigateToDay(
  dayNum: number,
  options: NavigationOptions = {}
): Promise<void> {
  const { skipUrlUpdate = false, forceReload = false, signal } = options;

  // Validate day number
  if (dayNum < 1 || dayNum > 31) {
    console.error(`Invalid day number: ${dayNum}`);
    return;
  }

  // Skip if same day unless forced
  if (!forceReload && dayNum === getCurrentDay()) {
    return;
  }

  // Create abort controller for this navigation
  const abortController = createAbortController();

  // Use external signal if provided
  const navigationSignal = signal ?? abortController.signal;

  // Start loading
  setLoading(true);

  try {
    // Clean up previous day
    cleanupContainers();

    // Check for abort
    if (navigationSignal.aborted) {
      setLoading(false);
      return;
    }

    // Update current day
    setCurrentDay(dayNum);

    // Update URL
    if (!skipUrlUpdate) {
      updateURLForDay(dayNum);
    }

    // Special handling for Day 28 (HTML only)
    if (dayNum === 28) {
      const day28Config: DayConfig = {
        day: 28,
        prompt: 'HTML Only',
        creditName: 'Genuary',
        creditUrl: 'https://genuary.art',
      };
      loadDay28HTML(day28Config);
      setLoading(false);
      return;
    }

    // Get or create container
    const container = getOrCreateContainer();

    // Load the day
    const result = await loadDay(
      dayNum,
      container,
      handleControlsChange,
      loadControls
    );

    // Check for abort after async operation
    if (navigationSignal.aborted || isAborted()) {
      result.renderer.stop();
      setLoading(false);
      return;
    }

    // Update day info
    onDayInfoUpdate?.(result.config);

    // Set up controls UI if day has controls
    if (result.hasControls && onControlsSetup) {
      currentControlsManager = onControlsSetup(dayNum, result);
    }

    // Start the renderer
    result.renderer.start();
    setRenderer(result.renderer);

    // Done loading
    setLoading(false);
  } catch (error) {
    // Don't report abort errors
    if (error instanceof Error && error.name === 'AbortError') {
      setLoading(false);
      return;
    }

    console.error(`Error loading day ${dayNum}:`, error);
    onError?.(dayNum, error as Error);
    setLoading(false);
  }
}

/**
 * Handle control value changes from the UI
 */
function handleControlsChange(values: ControlState): void {
  const renderer = getRenderer();
  if (renderer) {
    renderer.updateControls(values);
  }
}

// ============================================================================
// Navigation Helpers
// ============================================================================

/**
 * Navigate to the next day (wraps around)
 */
export function navigateToNextDay(): void {
  const current = getCurrentDay();
  const nextDay = current === 31 ? 1 : current + 1;
  navigateToDay(nextDay);
}

/**
 * Navigate to the previous day (wraps around)
 */
export function navigateToPrevDay(): void {
  const current = getCurrentDay();
  const prevDay = current === 1 ? 31 : current - 1;
  navigateToDay(prevDay);
}

/**
 * Get current controls manager (for external access)
 */
export function getControlsManager(): ControlsManager | null {
  return currentControlsManager;
}
