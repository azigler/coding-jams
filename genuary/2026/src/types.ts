/**
 * Shared types for Genuary 2026 projects
 */

export interface DayConfig {
  day: number;
  prompt: string;
  creditName: string;
  creditUrl: string;
  recording?: {
    enabled: boolean;
    duration: number; // seconds
    filename: string;
  };
  setup?: (p: p5) => void;
  draw?: (p: p5) => void;
  renderFinal?: (p: p5) => void; // Render final/complete state for static image
  windowResized?: (p: p5) => void;
  mousePressed?: (p: p5) => void;
  keyPressed?: (p: p5) => void;
}

export interface DayModule {
  default: DayConfig;
}
