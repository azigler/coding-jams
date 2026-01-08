/**
 * Shared types for Genuary 2026 projects
 */

import type p5 from 'p5';

// Re-export p5 type for use in day files
export type { p5 };

/**
 * Uniform configuration for shader days
 * Maps control values to shader uniforms
 */
export interface UniformConfig {
  name: string;
  type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'int' | 'bool';
  controlKey?: string; // Links to control slider
  defaultValue?: number | number[];
}

export interface DayConfig {
  day: number;
  prompt: string;
  creditName: string;
  creditUrl: string;
  recording?: {
    enabled: boolean;
    duration: number; // seconds
    filename: string;
  };

  // Render mode: 'p5' (default) or 'glsl' for pure shader days
  mode?: 'p5' | 'glsl';

  // p5 mode functions
  setup?: (p: p5) => void;
  draw?: (p: p5) => void;
  renderFinal?: (p: p5) => void; // Render final/complete state for static image
  windowResized?: (p: p5) => void;
  mousePressed?: (p: p5) => void;
  keyPressed?: (p: p5) => void;

  // GLSL mode properties
  fragmentShader?: string;
  vertexShader?: string; // Optional, uses default fullscreen quad if not provided
  uniforms?: UniformConfig[];
}

export interface DayModule {
  default: DayConfig;
}
