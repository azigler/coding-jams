import type { DayConfig } from '../types';

// Day 28 is special - no libraries, no canvas, only HTML elements
// This will need custom handling in the loader
const config: DayConfig = {
  day: 28,
  prompt: 'No libraries, no canvas, only HTML elements.',
  creditName: 'Piero',
  creditUrl: 'https://pifragile.com/',
  
  setup: (p: p5) => {
    // This day should not use p5.js at all
    // It will be handled separately in the loader
  },
  
  draw: (p: p5) => {
    // This day should not use p5.js at all
  }
};

export default config;
