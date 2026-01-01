import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 2,
  prompt: 'Twelve principles of animation.',
  creditName: 'Anna Lucia',
  creditUrl: 'https://annalucia.io/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 2 - Twelve principles of animation
    p.background(240);
    p.fill(100, 150, 255);
    p.noStroke();
    p.circle(p.width / 2, p.height / 2, 50);
  }
};

export default config;
