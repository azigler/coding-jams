import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 27,
  prompt: 'Lifeform. A shape or structure that behaves as if it\'s alive or growing.',
  creditName: 'Manuel Larino',
  creditUrl: 'https://mlarino.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 27 - Lifeform
    p.background(240);
  }
};

export default config;
