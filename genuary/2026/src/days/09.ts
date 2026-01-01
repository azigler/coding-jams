import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 9,
  prompt: 'Crazy automaton. Cellular automata with crazy rules.',
  creditName: 'PaoloCurtoni',
  creditUrl: 'https://www.paolocurtoni.com/',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
  },
  
  draw: (p: p5) => {
    // TODO: Implement Day 9 - Crazy automaton
    p.background(240);
  }
};

export default config;
