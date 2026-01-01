import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 12,
  prompt: 'Boxes only.',
  creditName: 'Stranger in the Q',
  creditUrl: 'https://strangerintheq.art/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 12 - Boxes only
    p.background(240);
  }
};

export default config;
