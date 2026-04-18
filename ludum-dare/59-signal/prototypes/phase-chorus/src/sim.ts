import type { Firefly } from './types';

const TWO_PI = Math.PI * 2;
// Fixed inner step for Kuramoto stability: 120 Hz regardless of render rate.
const FIXED_DT = 1 / 120;
// Never drain more than this much clock per frame (prevents spiral-of-death after a tab pause).
const MAX_FRAME_DT = 0.25;

/**
 * Phase Chorus sim — a Kuramoto model of coupled oscillators rendered as fireflies.
 *
 * Each firefly has a natural frequency and a phase on the unit circle. Two fireflies
 * couple if their Euclidean distance is within BOTH of their coupling radii (symmetric
 * overlap rule — this matches the render's thread-drawing rule so visuals read true).
 *
 * Update rule:
 *   dθ_i/dt = naturalFreq_i + (K / N_i) * Σ_j sin(θ_j - θ_i)
 * where the sum runs over coupled neighbors j of i, and N_i is that neighbor count
 * (so the mean-field pull is bounded regardless of cluster size).
 */
export class Sim {
  readonly fireflies: Firefly[];
  readonly couplingK: number;
  private accumulator = 0;

  constructor(fireflies: Firefly[], couplingK: number) {
    this.fireflies = fireflies;
    this.couplingK = couplingK;
  }

  /** Accumulate real time and step the sim at a fixed rate for stability. */
  step(dt: number): void {
    const clamped = Math.min(dt, MAX_FRAME_DT);
    this.accumulator += clamped;
    // Don't let the accumulator runaway either.
    if (this.accumulator > MAX_FRAME_DT) this.accumulator = MAX_FRAME_DT;

    while (this.accumulator >= FIXED_DT) {
      this.integrate(FIXED_DT);
      this.accumulator -= FIXED_DT;
    }
  }

  private integrate(dt: number): void {
    const flies = this.fireflies;
    const n = flies.length;
    // Compute all dθ/dt first using the CURRENT phases, then apply — prevents
    // order-of-update bias that would otherwise bake a direction into the cluster.
    const deltas = new Array<number>(n);

    for (let i = 0; i < n; i++) {
      const a = flies[i];
      let sum = 0;
      let count = 0;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const b = flies[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Symmetric coupling rule: both must reach each other.
        if (dist <= a.couplingRadius && dist <= b.couplingRadius) {
          sum += Math.sin(b.phase - a.phase);
          count++;
        }
      }
      const mean = count > 0 ? sum / count : 0;
      deltas[i] = a.naturalFreq + this.couplingK * mean;
    }

    for (let i = 0; i < n; i++) {
      const f = flies[i];
      f.phase = wrapPhase(f.phase + deltas[i] * dt);
    }
  }

  /** Player action: snap a firefly to phase 0 (peak brightness). */
  tapFirefly(index: number): void {
    const f = this.fireflies[index];
    if (!f) return;
    f.phase = 0;
  }

  /**
   * Kuramoto order parameter R = |(1/N) * Σ e^(iθ_i)| in [0, 1].
   * R near 1 means phases cluster tightly (synced); R near 0 means incoherent.
   */
  syncScore(): number {
    const flies = this.fireflies;
    const n = flies.length;
    if (n === 0) return 0;
    let sumCos = 0;
    let sumSin = 0;
    for (let i = 0; i < n; i++) {
      sumCos += Math.cos(flies[i].phase);
      sumSin += Math.sin(flies[i].phase);
    }
    const r = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / n;
    return r;
  }
}

export function wrapPhase(theta: number): number {
  // Modulo that handles negatives cleanly.
  let t = theta % TWO_PI;
  if (t < 0) t += TWO_PI;
  return t;
}

/** Same symmetric coupling test used by the integrator; exported for the renderer. */
export function areCoupled(a: Firefly, b: Firefly): number | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= a.couplingRadius && dist <= b.couplingRadius) return dist;
  return null;
}
