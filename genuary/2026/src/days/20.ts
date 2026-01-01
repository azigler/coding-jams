import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 20,
  prompt: 'One line. An artwork that is made of a single line only.',
  creditName: 'Jos Vromans',
  creditUrl: 'https://www.josvromans.art/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 20 - One line
    p.background(240);
  }
};

export default config;
