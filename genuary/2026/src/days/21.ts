import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 21,
  prompt: 'Bauhaus Poster. Create a poster design inspired by the German art school Bauhaus.',
  creditName: 'Piero',
  creditUrl: 'https://pifragile.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop();
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 21 - Bauhaus Poster
    p.background(240);
  }
};

export default config;
