import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 31,
  prompt: 'GLSL day. Create an artwork using only shaders.',
  creditName: 'Piero',
  creditUrl: 'https://pifragile.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    // TODO: Set up shader for Day 31
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 31 - GLSL shaders only
    p.background(240);
  }
};

export default config;
