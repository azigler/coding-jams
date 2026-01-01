import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 14,
  prompt: 'Everything fits perfectly.',
  creditName: 'Roni',
  creditUrl: 'https://ronikaufman.github.io/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 14 - Everything fits perfectly
    p.background(240);
  }
};

export default config;
