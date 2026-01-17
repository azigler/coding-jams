/**
 * Day loader for the Genuary 2026 harness
 *
 * Provides unified day loading with proper type safety,
 * eliminating duplicate code paths for with/without controls.
 */

import p5 from 'p5';
import type {
  DayConfig,
  DayModule,
  DayRenderer,
  ControlState,
  RecordingConfig,
  ControlChangeHandler,
  ThreeContext,
} from '../types';
import { setControls, setRecording } from './state';
import { registerCleanup } from './cleanup';
import { createShaderRenderer, type ShaderRenderer } from './shader-renderer';

// ============================================================================
// Extended p5 properties (stored on instance)
// ============================================================================

interface P5Extensions {
  _controls?: ControlState;
  _recordingModule?: {
    isCurrentlyRecording: () => boolean;
    captureFrame: (p: p5) => void;
    initEncoder: (p: p5, config: RecordingConfig) => unknown;
    startRecording: (p: p5, config: RecordingConfig) => void;
  };
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

type P5WithExtensions = p5 & P5Extensions & {
  canvas?: HTMLCanvasElement & { _cleanupResize?: () => void };
};

// ============================================================================
// Module Loading
// ============================================================================

/**
 * Dynamically import a day module
 */
export async function importDayModule(dayNum: number): Promise<DayModule> {
  const paddedDay = dayNum.toString().padStart(2, '0');
  const module = await import(`../days/${paddedDay}.ts`) as DayModule;
  return module;
}

/**
 * Get the default control values from a module
 */
export function getDefaultControls(module: DayModule): ControlState {
  const configs = module.controlConfigs ?? {};
  const defaults = module.defaultControls ?? {};

  // Build defaults from configs if not explicitly provided
  const result: ControlState = { ...defaults };
  for (const [key, config] of Object.entries(configs)) {
    if (result[key] === undefined) {
      result[key] = config.defaultValue;
    }
  }

  return result;
}

// ============================================================================
// P5 Renderer Creation
// ============================================================================

interface P5RendererOptions {
  config: DayConfig;
  container: HTMLElement;
  initialControls: ControlState;
  onControlsChange: ControlChangeHandler;
  hasControls: boolean;
}

/**
 * Create a p5.js renderer for a day
 * This is the SINGLE source of sketch creation, replacing the duplicate code paths
 */
export function createP5Renderer(options: P5RendererOptions): DayRenderer {
  const { config, container, initialControls, onControlsChange, hasControls } = options;

  let controls = { ...initialControls };
  let sketch: P5WithExtensions | null = null;
  let running = false;

  // Track cleanup
  let cleanupFn: (() => void) | null = null;

  const sketchFn = (p: p5) => {
    const extP = p as P5WithExtensions;

    // Initialize extended properties
    extP._controls = controls;
    extP._recordingModule = undefined;

    // Preload recording module if enabled
    if (config.recording?.enabled) {
      import('../utils/recording.js').then((module) => {
        extP._recordingModule = module;
      }).catch((err) => {
        console.error('Failed to load recording module:', err);
      });
    }

    // Setup
    p.setup = () => {
      // Ensure controls are set before setup runs
      if (hasControls && !extP._controls) {
        extP._controls = controls;
      }
      config.setup?.(p);
    };

    // Draw
    p.draw = () => {
      config.draw?.(p);

      // Capture frame if recording
      if (extP._recordingModule?.isCurrentlyRecording()) {
        extP._recordingModule.captureFrame(p);
      }
    };

    // Window resize handler
    if (config.windowResized) {
      p.windowResized = () => {
        updateCanvasDisplay(p);
        config.windowResized!(p);
      };
    }

    // Mouse pressed
    if (config.mousePressed) {
      p.mousePressed = () => config.mousePressed!(p);
    }

    // Key handler with built-in shortcuts
    p.keyPressed = () => {
      // Day-specific handler first
      config.keyPressed?.(p);

      // Built-in: 's' to save frame
      if (p.key === 's' || p.key === 'S') {
        const filename = `genuary-2026-day-${config.day.toString().padStart(2, '0')}-frame.png`;
        p.save(filename);
      }

      // Built-in: 'r' to record GIF
      if ((p.key === 'r' || p.key === 'R') && config.recording) {
        triggerRecording(extP, config.recording);
      }
    };
  };

  return {
    start: () => {
      if (running) return;

      sketch = new p5(sketchFn, container) as P5WithExtensions;
      running = true;

      // Register cleanup
      cleanupFn = registerCleanup(() => {
        if (sketch) {
          // Clean up resize listener
          if (sketch.canvas?._cleanupResize) {
            sketch.canvas._cleanupResize();
          }
          sketch.remove();
          sketch = null;
        }
        running = false;
      });
    },

    stop: () => {
      if (!running) return;

      // Clean up resize listener
      if (sketch?.canvas?._cleanupResize) {
        sketch.canvas._cleanupResize();
      }

      sketch?.remove();
      sketch = null;
      running = false;

      // Unregister cleanup
      cleanupFn?.();
      cleanupFn = null;
    },

    updateControls: (newControls: ControlState) => {
      const prevControls = controls;
      controls = { ...newControls };

      if (sketch) {
        sketch._controls = controls;

        // Reset cached data when specific controls change
        resetCachedDataOnControlChange(sketch, prevControls, controls);

        // Redraw if looping
        if (sketch.isLooping()) {
          sketch.redraw();
        }
      }

      // Update global state
      setControls(controls);

      // Notify callback
      onControlsChange(controls);
    },

    getCanvas: () => sketch?.canvas ?? null,

    getSketch: () => sketch,

    isRunning: () => running,
  };
}

/**
 * Reset cached data when relevant controls change
 * This handles the specific invalidation logic from the original code
 */
function resetCachedDataOnControlChange(
  sketch: P5WithExtensions,
  prevControls: ControlState,
  newControls: ControlState
): void {
  // Count-based data (triangles, balls, particles)
  const prevCount =
    prevControls.numTriangles ??
    prevControls.numBalls ??
    prevControls.numParticles ??
    0;
  const newCount =
    newControls.numTriangles ??
    newControls.numBalls ??
    newControls.numParticles ??
    0;

  if (newCount !== prevCount) {
    sketch._triangleData = undefined;
    sketch._lastTriangleCount = undefined;
    sketch._balls = undefined;
    sketch._lastBallCount = undefined;
    sketch._particles = undefined;
    sketch._lastParticleCount = undefined;
  }

  // Color mutation
  if (newControls.colorMutation !== prevControls.colorMutation) {
    sketch._lastColorMutation = undefined;
  }

  // Spiral/color spread
  if (
    newControls.spiralTightness !== prevControls.spiralTightness ||
    newControls.colorSpread !== prevControls.colorSpread
  ) {
    sketch._lastSpiralTightness = undefined;
    sketch._lastColorSpread = undefined;
  }

  // Mode changes
  if (newControls.mode !== prevControls.mode) {
    sketch._particles = undefined;
    sketch._lastParticleCount = undefined;
    sketch._waveSources = undefined;
    sketch._lastWaveCount = undefined;
  }
}

/**
 * Update canvas display scaling for responsive layout
 */
function updateCanvasDisplay(p: p5): void {
  const extP = p as P5WithExtensions;
  const canvas = extP.canvas;
  const container = canvas?.parentElement;

  if (!container || !canvas) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const maxDisplaySize = 800;
  const displayWidth = Math.min(p.width, maxDisplaySize);
  const displayHeight = Math.min(p.height, maxDisplaySize);

  let scale: number;
  let finalWidth: number;
  let finalHeight: number;

  if (isMobile) {
    // Mobile: enforce square aspect ratio
    scale = Math.min((container.clientWidth * 0.95) / displayWidth, 1);
    finalWidth = displayWidth * scale;
    finalHeight = finalWidth;
  } else {
    // Desktop: maintain original aspect ratio
    scale = Math.min(
      container.clientWidth / p.width,
      container.clientHeight / p.height,
      1
    );
    finalWidth = p.width * scale;
    finalHeight = p.height * scale;
  }

  canvas.style.width = `${finalWidth}px`;
  canvas.style.height = `${finalHeight}px`;
}

/**
 * Trigger GIF recording
 */
function triggerRecording(sketch: P5WithExtensions, config: RecordingConfig): void {
  // Try global saveGif first
  const globalSaveGif = (window as unknown as Record<string, unknown>).saveGif as
    | ((filename: string, duration: number) => void)
    | undefined;

  if (typeof globalSaveGif === 'function') {
    globalSaveGif(config.filename, config.duration);
  } else if (sketch._recordingModule) {
    // Use recording module
    const encoder = sketch._recordingModule.initEncoder(sketch, config);
    if (encoder) {
      setRecording(true);
      sketch._recordingModule.startRecording(sketch, config);
    }
  } else {
    // Fallback to saveFrames
    const saveFramesFn = (sketch as unknown as { saveFrames?: (name: string, ext: string, duration: number, fps: number) => void }).saveFrames;
    if (typeof saveFramesFn === 'function') {
      saveFramesFn.call(sketch, config.filename, 'png', config.duration, 30);
    }
  }
}

// ============================================================================
// GLSL Renderer Creation
// ============================================================================

interface GLSLRendererOptions {
  config: DayConfig;
  container: HTMLElement;
  initialControls: ControlState;
  onControlsChange: ControlChangeHandler;
}

/**
 * Create a GLSL shader renderer wrapped as a DayRenderer
 * This adapts the ShaderRenderer interface to the DayRenderer interface
 */
export function createGLSLRenderer(options: GLSLRendererOptions): DayRenderer | null {
  const { config, container, initialControls, onControlsChange } = options;

  let shaderRenderer: ShaderRenderer | null = null;
  let running = false;
  let animationId: number | null = null;
  let cleanupFn: (() => void) | null = null;

  // Create the shader renderer
  shaderRenderer = createShaderRenderer(config, container, initialControls);
  if (!shaderRenderer) {
    return null;
  }

  const renderer = shaderRenderer;

  return {
    start: () => {
      if (running || !renderer) return;
      running = true;

      // Animation loop
      function animate() {
        renderer.update();
        animationId = requestAnimationFrame(animate);
      }
      animate();

      // Register cleanup
      cleanupFn = registerCleanup(() => {
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
        renderer.destroy();
        running = false;
      });
    },

    stop: () => {
      if (!running) return;

      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }

      renderer.destroy();
      running = false;

      // Unregister cleanup
      cleanupFn?.();
      cleanupFn = null;
    },

    updateControls: (newControls: ControlState) => {
      renderer.setControls(newControls);
      setControls(newControls);
      onControlsChange(newControls);
    },

    getCanvas: () => renderer.canvas,

    getSketch: () => null, // GLSL renderer has no p5 sketch

    isRunning: () => running,
  };
}

// ============================================================================
// Three.js Renderer Creation
// ============================================================================

interface ThreeRendererOptions {
  config: DayConfig;
  container: HTMLElement;
  initialControls: ControlState;
  onControlsChange: ControlChangeHandler;
}

/**
 * Create a Three.js renderer wrapped as a DayRenderer
 */
export function createThreeRenderer(options: ThreeRendererOptions): DayRenderer | null {
  const { config, container, initialControls, onControlsChange } = options;

  if (!config.threeSetup) {
    console.error('Three.js day missing threeSetup function');
    return null;
  }

  let ctx: ThreeContext | null = null;
  let controls = { ...initialControls };
  let running = false;
  let animationId: number | null = null;
  let cleanupFn: (() => void) | null = null;
  let lastTime = performance.now();

  return {
    start: () => {
      if (running) return;

      // Initialize Three.js context
      ctx = config.threeSetup!(container, controls);
      if (!ctx) {
        console.error('threeSetup returned null');
        return;
      }

      running = true;
      lastTime = performance.now();

      // Animation loop
      function animate() {
        if (!ctx || !running) return;

        const now = performance.now();
        const deltaTime = (now - lastTime) / 1000;
        lastTime = now;

        // Update scene
        config.threeUpdate?.(ctx, controls, deltaTime);

        // Render
        ctx.renderer.render(ctx.scene, ctx.camera);

        animationId = requestAnimationFrame(animate);
      }
      animate();

      // Register cleanup
      cleanupFn = registerCleanup(() => {
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
        if (ctx) {
          config.threeCleanup?.(ctx);
          ctx.renderer.dispose();
          ctx.canvas.remove();
          ctx = null;
        }
        running = false;
      });
    },

    stop: () => {
      if (!running) return;

      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }

      if (ctx) {
        config.threeCleanup?.(ctx);
        ctx.renderer.dispose();
        ctx.canvas.remove();
        ctx = null;
      }

      running = false;
      cleanupFn?.();
      cleanupFn = null;
    },

    updateControls: (newControls: ControlState) => {
      controls = { ...newControls };
      setControls(controls);
      onControlsChange(controls);
    },

    getCanvas: () => ctx?.canvas ?? null,

    getSketch: () => null, // Three.js renderer has no p5 sketch

    isRunning: () => running,
  };
}

// ============================================================================
// Full Day Loader
// ============================================================================

export interface LoadDayResult {
  renderer: DayRenderer;
  config: DayConfig;
  module: DayModule;
  controls: ControlState;
  hasControls: boolean;
}

/**
 * Load a day and create its renderer
 * This is the main entry point for loading days
 */
export async function loadDay(
  dayNum: number,
  container: HTMLElement,
  onControlsChange: ControlChangeHandler,
  loadSavedControls: (day: number, defaults: ControlState) => ControlState
): Promise<LoadDayResult> {
  // Import the module
  const module = await importDayModule(dayNum);
  const config = module.default;

  // Get control configuration
  const hasControls = !!(module.controlConfigs && module.defaultControls);
  const defaultControls = getDefaultControls(module);

  // Load controls (either saved or defaults)
  const controls = hasControls
    ? loadSavedControls(dayNum, defaultControls)
    : defaultControls;

  // Update global state
  setControls(controls);

  // Create the appropriate renderer based on mode
  let renderer: DayRenderer;

  if (config.mode === 'glsl') {
    // GLSL/WebGL shader mode
    const glslRenderer = createGLSLRenderer({
      config,
      container,
      initialControls: controls,
      onControlsChange,
    });

    if (!glslRenderer) {
      throw new Error(`Failed to create GLSL renderer for day ${dayNum}. WebGL may not be available.`);
    }

    renderer = glslRenderer;
  } else if (config.mode === 'three') {
    // Three.js mode
    const threeRenderer = createThreeRenderer({
      config,
      container,
      initialControls: controls,
      onControlsChange,
    });

    if (!threeRenderer) {
      throw new Error(`Failed to create Three.js renderer for day ${dayNum}.`);
    }

    renderer = threeRenderer;
  } else {
    // Default p5.js mode
    renderer = createP5Renderer({
      config,
      container,
      initialControls: controls,
      onControlsChange,
      hasControls,
    });
  }

  return {
    renderer,
    config,
    module,
    controls,
    hasControls,
  };
}
