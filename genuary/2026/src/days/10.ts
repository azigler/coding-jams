import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 10,
  prompt: 'Polar coordinates.',
  creditName: 'Sophia (fractal kitty)',
  creditUrl: 'https://www.fractalkitty.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 10 - Polar coordinates
    p.background(240);
  }
};

export default config;
