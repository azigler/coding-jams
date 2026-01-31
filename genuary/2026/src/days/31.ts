/**
 * Day 31: TERMINUS
 *
 * "GLSL day. Create an artwork using only shaders." — Piero
 *
 * A raymarched infinite corridor. Pure GLSL—no geometry, no mesh.
 * Every pixel calculated from signed distance functions.
 * The corridor stretches to infinity. A door is visible at the vanishing point.
 * Walk forward. Keep walking. You'll never get there.
 *
 * After Inigo Quilez (raymarching SDFs) and The Book of Shaders.
 */

import type { DayConfig } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';
// Import shader as raw text (Vite feature)
import fragmentShader from '../shaders/day-31.frag?raw';

// Default control values
const defaultControls: ControlState = {
  walkSpeed: 1.0,
  fogDensity: 1.0,
  textureScale: 0.5,
  lightWarmth: 0.7,
  animSpeed: 1.0,
};

// Control configurations
const controlConfigs: { [key: string]: ControlConfig } = {
  walkSpeed: {
    label: 'Walk Speed',
    min: 0.0,
    max: 3.0,
    defaultValue: 1.0,
    step: 0.1,
  },
  fogDensity: {
    label: 'Fog Density',
    min: 0.2,
    max: 2.0,
    defaultValue: 1.0,
    step: 0.1,
  },
  textureScale: {
    label: 'Texture Scale',
    min: 0.2,
    max: 1.5,
    defaultValue: 0.5,
    step: 0.05,
  },
  lightWarmth: {
    label: 'Light Warmth',
    min: 0.0,
    max: 1.0,
    defaultValue: 0.7,
    step: 0.05,
  },
  animSpeed: {
    label: 'Animation Speed',
    min: 0.2,
    max: 2.0,
    defaultValue: 1.0,
    step: 0.1,
  },
};

// Museum metadata for Day 31
export const museumMetadata = {
  displayType: 'architectural' as const,
  viewingDistance: 0, // You're inside it
  dimensions: [Infinity, 4, 3] as [number, number, number], // Infinite length
  animated: true,
  suggestedZone: 'entrance-hallway',
  canBecomeArchitecture: true,
  placard:
    'The corridor has no end. Each step forward, it recalculates itself. The walls are distance functions. The light is trigonometry. Walk forward. Keep walking. You\'ll never get there.',
};

const config: DayConfig = {
  day: 31,
  prompt: 'GLSL day. Create an artwork using only shaders.',
  creditName: 'Piero',
  creditUrl: 'https://pifragile.com/',
  recording: {
    enabled: true,
    duration: 15,
    filename: 'genuary-2026-day-31',
  },

  // GLSL mode configuration
  mode: 'glsl',
  fragmentShader,
  uniforms: [
    { name: 'u_walkSpeed', type: 'float', controlKey: 'walkSpeed' },
    { name: 'u_fogDensity', type: 'float', controlKey: 'fogDensity' },
    { name: 'u_textureScale', type: 'float', controlKey: 'textureScale' },
    { name: 'u_lightWarmth', type: 'float', controlKey: 'lightWarmth' },
    { name: 'u_animSpeed', type: 'float', controlKey: 'animSpeed' },
  ],
};

// Claude's Choice — recommended settings for contemplative experience
export function getClaudesChoice(): Partial<ControlState> {
  return {
    walkSpeed: 0.8,
    fogDensity: 0.9,
    textureScale: 0.45,
    lightWarmth: 0.75,
    animSpeed: 0.7,
  };
}

export { controlConfigs, defaultControls };
export default config;
