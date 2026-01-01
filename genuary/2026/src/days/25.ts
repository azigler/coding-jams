import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 25,
  prompt: 'Organic Geometry. Forms that look or act organic but are constructed entirely from geometric shapes.',
  creditName: 'Manuel Larino',
  creditUrl: 'https://mlarino.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 25 - Organic Geometry
    p.background(240);
  }
};

export default config;
