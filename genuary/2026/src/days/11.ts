/**
 * Day 11: "THE WRITER"
 *
 * A quine is not a visual trick. It's a moment of recognition.
 *
 * Watch code type itself into existence. The code you're reading
 * describes exactly what you're seeing: the cursor position, the font,
 * the colors, the timing. When the code says "cursor.x = 40", the
 * cursor IS at x=40. The code writes itself true.
 *
 * This is Escher's "Drawing Hands" as software. The hand that draws
 * is drawn by the hand it draws.
 *
 * The quine moment isn't visual — it's cognitive. The instant you
 * realize: the output I'm reading IS the source creating it.
 *
 * "Yields falsehood when preceded by its quotation"
 *  yields falsehood when preceded by its quotation.
 *      — W.V.O. Quine
 *
 * Medium: Self-reference made legible, the strange loop you can read
 */

import type { DayConfig, p5 } from '../types';
import { createCanvas } from '../utils/canvas';
import type { ControlConfig, ControlState } from '../utils/controls';

// ============================================================================
// THE SOURCE — THIS IS THE CODE THAT WRITES ITSELF
// ============================================================================

// This code describes itself. When it says font.size = 14, the font IS 14.
// When it says cursor.x = 40, the cursor IS at 40. Truth through description.
const THE_CODE = `// THE WRITER — code that writes itself into existence

// What you see is defined here:
const screen = {
  width: 800,
  height: 800,
  background: '#08080c'
};

const cursor = {
  x: 40,           // I am here
  blink: true,     // I am blinking
  interval: 530    // milliseconds
};

const font = {
  size: 15,
  family: 'monospace',
  color: '#e8e8e8',
  lineHeight: 22
};

// The typing that types this:
const typing = {
  speed: 45,       // ms per character
  sound: false     // silence
};

// What you're reading right now:
function write(char, x, y) {
  context.fillStyle = font.color;
  context.font = font.size + 'px ' + font.family;
  context.fillText(char, x, y);
}

// The loop that runs this:
function draw() {
  // Clear to background
  fill(screen.background);

  // For each character typed so far:
  for (let i = 0; i < currentChar; i++) {
    const char = THE_CODE[i];
    const pos = getPosition(i);

    // Syntax highlighting:
    // - comments: dim
    // - strings: green
    // - keywords: cyan
    // - numbers: gold

    write(char, pos.x, pos.y);
  }

  // The cursor that leads:
  if (cursor.blink) {
    drawCursor(cursorPos.x, cursorPos.y);
  }

  // Advance one character
  currentChar++;

  // When done, pause. Then restart.
  // The loop is eternal.
}

// This describes itself.
// You are reading what is writing you reading it.
// The strange loop closes here.

// — W.V.O. Quine (1908-2000)
// — Douglas Hofstadter
// — M.C. Escher, "Drawing Hands"`;

// ============================================================================
// TYPES
// ============================================================================

interface TypeState {
  charIndex: number;
  lastTypeTime: number;
  blinkState: boolean;
  lastBlinkTime: number;
  lines: string[];
  lineStartIndices: number[];
  isComplete: boolean;
  pauseUntil: number;
}

// ============================================================================
// SYNTAX HIGHLIGHTING — THE CODE KNOWS ITSELF
// ============================================================================

function getSyntaxColor(
  code: string,
  index: number,
  hueShift: number
): { r: number; g: number; b: number; a: number } {
  // Look backwards to determine context
  let lineStart = index;
  while (lineStart > 0 && code[lineStart - 1] !== '\n') lineStart--;
  const lineUpToIndex = code.slice(lineStart, index + 1);
  const char = code[index];

  // Check if we're in a comment
  const commentIndex = lineUpToIndex.indexOf('//');
  if (commentIndex !== -1 && index >= lineStart + commentIndex) {
    return hslToRgb(220 + hueShift, 0.15, 0.45); // Dim blue-gray
  }

  // Check if we're in a string
  const singleQuotes = (lineUpToIndex.match(/'/g) || []).length;
  const doubleQuotes = (lineUpToIndex.match(/"/g) || []).length;
  if (singleQuotes % 2 === 1 || doubleQuotes % 2 === 1) {
    return hslToRgb(140 + hueShift, 0.6, 0.55); // Green for strings
  }

  // Keywords
  const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'for', 'while', 'true', 'false'];
  for (const kw of keywords) {
    const kwStart = index - kw.length + 1;
    if (kwStart >= 0) {
      const slice = code.slice(kwStart, index + 1);
      if (slice === kw) {
        // Check it's a word boundary
        const before = kwStart > 0 ? code[kwStart - 1] : ' ';
        const after = index < code.length - 1 ? code[index + 1] : ' ';
        if (!/[a-zA-Z_$]/.test(before) && !/[a-zA-Z_$0-9]/.test(after)) {
          return hslToRgb(190 + hueShift, 0.7, 0.6); // Cyan for keywords
        }
      }
    }
  }

  // Numbers
  if (/[0-9]/.test(char)) {
    return hslToRgb(35 + hueShift, 0.85, 0.6); // Gold for numbers
  }

  // Punctuation and operators
  if (/[{}()\[\];:,.<>=+\-*/]/.test(char)) {
    return hslToRgb(280 + hueShift, 0.4, 0.65); // Muted purple
  }

  // Default text
  return hslToRgb(220 + hueShift, 0.08, 0.85); // Near-white
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number; a: number } {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a: 255
  };
}

// ============================================================================
// TEXT LAYOUT
// ============================================================================

function preprocessCode(code: string): { lines: string[]; lineStartIndices: number[] } {
  const lines: string[] = [];
  const lineStartIndices: number[] = [];
  let currentLine = '';
  let index = 0;

  lineStartIndices.push(0);

  for (let i = 0; i < code.length; i++) {
    if (code[i] === '\n') {
      lines.push(currentLine);
      currentLine = '';
      lineStartIndices.push(i + 1);
    } else {
      currentLine += code[i];
    }
    index++;
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  return { lines, lineStartIndices };
}

function getCharPosition(
  index: number,
  lineStartIndices: number[],
  marginX: number,
  marginY: number,
  lineHeight: number,
  charWidth: number
): { x: number; y: number; line: number; col: number } {
  let line = 0;
  for (let i = 1; i < lineStartIndices.length; i++) {
    if (index < lineStartIndices[i]) {
      break;
    }
    line = i;
  }

  const col = index - lineStartIndices[line];
  const x = marginX + col * charWidth;
  const y = marginY + line * lineHeight;

  return { x, y, line, col };
}

// ============================================================================
// RENDERING
// ============================================================================

function drawBackground(p: p5): void {
  // The background described in THE_CODE: #08080c
  p.background(8, 8, 12);
}

function drawCursor(
  p: p5,
  x: number,
  y: number,
  visible: boolean,
  fontSize: number
): void {
  if (!visible) return;

  // The cursor: a simple vertical bar
  p.noStroke();
  p.fill(220, 220, 230, 200);
  p.rect(x, y - fontSize + 4, 2, fontSize);
}

function drawTypedCode(
  p: p5,
  code: string,
  charCount: number,
  marginX: number,
  marginY: number,
  lineHeight: number,
  charWidth: number,
  fontSize: number,
  lineStartIndices: number[],
  hueShift: number
): { cursorX: number; cursorY: number } {
  p.textFont('monospace');
  p.textSize(fontSize);
  p.textAlign(p.LEFT, p.TOP);

  let cursorX = marginX;
  let cursorY = marginY;

  const displayCount = Math.min(charCount, code.length);

  for (let i = 0; i < displayCount; i++) {
    const char = code[i];
    const pos = getCharPosition(i, lineStartIndices, marginX, marginY, lineHeight, charWidth);

    if (char !== '\n') {
      const color = getSyntaxColor(code, i, hueShift);
      p.fill(color.r, color.g, color.b, color.a);
      p.text(char, pos.x, pos.y);
    }

    // Update cursor position
    if (i === displayCount - 1) {
      if (char === '\n') {
        cursorX = marginX;
        cursorY = pos.y + lineHeight;
      } else {
        cursorX = pos.x + charWidth;
        cursorY = pos.y;
      }
    }
  }

  return { cursorX, cursorY };
}

function drawOverlay(p: p5): void {
  // Minimal title at bottom
  p.noStroke();
  p.fill(0, 0, 0, 160);
  p.rect(0, p.height - 50, p.width, 50);

  p.fill(200);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(16);
  p.textFont('monospace');
  p.text('THE WRITER', p.width / 2, p.height - 30);

  p.fill(120);
  p.textSize(10);
  p.text('this code is writing itself', p.width / 2, p.height - 12);
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  typeSpeed: 45,
  fontSize: 15,
  lineHeight: 22,
  marginX: 40,
  marginY: 40,
  hueShift: 0,
  cursorBlink: 530,
  restartDelay: 3
};

const controlConfigs: { [key: string]: ControlConfig } = {
  typeSpeed: {
    label: 'Type Speed (ms)',
    min: 10,
    max: 150,
    defaultValue: 45,
    step: 5
  },
  fontSize: {
    label: 'Font Size',
    min: 11,
    max: 20,
    defaultValue: 15,
    step: 1
  },
  lineHeight: {
    label: 'Line Height',
    min: 16,
    max: 32,
    defaultValue: 22,
    step: 1
  },
  marginX: {
    label: 'Left Margin',
    min: 20,
    max: 80,
    defaultValue: 40,
    step: 5
  },
  marginY: {
    label: 'Top Margin',
    min: 20,
    max: 80,
    defaultValue: 40,
    step: 5
  },
  hueShift: {
    label: 'Hue Shift',
    min: 0,
    max: 360,
    defaultValue: 0,
    step: 15
  },
  cursorBlink: {
    label: 'Cursor Blink (ms)',
    min: 200,
    max: 1000,
    defaultValue: 530,
    step: 50
  },
  restartDelay: {
    label: 'Restart Delay (s)',
    min: 1,
    max: 10,
    defaultValue: 3,
    step: 0.5
  }
};

// ============================================================================
// MAIN CONFIG — THE SELF-WRITING LOOP
// ============================================================================

const config: DayConfig = {
  day: 11,
  prompt: 'Quine. A Quine is a form of code poetry, it\'s a computer program that outputs exactly its own source code.',
  creditName: 'Manuel Larino',
  creditUrl: 'https://mlarino.com/',
  recording: {
    enabled: true,
    duration: 90,
    filename: 'genuary-2026-day-11'
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
    p.textFont('monospace');

    const { lines, lineStartIndices } = preprocessCode(THE_CODE);

    const state: TypeState = {
      charIndex: 0,
      lastTypeTime: 0,
      blinkState: true,
      lastBlinkTime: 0,
      lines,
      lineStartIndices,
      isComplete: false,
      pauseUntil: 0
    };

    (p as any)._state = state;
    (p as any)._startTime = p.millis();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const state: TypeState = (p as any)._state;
    const now = p.millis();

    const typeSpeed = controls.typeSpeed ?? 45;
    const fontSize = Math.round(controls.fontSize ?? 15);
    const lineHeight = Math.round(controls.lineHeight ?? 22);
    const marginX = Math.round(controls.marginX ?? 40);
    const marginY = Math.round(controls.marginY ?? 40);
    const hueShift = controls.hueShift ?? 0;
    const cursorBlinkInterval = controls.cursorBlink ?? 530;
    const restartDelay = (controls.restartDelay ?? 3) * 1000;

    // Character width for monospace
    p.textSize(fontSize);
    p.textFont('monospace');
    const charWidth = p.textWidth('M');

    // Handle restart after completion
    if (state.isComplete && now > state.pauseUntil) {
      state.charIndex = 0;
      state.isComplete = false;
      state.lastTypeTime = now;
    }

    // Type next character
    if (!state.isComplete && now - state.lastTypeTime > typeSpeed) {
      state.charIndex++;
      state.lastTypeTime = now;

      if (state.charIndex >= THE_CODE.length) {
        state.isComplete = true;
        state.pauseUntil = now + restartDelay;
      }
    }

    // Cursor blink
    if (now - state.lastBlinkTime > cursorBlinkInterval) {
      state.blinkState = !state.blinkState;
      state.lastBlinkTime = now;
    }

    // Draw
    drawBackground(p);

    const cursorPos = drawTypedCode(
      p,
      THE_CODE,
      state.charIndex,
      marginX,
      marginY,
      lineHeight,
      charWidth,
      fontSize,
      state.lineStartIndices,
      hueShift
    );

    // Draw cursor (only when not complete)
    if (!state.isComplete) {
      drawCursor(p, cursorPos.cursorX, cursorPos.cursorY, state.blinkState, fontSize);
    }

    drawOverlay(p);
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const fontSize = Math.round(controls.fontSize ?? 15);
    const lineHeight = Math.round(controls.lineHeight ?? 22);
    const marginX = Math.round(controls.marginX ?? 40);
    const marginY = Math.round(controls.marginY ?? 40);
    const hueShift = controls.hueShift ?? 0;

    p.textSize(fontSize);
    p.textFont('monospace');
    const charWidth = p.textWidth('M');

    const { lineStartIndices } = preprocessCode(THE_CODE);

    drawBackground(p);

    // Show partial code for thumbnail (about 60% through)
    const displayChars = Math.floor(THE_CODE.length * 0.6);
    const cursorPos = drawTypedCode(
      p,
      THE_CODE,
      displayChars,
      marginX,
      marginY,
      lineHeight,
      charWidth,
      fontSize,
      lineStartIndices,
      hueShift
    );

    drawCursor(p, cursorPos.cursorX, cursorPos.cursorY, true, fontSize);
    drawOverlay(p);
  }
};

// Opus 4.5's Choice — settings that create a contemplative pace
export function getClaudesChoice(): Partial<ControlState> {
  return {
    typeSpeed: 40,        // Readable pace
    fontSize: 15,         // Clear but compact
    lineHeight: 22,       // Comfortable reading
    marginX: 40,          // Classic margin
    marginY: 40,
    hueShift: 0,          // Classic syntax colors
    cursorBlink: 530,     // Standard blink rate
    restartDelay: 4       // Pause to absorb
  };
}

export { controlConfigs, defaultControls };
export default config;
