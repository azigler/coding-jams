import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 30,
  prompt: 'Its not a bug, its a feature.',
  creditName: 'Bart Simons',
  creditUrl: 'https://www.bartsimons.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 30 - It's not a bug, it's a feature
    p.background(240);
  }
};

export default config;
