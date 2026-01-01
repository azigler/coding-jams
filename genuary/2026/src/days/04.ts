import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 4,
  prompt: 'Lowres. An image or graphic with low resolution, where details are simplified or pixelated.',
  creditName: 'Manuel Larino',
  creditUrl: 'https://mlarino.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 4 - Lowres
    p.background(240);
  }
};

export default config;
