import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 16,
  prompt: 'Order and disorder.',
  creditName: 'Ivan Dianov',
  creditUrl: 'https://ivandianov.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 16 - Order and disorder
    p.background(240);
  }
};

export default config;
