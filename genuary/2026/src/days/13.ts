import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 13,
  prompt: 'Self portrait. For example, get started with a very basic human face, a few circles or oval shapes. How far can you improve this by adding features that actually look like you. Try adding eyes, eyelashes, hair, and make a few parameters or colors variable. Even though you are aiming for a self portrait, it might be fun to render some random variations as well.',
  creditName: 'Jos Vromans',
  creditUrl: 'https://www.josvromans.art/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 13 - Self portrait
    p.background(240);
  }
};

export default config;
