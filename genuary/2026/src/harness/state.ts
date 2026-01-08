/**
 * Centralized state management for the Genuary 2026 harness
 *
 * Single source of truth for application state, replacing scattered
 * global variables and (p as any)._fieldName patterns.
 */

import type { AppState, ControlState, DayRenderer } from '../types';

// ============================================================================
// Internal State
// ============================================================================

const state: AppState = {
  currentDay: 1,
  controls: {},
  isRecording: false,
  isLoading: false,
  abortController: null,
};

// Current renderer reference (kept separate for type safety)
let currentRenderer: DayRenderer | null = null;

// Listeners for state changes
type StateListener = (newState: Readonly<AppState>) => void;
const listeners = new Set<StateListener>();

// ============================================================================
// State Access
// ============================================================================

/**
 * Get a read-only copy of the current state
 */
export function getState(): Readonly<AppState> {
  return { ...state };
}

/**
 * Get the current day number
 */
export function getCurrentDay(): number {
  return state.currentDay;
}

/**
 * Get the current control values
 */
export function getControls(): Readonly<ControlState> {
  return { ...state.controls };
}

/**
 * Check if currently recording
 */
export function isRecording(): boolean {
  return state.isRecording;
}

/**
 * Check if currently loading a day
 */
export function isLoading(): boolean {
  return state.isLoading;
}

/**
 * Get the current renderer
 */
export function getRenderer(): DayRenderer | null {
  return currentRenderer;
}

// ============================================================================
// State Updates
// ============================================================================

/**
 * Update part of the application state
 */
export function updateState(partial: Partial<AppState>): void {
  Object.assign(state, partial);
  notifyListeners();
}

/**
 * Set the current day
 */
export function setCurrentDay(day: number): void {
  if (day < 1 || day > 31) {
    console.error(`Invalid day number: ${day}`);
    return;
  }
  state.currentDay = day;
  notifyListeners();
}

/**
 * Set the control values
 */
export function setControls(controls: ControlState): void {
  state.controls = { ...controls };
  notifyListeners();
}

/**
 * Update specific control values
 */
export function updateControls(partial: Partial<ControlState>): void {
  // Filter out undefined values before spreading
  const filtered: ControlState = {};
  for (const [key, value] of Object.entries(partial)) {
    if (value !== undefined) {
      filtered[key] = value;
    }
  }
  state.controls = { ...state.controls, ...filtered };
  notifyListeners();
}

/**
 * Set recording state
 */
export function setRecording(recording: boolean): void {
  state.isRecording = recording;
  notifyListeners();
}

/**
 * Set loading state
 */
export function setLoading(loading: boolean): void {
  state.isLoading = loading;
  notifyListeners();
}

/**
 * Set the current renderer
 */
export function setRenderer(renderer: DayRenderer | null): void {
  currentRenderer = renderer;
}

// ============================================================================
// Abort Controller Management
// ============================================================================

/**
 * Create a new AbortController for the current operation
 * Aborts any existing operation first
 */
export function createAbortController(): AbortController {
  // Abort existing operation
  if (state.abortController) {
    state.abortController.abort();
  }
  state.abortController = new AbortController();
  return state.abortController;
}

/**
 * Get the current AbortSignal
 */
export function getAbortSignal(): AbortSignal | null {
  return state.abortController?.signal ?? null;
}

/**
 * Abort the current operation
 */
export function abortCurrent(): void {
  if (state.abortController) {
    state.abortController.abort();
    state.abortController = null;
  }
}

/**
 * Check if the current operation was aborted
 */
export function isAborted(): boolean {
  return state.abortController?.signal.aborted ?? false;
}

// ============================================================================
// Full Reset
// ============================================================================

/**
 * Reset all state to initial values
 * Call this when cleaning up between days
 */
export function resetState(): void {
  // Abort any pending operations
  abortCurrent();

  // Stop current renderer
  if (currentRenderer) {
    currentRenderer.stop();
    currentRenderer = null;
  }

  // Reset state
  state.controls = {};
  state.isRecording = false;
  state.isLoading = false;
  state.abortController = null;

  notifyListeners();
}

// ============================================================================
// State Change Subscriptions
// ============================================================================

/**
 * Subscribe to state changes
 * Returns an unsubscribe function
 */
export function subscribe(listener: StateListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Notify all listeners of state change
 */
function notifyListeners(): void {
  const snapshot = getState();
  for (const listener of listeners) {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('State listener error:', error);
    }
  }
}

// ============================================================================
// Debug Utilities
// ============================================================================

/**
 * Expose debug utilities on window (development only)
 */
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__genuaryState = {
    getState,
    getCurrentDay,
    getControls,
    isRecording,
    isLoading,
    getRenderer,
  };
}
