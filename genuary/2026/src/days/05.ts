import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 5,
  prompt: 'Write "Genuary". Avoid using a font.',
  creditName: 'Piero',
  creditUrl: 'https://pifragile.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 5 - Write "Genuary" without using a font
    p.background(240);
  }
};

export default config;
