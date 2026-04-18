import { render } from './render';
import { loadScene, sceneCount } from './scenes';
import { Sim } from './sim';
import type { Scene } from './types';

const CANVAS_W = 900;
const CANVAS_H = 600;
// Generous tap radius — forgiving, since fireflies get dim at phase troughs.
const TAP_RADIUS = 42;
// R must stay above this for SOLVE_HOLD_SECONDS to count as solved.
const SOLVE_THRESHOLD = 0.95;
const SOLVE_HOLD_SECONDS = 2;

interface GameState {
  sceneIndex: number;
  scene: Scene;
  sim: Sim;
  tapsUsed: number;
  solved: boolean;
  solveTimer: number; // seconds the sync score has been above threshold
}

const state: GameState = initScene(0);

function initScene(index: number): GameState {
  const scene = loadScene(index);
  return {
    sceneIndex: index,
    scene,
    sim: new Sim(scene.fireflies, scene.couplingK),
    tapsUsed: 0,
    solved: false,
    solveTimer: 0,
  };
}

function reloadScene(index: number): void {
  const fresh = initScene(index);
  state.sceneIndex = fresh.sceneIndex;
  state.scene = fresh.scene;
  state.sim = fresh.sim;
  state.tapsUsed = 0;
  state.solved = false;
  state.solveTimer = 0;
}

function nextScene(): void {
  reloadScene((state.sceneIndex + 1) % sceneCount());
}

function canvas(): HTMLCanvasElement {
  const el = document.getElementById(
    'phase-chorus',
  ) as HTMLCanvasElement | null;
  if (!el) throw new Error('canvas #phase-chorus missing from DOM');
  return el;
}

function mountInput(cvs: HTMLCanvasElement): void {
  cvs.addEventListener('pointerdown', (ev) => {
    if (state.solved) return;
    if (state.tapsUsed >= state.scene.tapBudget) return;
    const rect = cvs.getBoundingClientRect();
    // Canvas may be scaled by CSS; map CSS px → canvas px.
    const sx = cvs.width / rect.width;
    const sy = cvs.height / rect.height;
    const x = (ev.clientX - rect.left) * sx;
    const y = (ev.clientY - rect.top) * sy;

    const idx = nearestFireflyWithin(x, y, TAP_RADIUS);
    if (idx !== -1) {
      state.sim.tapFirefly(idx);
      state.tapsUsed++;
    }
  });

  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'r' || ev.key === 'R') {
      reloadScene(state.sceneIndex);
    } else if (ev.key === 'n' || ev.key === 'N') {
      nextScene();
    }
  });

  const resetBtn = document.getElementById('btn-reset');
  const nextBtn = document.getElementById('btn-next');
  const helpBtn = document.getElementById('btn-help-close');
  const help = document.getElementById('howto');
  resetBtn?.addEventListener('click', () => reloadScene(state.sceneIndex));
  nextBtn?.addEventListener('click', () => nextScene());
  helpBtn?.addEventListener('click', () => {
    help?.classList.add('hidden');
  });
}

function nearestFireflyWithin(x: number, y: number, maxDist: number): number {
  let bestIdx = -1;
  let bestDist = maxDist;
  const flies = state.sim.fireflies;
  for (let i = 0; i < flies.length; i++) {
    const f = flies[i];
    const dx = f.x - x;
    const dy = f.y - y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d <= bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function mountLoop(cvs: HTMLCanvasElement): void {
  const ctx = cvs.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');

  let lastTs = performance.now();
  const frame = (ts: number) => {
    const dt = Math.max(0, (ts - lastTs) / 1000);
    lastTs = ts;

    state.sim.step(dt);
    const score = state.sim.syncScore();

    if (!state.solved) {
      if (score >= SOLVE_THRESHOLD) {
        state.solveTimer += dt;
        if (state.solveTimer >= SOLVE_HOLD_SECONDS) {
          state.solved = true;
        }
      } else {
        // Decay a little slower than it builds so tiny dips don't reset progress.
        state.solveTimer = Math.max(0, state.solveTimer - dt * 0.5);
      }
    }

    render(ctx, CANVAS_W, CANVAS_H, {
      fireflies: state.sim.fireflies,
      syncScore: score,
      sceneName: state.scene.name,
      sceneIndex: state.sceneIndex,
      sceneTotal: sceneCount(),
      hint: state.scene.hint,
      tapBudget: state.scene.tapBudget,
      tapsUsed: state.tapsUsed,
      solved: state.solved,
      solveProgress: Math.min(1, state.solveTimer / SOLVE_HOLD_SECONDS),
    });

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function boot(): void {
  const cvs = canvas();
  cvs.width = CANVAS_W;
  cvs.height = CANVAS_H;
  mountInput(cvs);
  mountLoop(cvs);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
