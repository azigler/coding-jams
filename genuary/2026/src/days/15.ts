import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 15,
  prompt: 'Create an invisible object where only the shadows can be seen.',
  creditName: 'P1xelboy',
  creditUrl: 'https://linktr.ee/p1x3lboy',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 15 - Invisible object with shadows only
    p.background(240);
  }
};

export default config;
