import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 18,
  prompt: 'Unexpected path. Draw a route that changes direction based on one very simple rule.',
  creditName: 'Baret LaVida',
  creditUrl: 'https://www.artbaret.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 18 - Unexpected path
    p.background(240);
  }
};

export default config;
