import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 19,
  prompt: '16x16',
  creditName: 'Jos Vromans',
  creditUrl: 'https://www.josvromans.art/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 19 - 16x16
    p.background(240);
  }
};

export default config;
