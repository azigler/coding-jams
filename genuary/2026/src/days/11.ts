/**
 * Day 11: "THE WRITER"
 *
 * A true quine — code that displays itself, character by character.
 *
 * The string Q contains the rendering loop. The rendering loop displays Q.
 * What you see IS what draws what you see.
 *
 * Medium: Self-reference made visible
 */

import type { DayConfig, p5 } from '../types';
import { createCanvas } from '../utils/canvas';
import type { ControlConfig, ControlState } from '../utils/controls';

// ============================================================================
// THE QUINE — This string IS the code that displays it
// ============================================================================

// Q contains the draw loop. The draw loop displays Q. That's the quine.
const Q = `const Q = \`...\`;
const M = 30;      // margin
const W = 9.8;     // char width
const H = 20;      // line height
const COLS = 56;   // chars per line

let n = 0;         // chars typed

function draw() {
  background('#08080c');
  textFont('monospace');
  textSize(14);

  for (let i = 0; i < n; i++) {
    let c = Q[i];
    let x = M + (i % COLS) * W;
    let y = M + ~~(i / COLS) * H;
    fill(syntaxColor(c, i));
    text(c, x, y);
  }

  // cursor
  let cx = M + (n % COLS) * W;
  let cy = M + ~~(n / COLS) * H;
  if (frameCount % 30 < 15) {
    fill(200);
    rect(cx, cy, 2, 14);
  }

  if (frameCount % 2 === 0) n++;
  if (n > Q.length) n = 0;
}

// What you see is what draws you seeing it.`;

// ============================================================================
// SYNTAX COLORS
// ============================================================================

function syntaxColor(char: string, index: number, code: string): { r: number; g: number; b: number } {
  // Check if in comment
  let lineStart = index;
  while (lineStart > 0 && code[lineStart - 1] !== '\n') lineStart--;
  const line = code.slice(lineStart, index + 1);
  if (line.includes('//')) {
    return { r: 100, g: 110, b: 120 }; // gray
  }

  // String literals
  const quotes = (line.match(/'/g) || []).length + (line.match(/`/g) || []).length;
  if (quotes % 2 === 1) {
    return { r: 130, g: 180, b: 130 }; // green
  }

  // Numbers
  if (/[0-9]/.test(char)) {
    return { r: 220, g: 180, b: 100 }; // gold
  }

  // Keywords
  const keywords = ['const', 'let', 'function', 'for', 'if'];
  for (const kw of keywords) {
    const start = index - kw.length + 1;
    if (start >= 0 && code.slice(start, index + 1) === kw) {
      const before = start > 0 ? code[start - 1] : ' ';
      const after = code[index + 1] || ' ';
      if (!/\w/.test(before) && !/\w/.test(after)) {
        return { r: 130, g: 190, b: 220 }; // cyan
      }
    }
  }

  // Punctuation
  if (/[{}()\[\];:,.<>=+\-*/]/.test(char)) {
    return { r: 180, g: 140, b: 200 }; // purple
  }

  // Default
  return { r: 220, g: 220, b: 225 }; // white
}

// ============================================================================
// STATE
// ============================================================================

interface State {
  n: number;
  lastTime: number;
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  typeSpeed: 35,
  fontSize: 14,
};

const controlConfigs: { [key: string]: ControlConfig } = {
  typeSpeed: {
    label: 'Type Speed (ms)',
    min: 10,
    max: 100,
    defaultValue: 35,
    step: 5
  },
  fontSize: {
    label: 'Font Size',
    min: 12,
    max: 18,
    defaultValue: 14,
    step: 1
  }
};

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 11,
  prompt: 'Quine. A Quine is a form of code poetry, it\'s a computer program that outputs exactly its own source code.',
  creditName: 'Manuel Larino',
  creditUrl: 'https://mlarino.com/',
  recording: {
    enabled: true,
    duration: 30,
    filename: 'genuary-2026-day-11'
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
    p.textFont('monospace');
    (p as any)._state = { n: 0, lastTime: 0 } as State;
  },

  draw: (p: p5) => {
    const controls = (p as any)._controls || defaultControls;
    const state: State = (p as any)._state;
    const now = p.millis();

    const typeSpeed = controls.typeSpeed ?? 35;
    const fontSize = controls.fontSize ?? 14;
    const M = 30;
    const W = fontSize * 0.7;
    const H = fontSize * 1.45;
    const COLS = Math.floor((p.width - M * 2) / W);

    // Advance typing
    if (now - state.lastTime > typeSpeed) {
      state.n++;
      state.lastTime = now;
      if (state.n > Q.length) {
        state.n = 0;
      }
    }

    // Draw
    p.background(8, 8, 12);
    p.textFont('monospace');
    p.textSize(fontSize);
    p.textAlign(p.LEFT, p.TOP);
    p.noStroke();

    // Draw characters
    for (let i = 0; i < state.n && i < Q.length; i++) {
      const c = Q[i];
      if (c === '\n') continue;

      // Calculate position (handle newlines)
      let charIndex = 0;
      let line = 0;
      let col = 0;
      for (let j = 0; j <= i; j++) {
        if (Q[j] === '\n') {
          line++;
          col = 0;
        } else {
          if (j === i) break;
          col++;
        }
      }

      const x = M + col * W;
      const y = M + line * H;

      const color = syntaxColor(c, i, Q);
      p.fill(color.r, color.g, color.b);
      p.text(c, x, y);
    }

    // Draw cursor
    let cursorLine = 0;
    let cursorCol = 0;
    for (let j = 0; j < state.n && j < Q.length; j++) {
      if (Q[j] === '\n') {
        cursorLine++;
        cursorCol = 0;
      } else {
        cursorCol++;
      }
    }
    const cx = M + cursorCol * W;
    const cy = M + cursorLine * H;

    if (Math.floor(now / 500) % 2 === 0) {
      p.fill(200, 200, 210, 200);
      p.rect(cx, cy + 2, 2, fontSize);
    }

    // Title
    p.fill(0, 0, 0, 180);
    p.rect(0, p.height - 45, p.width, 45);
    p.fill(200);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(15);
    p.text('THE WRITER', p.width / 2, p.height - 27);
    p.fill(120);
    p.textSize(10);
    p.text('this code displays itself', p.width / 2, p.height - 10);
  },

  renderFinal: (p: p5) => {
    const fontSize = 14;
    const M = 30;
    const W = fontSize * 0.7;
    const H = fontSize * 1.45;

    p.background(8, 8, 12);
    p.textFont('monospace');
    p.textSize(fontSize);
    p.textAlign(p.LEFT, p.TOP);
    p.noStroke();

    // Draw all characters
    let line = 0;
    let col = 0;
    for (let i = 0; i < Q.length; i++) {
      const c = Q[i];
      if (c === '\n') {
        line++;
        col = 0;
        continue;
      }

      const x = M + col * W;
      const y = M + line * H;

      const color = syntaxColor(c, i, Q);
      p.fill(color.r, color.g, color.b);
      p.text(c, x, y);
      col++;
    }

    // Title
    p.fill(0, 0, 0, 180);
    p.rect(0, p.height - 45, p.width, 45);
    p.fill(200);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(15);
    p.text('THE WRITER', p.width / 2, p.height - 27);
    p.fill(120);
    p.textSize(10);
    p.text('this code displays itself', p.width / 2, p.height - 10);
  }
};

export function getClaudesChoice(): Partial<ControlState> {
  return {
    typeSpeed: 30,
    fontSize: 14
  };
}

export { controlConfigs, defaultControls };
export default config;
