import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 26,
  prompt: 'Recursive Grids. Split the canvas into a grid of some kind and recurse on each cell again and again.',
  creditName: 'Piero',
  creditUrl: 'https://pifragile.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 26 - Recursive Grids
    p.background(240);
  }
};

export default config;
