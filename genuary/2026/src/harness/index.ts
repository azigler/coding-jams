/**
 * Harness module exports
 *
 * Re-exports all harness components for convenient importing.
 */

// State management
export {
  getState,
  getCurrentDay,
  getControls,
  isRecording,
  isLoading,
  getRenderer,
  updateState,
  setCurrentDay,
  setControls,
  updateControls,
  setRecording,
  setLoading,
  setRenderer,
  createAbortController,
  getAbortSignal,
  abortCurrent,
  isAborted,
  resetState,
  subscribe,
} from './state';

// Cleanup utilities
export {
  registerCleanup,
  unregisterCleanup,
  runAllCleanups,
  getCleanupCount,
  removeElement,
  clearContainer,
  createTrackedTimeout,
  createTrackedInterval,
  createTrackedAnimationLoop,
  initCleanupSystem,
} from './cleanup';

// Day loading
export {
  importDayModule,
  getDefaultControls,
  createP5Renderer,
  loadDay,
} from './day-loader';
export type { LoadDayResult } from './day-loader';

// Navigation
export {
  getDayFromURL,
  updateURLForDay,
  cleanupContainers,
  navigateToDay,
  navigateToNextDay,
  navigateToPrevDay,
  getControlsManager,
  setDayInfoCallback,
  setControlsSetupCallback,
  setErrorCallback,
} from './navigation';
