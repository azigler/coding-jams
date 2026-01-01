import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 11,
  prompt: 'Quine. A Quine is a form of code poetry, it\'s a computer program that outputs exactly its own source code.',
  creditName: 'Manuel Larino',
  creditUrl: 'https://mlarino.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 11 - Quine
    p.background(240);
  }
};

export default config;
