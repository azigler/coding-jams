/**
 * Global type declaration for p5 instance type
 * This allows day files to use 'p5' as a type without importing it
 */
import type p5Instance from 'p5';

declare global {
  type p5 = p5Instance;
}

export {};
