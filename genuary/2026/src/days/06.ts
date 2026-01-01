import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 6,
  prompt: 'Lights on/off. Make something that changes when you switch on or off the "digital" lights.',
  creditName: 'George Henry Rowe',
  creditUrl: 'https://georgehenryrowe.co.uk/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 6 - Lights on/off
    p.background(240);
  },
  
  mousePressed: (p: p5) => {
    // TODO: Toggle lights on/off
  }
};

export default config;
