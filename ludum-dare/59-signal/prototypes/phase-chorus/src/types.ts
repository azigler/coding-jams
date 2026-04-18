export interface Firefly {
  x: number;
  y: number;
  phase: number;
  naturalFreq: number;
  couplingRadius: number;
}

export interface Scene {
  name: string;
  hint: string;
  couplingK: number;
  tapBudget: number;
  fireflies: Firefly[];
}
