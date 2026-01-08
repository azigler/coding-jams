/**
 * Cleanup registry for the Genuary 2026 harness
 *
 * Ensures all async operations and resources can be properly cleaned up
 * when navigating between days or unloading the page.
 */

import type { CleanupFn } from '../types';

// ============================================================================
// Cleanup Registry
// ============================================================================

const cleanupRegistry = new Set<CleanupFn>();

/**
 * Register a cleanup function to be called on page unload or day change
 * Returns an unregister function for manual cleanup
 */
export function registerCleanup(fn: CleanupFn): () => void {
  cleanupRegistry.add(fn);
  return () => {
    cleanupRegistry.delete(fn);
  };
}

/**
 * Unregister a cleanup function
 */
export function unregisterCleanup(fn: CleanupFn): void {
  cleanupRegistry.delete(fn);
}

/**
 * Run all registered cleanup functions
 * Called when navigating between days or unloading the page
 */
export function runAllCleanups(): void {
  for (const fn of cleanupRegistry) {
    try {
      fn();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
  cleanupRegistry.clear();
}

/**
 * Get the count of registered cleanup functions
 * Useful for debugging memory leaks
 */
export function getCleanupCount(): number {
  return cleanupRegistry.size;
}

// ============================================================================
// DOM Cleanup Utilities
// ============================================================================

/**
 * Safely remove an element from the DOM
 */
export function removeElement(elementOrId: HTMLElement | string | null): void {
  if (!elementOrId) return;

  const element =
    typeof elementOrId === 'string'
      ? document.getElementById(elementOrId)
      : elementOrId;

  if (element && element.parentNode) {
    element.remove();
  }
}

/**
 * Clear all child elements from a container
 */
export function clearContainer(containerId: string): void {
  const container = document.getElementById(containerId);
  if (container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }
}

// ============================================================================
// Async Operation Cleanup
// ============================================================================

/**
 * Create a cleanup-tracked timeout
 * Returns a cleanup function that clears the timeout
 */
export function createTrackedTimeout(
  callback: () => void,
  delay: number
): CleanupFn {
  const timeoutId = setTimeout(() => {
    unregister();
    callback();
  }, delay);

  const cleanup = () => {
    clearTimeout(timeoutId);
  };

  const unregister = registerCleanup(cleanup);

  return () => {
    unregister();
    cleanup();
  };
}

/**
 * Create a cleanup-tracked interval
 * Returns a cleanup function that clears the interval
 */
export function createTrackedInterval(
  callback: () => void,
  interval: number
): CleanupFn {
  const intervalId = setInterval(callback, interval);

  const cleanup = () => {
    clearInterval(intervalId);
  };

  const unregister = registerCleanup(cleanup);

  return () => {
    unregister();
    cleanup();
  };
}

/**
 * Create a cleanup-tracked animation frame loop
 * Returns a cleanup function that stops the loop
 */
export function createTrackedAnimationLoop(
  callback: (timestamp: number) => boolean // Return false to stop
): CleanupFn {
  let running = true;
  let frameId: number;

  const loop = (timestamp: number) => {
    if (!running) return;

    const shouldContinue = callback(timestamp);
    if (shouldContinue && running) {
      frameId = requestAnimationFrame(loop);
    }
  };

  frameId = requestAnimationFrame(loop);

  const cleanup = () => {
    running = false;
    cancelAnimationFrame(frameId);
  };

  const unregister = registerCleanup(cleanup);

  return () => {
    unregister();
    cleanup();
  };
}

// ============================================================================
// Page Unload Handler
// ============================================================================

/**
 * Initialize the cleanup system
 * Call this once at app startup
 */
export function initCleanupSystem(): void {
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    runAllCleanups();
  });

  // Clean up on visibility change (helps with mobile)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // Page is being hidden, might be unloading
      // Don't run full cleanup, just pause expensive operations
    }
  });
}

// ============================================================================
// Debug Utilities
// ============================================================================

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__genuaryCleanup = {
    getCleanupCount,
    runAllCleanups,
  };
}
