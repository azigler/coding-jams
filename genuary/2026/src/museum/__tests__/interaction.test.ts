/**
 * Unit tests for the Interaction System
 *
 * Tests exhibit registration, sorting, and core interaction logic.
 * Mocks Three.js and DOM/Audio dependencies.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================================================
// Mocks - Must be hoisted (no references to variables defined later)
// ============================================================================

// Mock Three.js with inline class definitions
vi.mock('three', () => {
  class Vector2 {
    x = 0;
    y = 0;
  }

  class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }

    copy(v: Vector3): Vector3 {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;
    }

    clone(): Vector3 {
      return new Vector3(this.x, this.y, this.z);
    }

    add(v: Vector3): Vector3 {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;
    }

    addScaledVector(v: Vector3, s: number): Vector3 {
      this.x += v.x * s;
      this.y += v.y * s;
      this.z += v.z * s;
      return this;
    }

    applyQuaternion(): Vector3 {
      return this;
    }

    lerp(v: Vector3, t: number): Vector3 {
      this.x += (v.x - this.x) * t;
      this.y += (v.y - this.y) * t;
      this.z += (v.z - this.z) * t;
      return this;
    }

    distanceTo(v: Vector3): number {
      const dx = this.x - v.x;
      const dy = this.y - v.y;
      const dz = this.z - v.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
  }

  class Quaternion {
    copy(): Quaternion {
      return this;
    }
  }

  class Raycaster {
    setFromCamera = vi.fn ? vi.fn() : () => {};
    intersectObjects = vi.fn ? vi.fn(() => []) : () => [];
  }

  class Mesh {
    userData: Record<string, unknown> = {};

    getWorldPosition(target: Vector3): Vector3 {
      return target;
    }

    getWorldQuaternion(): unknown {
      return {};
    }
  }

  class Scene {}

  return {
    Vector2,
    Vector3,
    Quaternion,
    Raycaster,
    Mesh,
    Scene,
  };
});

// Mock AudioContext
vi.stubGlobal('AudioContext', class MockAudioContext {
  currentTime = 0;
  destination = {};

  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }

  createGain() {
    return {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
  }
});

// Mock performance
vi.stubGlobal('performance', {
  now: vi.fn(() => Date.now()),
});

// Mock DOM - define inline to avoid hoisting issues
const mockIndicatorElement = { remove: vi.fn() };

vi.stubGlobal('document', {
  createElement: vi.fn(() => ({
    id: '',
    innerHTML: '',
    style: { cssText: '' },
  })),
  body: {
    appendChild: vi.fn(),
  },
  head: {
    appendChild: vi.fn(),
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  getElementById: vi.fn((id: string) => {
    if (id === 'zoom-indicator' || id === 'zoom-vignette') {
      return mockIndicatorElement;
    }
    return null;
  }),
});

// ============================================================================
// Import after mocks
// ============================================================================

import {
  createInteraction,
  registerExhibit,
  registerExhibits,
  sortExhibitsByDay,
  updateInteraction,
  disposeInteraction,
  type InteractionSystem,
} from '../interaction';
import type { ExhibitFrame } from '../exhibits/frame';
import * as THREE from 'three';

// ============================================================================
// Test Helpers
// ============================================================================

function createMockElement(): HTMLElement {
  return {
    style: { cursor: '' },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
    })),
    closest: vi.fn(() => null),
  } as unknown as HTMLElement;
}

function createMockCamera(): InteractionSystem['camera'] {
  return {
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    lookAt: vi.fn(),
    getWorldDirection: vi.fn((target: THREE.Vector3) => {
      target.x = 0;
      target.y = 0;
      target.z = -1;
      return target;
    }),
  } as unknown as InteractionSystem['camera'];
}

function createMockExhibitFrame(dayNumber: number): ExhibitFrame {
  const mesh = new THREE.Mesh();
  return {
    group: {} as ExhibitFrame['group'],
    mesh: mesh as unknown as ExhibitFrame['mesh'],
    material: {} as ExhibitFrame['material'],
    frameMesh: {} as ExhibitFrame['frameMesh'],
    dayNumber,
    width: 1.6,
    height: 1.0,
    texture: null,
    label: null,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('Interaction System', () => {
  let interaction: InteractionSystem;
  let mockCamera: InteractionSystem['camera'];
  let mockScene: InteractionSystem['scene'];
  let mockElement: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCamera = createMockCamera();
    mockScene = {} as InteractionSystem['scene'];
    mockElement = createMockElement();
    interaction = createInteraction(mockCamera, mockScene, mockElement);
  });

  describe('createInteraction', () => {
    it('should create an interaction system with correct initial state', () => {
      expect(interaction.camera).toBe(mockCamera);
      expect(interaction.scene).toBe(mockScene);
      expect(interaction.element).toBe(mockElement);
      expect(interaction.isZoomed).toBe(false);
      expect(interaction.animating).toBe(false);
      expect(interaction.hoveredExhibit).toBeNull();
      expect(interaction.currentExhibitIndex).toBe(-1);
    });

    it('should initialize with empty exhibit meshes array', () => {
      expect(interaction.exhibitMeshes).toEqual([]);
    });

    it('should register event listeners', () => {
      expect(mockElement.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(mockElement.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should set initial cursor style', () => {
      expect(mockElement.style.cursor).toBe('grab');
    });

    it('should provide a cleanup function', () => {
      expect(typeof interaction.cleanup).toBe('function');
    });
  });

  describe('registerExhibit', () => {
    it('should add exhibit mesh to exhibitMeshes array', () => {
      const frame = createMockExhibitFrame(7);
      registerExhibit(interaction, frame);

      expect(interaction.exhibitMeshes).toHaveLength(1);
    });

    it('should store day number in mesh userData', () => {
      const frame = createMockExhibitFrame(7);
      registerExhibit(interaction, frame);

      expect(interaction.exhibitMeshes[0].userData.dayNumber).toBe(7);
    });

    it('should store exhibit frame reference in mesh userData', () => {
      const frame = createMockExhibitFrame(7);
      registerExhibit(interaction, frame);

      expect(interaction.exhibitMeshes[0].userData.exhibitFrame).toBe(frame);
    });

    it('should handle frames without mesh gracefully', () => {
      const frame = createMockExhibitFrame(7);
      (frame as { mesh: null }).mesh = null;

      expect(() => registerExhibit(interaction, frame)).not.toThrow();
      expect(interaction.exhibitMeshes).toHaveLength(0);
    });
  });

  describe('registerExhibits', () => {
    it('should register multiple exhibits', () => {
      const frames = [
        createMockExhibitFrame(1),
        createMockExhibitFrame(7),
        createMockExhibitFrame(12),
      ];

      registerExhibits(interaction, frames);

      expect(interaction.exhibitMeshes).toHaveLength(3);
    });

    it('should register exhibits in order', () => {
      const frames = [
        createMockExhibitFrame(5),
        createMockExhibitFrame(10),
        createMockExhibitFrame(15),
      ];

      registerExhibits(interaction, frames);

      expect(interaction.exhibitMeshes[0].userData.dayNumber).toBe(5);
      expect(interaction.exhibitMeshes[1].userData.dayNumber).toBe(10);
      expect(interaction.exhibitMeshes[2].userData.dayNumber).toBe(15);
    });

    it('should handle empty array', () => {
      registerExhibits(interaction, []);
      expect(interaction.exhibitMeshes).toHaveLength(0);
    });
  });

  describe('sortExhibitsByDay', () => {
    it('should sort exhibits by day number ascending', () => {
      const frames = [
        createMockExhibitFrame(15),
        createMockExhibitFrame(3),
        createMockExhibitFrame(27),
        createMockExhibitFrame(1),
      ];

      registerExhibits(interaction, frames);
      sortExhibitsByDay(interaction);

      expect(interaction.exhibitMeshes[0].userData.dayNumber).toBe(1);
      expect(interaction.exhibitMeshes[1].userData.dayNumber).toBe(3);
      expect(interaction.exhibitMeshes[2].userData.dayNumber).toBe(15);
      expect(interaction.exhibitMeshes[3].userData.dayNumber).toBe(27);
    });

    it('should handle exhibits without day number', () => {
      const frame1 = createMockExhibitFrame(5);
      const frame2 = createMockExhibitFrame(2);

      registerExhibit(interaction, frame1);
      registerExhibit(interaction, frame2);

      // Manually remove day number from one
      delete interaction.exhibitMeshes[0].userData.dayNumber;

      sortExhibitsByDay(interaction);

      // Exhibit without day number should sort to end (999)
      expect(interaction.exhibitMeshes[0].userData.dayNumber).toBe(2);
    });

    it('should handle empty array', () => {
      expect(() => sortExhibitsByDay(interaction)).not.toThrow();
    });

    it('should handle single exhibit', () => {
      const frame = createMockExhibitFrame(7);
      registerExhibit(interaction, frame);
      sortExhibitsByDay(interaction);

      expect(interaction.exhibitMeshes).toHaveLength(1);
      expect(interaction.exhibitMeshes[0].userData.dayNumber).toBe(7);
    });
  });

  describe('updateInteraction', () => {
    it('should return false when not animating', () => {
      interaction.animating = false;
      const result = updateInteraction(interaction, 0.016);
      expect(result).toBe(false);
    });

    it('should return true when animating', () => {
      interaction.animating = true;
      interaction.isZoomed = true;
      const result = updateInteraction(interaction, 0.016);
      expect(result).toBe(true);
    });

    it('should increase zoom progress during animation', () => {
      interaction.animating = true;
      interaction.isZoomed = true;
      interaction.zoomProgress = 0;

      updateInteraction(interaction, 0.5);

      expect(interaction.zoomProgress).toBeGreaterThan(0);
    });

    it('should stop animating when camera reaches target', () => {
      interaction.animating = true;
      interaction.isZoomed = true;

      // Set camera position very close to target
      const targetPos = new THREE.Vector3(5, 1.6, -10);
      interaction.zoomTarget = targetPos as unknown as InteractionSystem['zoomTarget'];
      (interaction.camera.position as THREE.Vector3).x = 5;
      (interaction.camera.position as THREE.Vector3).y = 1.6;
      (interaction.camera.position as THREE.Vector3).z = -10;

      updateInteraction(interaction, 0.016);

      expect(interaction.animating).toBe(false);
    });
  });

  describe('disposeInteraction', () => {
    it('should call cleanup function', () => {
      const cleanupSpy = vi.fn();
      interaction.cleanup = cleanupSpy;

      disposeInteraction(interaction);

      expect(cleanupSpy).toHaveBeenCalledTimes(1);
    });

    it('should clear exhibit meshes array', () => {
      const frames = [
        createMockExhibitFrame(1),
        createMockExhibitFrame(7),
      ];
      registerExhibits(interaction, frames);

      expect(interaction.exhibitMeshes).toHaveLength(2);

      disposeInteraction(interaction);

      expect(interaction.exhibitMeshes).toHaveLength(0);
    });

    it('should remove DOM elements', () => {
      disposeInteraction(interaction);

      expect(document.getElementById).toHaveBeenCalledWith('zoom-indicator');
    });
  });

  describe('Zoom state management', () => {
    it('should initialize with zoom progress at 0', () => {
      expect(interaction.zoomProgress).toBe(0);
    });

    it('should preserve original position when set', () => {
      const originalPos = new THREE.Vector3(1, 2, 3);
      (interaction.originalPosition as THREE.Vector3).x = 1;
      (interaction.originalPosition as THREE.Vector3).y = 2;
      (interaction.originalPosition as THREE.Vector3).z = 3;

      expect((interaction.originalPosition as THREE.Vector3).x).toBe(1);
      expect((interaction.originalPosition as THREE.Vector3).y).toBe(2);
      expect((interaction.originalPosition as THREE.Vector3).z).toBe(3);
    });
  });
});
