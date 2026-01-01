import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 24,
  prompt: 'Perfectionist\'s nightmare.',
  creditName: 'Sophia (fractal kitty)',
  creditUrl: 'https://www.fractalkitty.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 24 - Perfectionist's nightmare
    p.background(240);
  }
};

export default config;
