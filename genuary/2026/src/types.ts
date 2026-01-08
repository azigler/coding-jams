/**
 * Shared types for Genuary 2026 projects
 *
 * This module provides comprehensive type definitions for the harness architecture,
 * including control configurations, day modules, rendering, and state management.
 */

import type p5 from 'p5';

// Re-export p5 type for use in day files
export type { p5 };

// ============================================================================
// Control System Types
// ============================================================================

/**
 * Configuration for a single control slider
 */
export interface ControlConfig {
  label: string;
  min: number;
  max: number;
  defaultValue: number;
  step?: number;
  format?: (value: number) => string;  // Custom display formatting
}

/**
 * Current state of all controls for a day
 */
export interface ControlState {
  [key: string]: number;
}

// ============================================================================
// Recording Types
// ============================================================================

/**
 * Configuration for GIF recording
 */
export interface RecordingConfig {
  enabled: boolean;
  duration: number; // seconds
  filename: string;
}

// ============================================================================
// Day Configuration Types
// ============================================================================

/**
 * Complete configuration for a day's artwork
 */
export interface DayConfig {
  day: number;
  prompt: string;
  creditName: string;
  creditUrl: string;
  mode?: 'p5' | 'glsl';  // Rendering mode (p5 default, glsl for WebGL shaders)
  recording?: RecordingConfig;

  // p5 mode lifecycle methods
  setup?: (p: p5) => void;
  draw?: (p: p5) => void;
  renderFinal?: (p: p5) => void; // Render final/complete state for static image
  windowResized?: (p: p5) => void;
  mousePressed?: (p: p5) => void;
  keyPressed?: (p: p5) => void;

  // GLSL mode (for future WebGL shader support)
  fragmentShader?: string;
  vertexShader?: string;
  uniforms?: UniformConfig[];
}

/**
 * Uniform configuration for GLSL shaders
 */
export interface UniformConfig {
  name: string;
  type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat4' | 'sampler2D';
  value?: number | number[] | WebGLTexture;
}

/**
 * A day module as imported dynamically
 */
export interface DayModule {
  default: DayConfig;
  controlConfigs?: Record<string, ControlConfig>;
  defaultControls?: ControlState;
  getClaudesChoice?: () => Partial<ControlState>;
}

// ============================================================================
// Renderer Types
// ============================================================================

/**
 * Interface for a day renderer (p5 or WebGL)
 * Provides unified control over the rendering lifecycle
 */
export interface DayRenderer {
  start: () => void;
  stop: () => void;
  updateControls: (controls: ControlState) => void;
  getCanvas: () => HTMLCanvasElement | null;
  getSketch: () => p5 | null;  // For p5 mode
  isRunning: () => boolean;
}

// ============================================================================
// State Management Types
// ============================================================================

/**
 * Global application state
 */
export interface AppState {
  currentDay: number;
  controls: ControlState;
  isRecording: boolean;
  isLoading: boolean;
  abortController: AbortController | null;
}

// ============================================================================
// Controls Manager Types
// ============================================================================

/**
 * Interface for managing day controls UI
 */
export interface ControlsManager {
  container: HTMLElement;
  getValue: (key: string) => number;
  setValue: (key: string, value: number) => void;
  setAll: (values: Partial<ControlState>) => void;
  getAll: () => ControlState;
  destroy: () => void;
}

// ============================================================================
// Extended p5 Instance Type
// ============================================================================

/**
 * Extended p5 instance with harness-specific properties
 * This replaces the `(p as any)._fieldName` pattern
 */
export interface ExtendedP5 extends p5 {
  // Control state
  _controls?: ControlState;

  // Recording state
  _recordingModule?: {
    isCurrentlyRecording: () => boolean;
    captureFrame: (p: p5) => void;
    initEncoder: (p: p5, config: RecordingConfig) => unknown;
    startRecording: (p: p5, config: RecordingConfig) => void;
  };

  // Canvas reference (already exists on p5 but not in types)
  canvas?: HTMLCanvasElement & {
    _cleanupResize?: () => void;
  };

  // Day-specific cached data (for performance)
  _triangleData?: unknown;
  _lastTriangleCount?: number;
  _balls?: unknown;
  _lastBallCount?: number;
  _particles?: unknown;
  _lastParticleCount?: number;
  _lastColorMutation?: number;
  _lastSpiralTightness?: number;
  _lastColorSpread?: number;
  _waveSources?: unknown;
  _lastWaveCount?: number;
}

// ============================================================================
// Navigation Types
// ============================================================================

/**
 * Result of a day load operation
 */
export interface DayLoadResult {
  success: boolean;
  renderer?: DayRenderer;
  error?: Error;
}

/**
 * Options for navigating to a day
 */
export interface NavigationOptions {
  skipUrlUpdate?: boolean;
  forceReload?: boolean;
  signal?: AbortSignal;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Cleanup function type
 */
export type CleanupFn = () => void;

/**
 * Event handler for control changes
 */
export type ControlChangeHandler = (values: ControlState) => void;
