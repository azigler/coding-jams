import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 7,
  prompt: 'Boolean algebra. Get inspired by Boolean algebra, in any way.',
  creditName: 'PaoloCurtoni',
  creditUrl: 'https://www.paolocurtoni.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 7 - Boolean algebra
    p.background(240);
  }
};

export default config;
