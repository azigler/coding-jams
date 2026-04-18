import { areCoupled } from './sim';
import type { Firefly } from './types';

/** Draw state the renderer needs each frame. */
export interface RenderState {
  fireflies: Firefly[];
  syncScore: number;
  sceneName: string;
  sceneIndex: number;
  sceneTotal: number;
  hint: string;
  tapBudget: number;
  tapsUsed: number;
  solved: boolean;
  // Normalized progress [0,1] toward the "held sync" success threshold.
  solveProgress: number;
}

const BG_TOP = '#0a0f1a';
const BG_BOTTOM = '#000000';
const GLOW_INNER = 'rgba(255, 242, 196, 1)';
const GLOW_MID = 'rgba(255, 210, 130, 0.55)';
const GLOW_OUTER = 'rgba(255, 180, 80, 0)';
const THREAD_COLOR = 'rgba(255, 210, 150, ';
const RING_COLOR = 'rgba(255, 220, 160, ';
const GRASS_COLOR = 'rgba(120, 150, 110, ';

// A stable scatter of meadow strokes/dots. Generated once from a seeded PRNG so
// the field doesn't crawl every frame.
const meadowStrokes: {
  x: number;
  y: number;
  len: number;
  angle: number;
  alpha: number;
}[] = (() => {
  // Small LCG so the meadow is deterministic between reloads.
  let s = 0x1a2b3c4d;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
  const strokes: typeof meadowStrokes = [];
  for (let i = 0; i < 180; i++) {
    strokes.push({
      x: rand() * 900,
      y: 120 + rand() * 480,
      len: 3 + rand() * 7,
      angle: -Math.PI / 2 + (rand() - 0.5) * 0.6,
      alpha: 0.05 + rand() * 0.08,
    });
  }
  return strokes;
})();

export function render(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: RenderState,
): void {
  drawBackground(ctx, width, height);
  drawMeadow(ctx);
  drawCouplingRings(ctx, state.fireflies);
  drawCouplingThreads(ctx, state.fireflies);
  drawFireflies(ctx, state.fireflies);
  drawHud(ctx, width, height, state);
  if (state.solved) drawSuccessOverlay(ctx, width, height);
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, BG_TOP);
  grad.addColorStop(1, BG_BOTTOM);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawMeadow(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.lineWidth = 1;
  for (const s of meadowStrokes) {
    ctx.strokeStyle = GRASS_COLOR + s.alpha + ')';
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(
      s.x + Math.cos(s.angle) * s.len,
      s.y + Math.sin(s.angle) * s.len,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawCouplingRings(
  ctx: CanvasRenderingContext2D,
  flies: Firefly[],
): void {
  ctx.save();
  ctx.lineWidth = 1;
  for (const f of flies) {
    ctx.strokeStyle = RING_COLOR + '0.04)';
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.couplingRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCouplingThreads(
  ctx: CanvasRenderingContext2D,
  flies: Firefly[],
): void {
  ctx.save();
  ctx.lineWidth = 1;
  for (let i = 0; i < flies.length; i++) {
    for (let j = i + 1; j < flies.length; j++) {
      const a = flies[i];
      const b = flies[j];
      const dist = areCoupled(a, b);
      if (dist === null) continue;
      const minR = Math.min(a.couplingRadius, b.couplingRadius);
      // Fade from ~0.28 at overlapping to ~0 at the edge of coupling.
      const t = 1 - Math.min(1, dist / minR);
      const alpha = 0.05 + 0.25 * t;
      // Phase-match modulates the thread warmth slightly.
      const match = (1 + Math.cos(a.phase - b.phase)) / 2;
      ctx.strokeStyle =
        THREAD_COLOR + (alpha * (0.35 + 0.65 * match)).toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawFireflies(ctx: CanvasRenderingContext2D, flies: Firefly[]): void {
  ctx.save();
  for (const f of flies) {
    // Brightness follows the phase: peak at θ=0, trough at θ=π.
    const b = (1 + Math.sin(f.phase)) / 2; // [0,1]
    // Avoid pure-zero: even "dark" fireflies have a dim ember so the player
    // can still locate them to tap.
    const brightness = 0.18 + 0.82 * b;
    const coreRadius = 2.4 + 2.6 * brightness;
    const glowRadius = 14 + 34 * brightness;

    // Outer glow
    const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glowRadius);
    grad.addColorStop(0, GLOW_INNER);
    grad.addColorStop(0.35, GLOW_MID);
    grad.addColorStop(1, GLOW_OUTER);
    ctx.globalAlpha = 0.45 + 0.55 * brightness;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(f.x, f.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Hot core
    ctx.globalAlpha = 0.85 * brightness + 0.15;
    ctx.fillStyle = '#fff8d8';
    ctx.beginPath();
    ctx.arc(f.x, f.y, coreRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  state: RenderState,
): void {
  ctx.save();
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.textBaseline = 'top';

  // Top-left: scene name + hint
  ctx.fillStyle = 'rgba(255, 240, 210, 0.9)';
  ctx.fillText(
    `${state.sceneIndex + 1} / ${state.sceneTotal}  ·  ${state.sceneName}`,
    18,
    16,
  );
  ctx.font = '400 13px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 230, 190, 0.55)';
  ctx.fillText(state.hint, 18, 38);

  // Top-right: sync bar + budget
  const barW = 200;
  const barH = 8;
  const barX = w - barW - 18;
  const barY = 20;
  ctx.font = '600 12px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 240, 210, 0.65)';
  ctx.fillText('sync', barX, barY - 16);
  // Bar bg
  ctx.fillStyle = 'rgba(255, 240, 210, 0.08)';
  ctx.fillRect(barX, barY, barW, barH);
  // Bar fill
  const fillW = Math.max(0, Math.min(1, state.syncScore)) * barW;
  const hue = 38 + state.syncScore * 12;
  ctx.fillStyle = `hsla(${hue}, 90%, 65%, 0.85)`;
  ctx.fillRect(barX, barY, fillW, barH);
  // Threshold tick at 0.95
  ctx.fillStyle = 'rgba(255, 240, 210, 0.45)';
  ctx.fillRect(barX + barW * 0.95 - 0.5, barY - 2, 1, barH + 4);

  // Solve-hold progress under the bar
  if (state.solveProgress > 0 && !state.solved) {
    ctx.fillStyle = 'rgba(255, 240, 210, 0.08)';
    ctx.fillRect(barX, barY + barH + 4, barW, 3);
    ctx.fillStyle = 'rgba(255, 220, 140, 0.85)';
    ctx.fillRect(barX, barY + barH + 4, barW * state.solveProgress, 3);
  }

  // Budget
  const budgetText = `taps: ${Math.max(0, state.tapBudget - state.tapsUsed)} / ${state.tapBudget}`;
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 240, 210, 0.85)';
  const budgetMetrics = ctx.measureText(budgetText);
  ctx.fillText(budgetText, w - budgetMetrics.width - 18, barY + barH + 14);

  ctx.restore();
}

function drawSuccessOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '700 42px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 240, 200, 0.95)';
  ctx.fillText('synchronized', w / 2, h / 2 - 18);

  ctx.font = '500 16px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 240, 200, 0.7)';
  ctx.fillText('press N for next scene', w / 2, h / 2 + 24);
  ctx.restore();
}
