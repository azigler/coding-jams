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

  // Remove shader canvas container (for GLSL days)
  removeElement('shader-canvas-container');

  // Remove HTML-only container (Day 28)
  removeElement('html-only-container');

  // Destroy controls manager
  if (currentControlsManager) {
    currentControlsManager.destroy();
    currentControlsManager = null;
  }
}

// ============================================================================
// HTML Mode Container
// ============================================================================

/**
 * Get or create the HTML-only container for Day 28 and similar days
 */
function getOrCreateHtmlContainer(): HTMLElement {
  const existing = document.getElementById('html-only-container');
  if (existing) return existing;

  const contentArea = document.getElementById('content');
  if (!contentArea) {
    throw new Error('Content area not found');
  }

  const container = document.createElement('div');
  container.id = 'html-only-container';
  container.style.cssText =
    'width: 100%; height: calc(100vh - var(--header-height)); display: flex; align-items: center; justify-content: center;';
  contentArea.appendChild(container);

  return container;
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

    // Load the day module first to check mode
    const result = await loadDay(
      dayNum,
      dayNum === 28 ? getOrCreateHtmlContainer() : getOrCreateContainer(),
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
 *
 * IMPORTANT: This callback is invoked by renderer.updateControls() to notify
 * external listeners about control changes. It must NOT call renderer.updateControls()
 * again, as that would create an infinite loop:
 *
 *   Controls UI → renderer.updateControls() → onControlsChange() → renderer.updateControls() → ∞
 *
 * The controls UI already calls renderer.updateControls() directly (see index.ts setupControlsUI).
 * This callback is for external state synchronization only.
 */
function handleControlsChange(_values: ControlState): void {
  // Intentionally empty - the controls UI already updates the renderer directly.
  // This callback exists for potential future use (e.g., analytics, state sync)
  // but must NEVER call renderer.updateControls() to avoid infinite recursion.
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
