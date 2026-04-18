import type { Firefly, Scene } from './types';

/**
 * Three hand-designed scenarios. Each is a blueprint — `loadScene` returns a deep
 * clone so the player can Reset without leaking state back into the blueprint.
 *
 * Coordinates assume a 900x600 canvas (see index.html).
 *
 * Design intent:
 *   - "First Light" trains the player that a single tap can cascade through coupled
 *     neighbors. All 4 fireflies share one coupling graph (bridged by a middle pair),
 *     so one well-placed tap will pull the others in.
 *   - "The Straggler" adds a frequency outlier: the group syncs easily, but the
 *     outlier keeps drifting away. Budget of 2 lets the player re-snap it once
 *     after the initial sync.
 *   - "Meadow" is 8 scattered with varied frequencies across a few coupling islands;
 *     the player needs to nudge the right firefly at the right time to fold the
 *     islands together.
 *
 * Natural frequencies are in radians/sec (so 2.5 ≈ one blink cycle every ~2.5s).
 */

function ff(
  x: number,
  y: number,
  phase: number,
  naturalFreq: number,
  couplingRadius: number,
): Firefly {
  return { x, y, phase, naturalFreq, couplingRadius };
}

const scenes: Scene[] = [
  {
    name: 'First Light',
    hint: 'One tap. Sync everybody.',
    couplingK: 3.0,
    tapBudget: 1,
    fireflies: [
      // Left pair
      ff(260, 300, 0.2, 2.4, 170),
      ff(380, 320, 3.1, 2.5, 170),
      // Right pair — bridged to the left pair by the inner members' radii
      ff(520, 280, 5.0, 2.6, 170),
      ff(640, 310, 1.8, 2.5, 170),
    ],
  },
  {
    name: 'The Straggler',
    hint: 'The outlier keeps pulling the others apart.',
    couplingK: 2.6,
    tapBudget: 2,
    fireflies: [
      // Loose cluster of 5 with similar frequencies
      ff(360, 260, 0.0, 2.5, 150),
      ff(460, 250, 1.4, 2.55, 150),
      ff(540, 300, 2.8, 2.45, 150),
      ff(480, 360, 4.1, 2.5, 150),
      ff(390, 340, 5.3, 2.55, 150),
      // Outlier — different natural frequency, sits on the fringe of coupling
      ff(690, 300, 3.0, 3.6, 160),
    ],
  },
  {
    name: 'Meadow',
    hint: 'Get them all on the same beat.',
    couplingK: 2.8,
    tapBudget: 3,
    fireflies: [
      // Island A (top-left)
      ff(210, 180, 0.4, 2.4, 150),
      ff(320, 220, 2.7, 2.5, 150),
      // Island B (top-right)
      ff(620, 180, 4.1, 2.6, 150),
      ff(730, 240, 1.1, 2.5, 150),
      // Bridge fireflies in the middle — wider radius to tie the islands
      ff(450, 330, 5.5, 2.5, 200),
      ff(560, 360, 3.2, 2.55, 200),
      // Island C (bottom)
      ff(300, 470, 0.8, 2.45, 160),
      ff(660, 480, 2.0, 2.6, 160),
    ],
  },
];

/** Deep-clone a scene so in-game state can't mutate the blueprint. */
export function loadScene(index: number): Scene {
  const src = scenes[((index % scenes.length) + scenes.length) % scenes.length];
  return {
    name: src.name,
    hint: src.hint,
    couplingK: src.couplingK,
    tapBudget: src.tapBudget,
    fireflies: src.fireflies.map((f) => ({ ...f })),
  };
}

export function sceneCount(): number {
  return scenes.length;
}
