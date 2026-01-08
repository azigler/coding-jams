import type { DayConfig } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';
// Import shader as raw text (Vite feature)
import fragmentShader from '../shaders/day-31.frag?raw';

// Default control values
const defaultControls: ControlState = {
  complexity: 1.0,
  speed: 1.0,
  colorIntensity: 1.2,
  warpAmount: 1.0,
};

// Control configurations
const controlConfigs: { [key: string]: ControlConfig } = {
  complexity: {
    label: 'Complexity',
    min: 0.5,
    max: 3.0,
    defaultValue: 1.0,
    step: 0.1,
  },
  speed: {
    label: 'Speed',
    min: 0.1,
    max: 2.0,
    defaultValue: 1.0,
    step: 0.1,
  },
  colorIntensity: {
    label: 'Color Intensity',
    min: 0.5,
    max: 2.0,
    defaultValue: 1.2,
    step: 0.1,
  },
  warpAmount: {
    label: 'Warp Amount',
    min: 0.0,
    max: 2.0,
    defaultValue: 1.0,
    step: 0.1,
  },
};

const config: DayConfig = {
  day: 31,
  prompt: 'GLSL day. Create an artwork using only shaders.',
  creditName: 'Piero',
  creditUrl: 'https://pifragile.com/',
  recording: {
    enabled: true,
    duration: 10,
    filename: 'genuary-2026-day-31',
  },

  // GLSL mode configuration
  mode: 'glsl',
  fragmentShader,
  uniforms: [
    { name: 'u_complexity', type: 'float', controlKey: 'complexity' },
    { name: 'u_speed', type: 'float', controlKey: 'speed' },
    { name: 'u_colorIntensity', type: 'float', controlKey: 'colorIntensity' },
    { name: 'u_warpAmount', type: 'float', controlKey: 'warpAmount' },
  ],
};

// Opus 4.5's Choice - recommended settings
export function getClaudesChoice(): Partial<ControlState> {
  return {
    complexity: 1.5,
    speed: 0.8,
    colorIntensity: 1.4,
    warpAmount: 1.3,
  };
}

export { controlConfigs, defaultControls };
export default config;
