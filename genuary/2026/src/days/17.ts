import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 17,
  prompt: 'Wallpaper group. There are only 17 ways to cover a plane with a repeating pattern, choose your favourite.',
  creditName: 'Ivan Dianov',
  creditUrl: 'https://ivandianov.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 17 - Wallpaper group
    p.background(240);
  }
};

export default config;
