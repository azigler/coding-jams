/**
 * Unit tests for the Tour System
 *
 * Tests tour creation, start/stop behavior, and update progression.
 * Mocks Three.js and DOM dependencies to run without WebGL.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================================================
// Mocks - Must be hoisted (no references to variables defined later)
// ============================================================================

// Mock Three.js with inline class definitions
vi.mock('three', () => {
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

    lerp(v: Vector3, t: number): Vector3 {
      this.x += (v.x - this.x) * t;
      this.y += (v.y - this.y) * t;
      this.z += (v.z - this.z) * t;
      return this;
    }

    lerpVectors(v1: Vector3, v2: Vector3, t: number): Vector3 {
      this.x = v1.x + (v2.x - v1.x) * t;
      this.y = v1.y + (v2.y - v1.y) * t;
      this.z = v1.z + (v2.z - v1.z) * t;
      return this;
    }
  }

  class Euler {
    x = 0;
    y = 0;
    z = 0;

    setFromQuaternion(): Euler {
      return this;
    }
  }

  class Quaternion {
    x = 0;
    y = 0;
    z = 0;
    w = 1;
  }

  return { Vector3, Euler, Quaternion };
});

// Mock DOM APIs
const mockDocumentBody = {
  appendChild: vi.fn(),
};

const mockExistingElement = {
  remove: vi.fn(),
};

vi.stubGlobal('document', {
  createElement: vi.fn(() => ({
    id: '',
    innerHTML: '',
    style: {},
  })),
  body: mockDocumentBody,
  getElementById: vi.fn((id: string) => {
    if (id === 'tour-indicator') return mockExistingElement;
    return null;
  }),
});

// ============================================================================
// Import after mocks
// ============================================================================

import {
  createTourSystem,
  startTour,
  stopTour,
  toggleTour,
  updateTour,
  disposeTour,
  type TourSystem,
} from '../tour';
import type { Navigation } from '../navigation';
import type { InteractionSystem } from '../interaction';
import * as THREE from 'three';

// ============================================================================
// Test Helpers
// ============================================================================

function createMockNavigation(): Navigation {
  return {
    camera: {
      position: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      lookAt: vi.fn(),
    } as unknown as Navigation['camera'],
    element: {} as HTMLElement,
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    isLooking: false,
    euler: new THREE.Euler() as unknown as Navigation['euler'],
    velocity: new THREE.Vector3() as unknown as Navigation['velocity'],
    collisionBoxes: [],
    footstepTimer: 0,
    cleanup: vi.fn(),
  };
}

function createMockInteraction(): InteractionSystem {
  return {
    camera: {
      position: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      lookAt: vi.fn(),
    } as unknown as InteractionSystem['camera'],
    scene: {} as InteractionSystem['scene'],
    element: {} as HTMLElement,
    raycaster: {} as InteractionSystem['raycaster'],
    mouse: {} as InteractionSystem['mouse'],
    exhibitMeshes: [],
    isZoomed: false,
    zoomTarget: new THREE.Vector3() as unknown as InteractionSystem['zoomTarget'],
    zoomLookAt: new THREE.Vector3() as unknown as InteractionSystem['zoomLookAt'],
    originalPosition: new THREE.Vector3() as unknown as InteractionSystem['originalPosition'],
    originalQuaternion: {} as InteractionSystem['originalQuaternion'],
    zoomProgress: 0,
    animating: false,
    hoveredExhibit: null,
    currentExhibitIndex: -1,
    cleanup: vi.fn(),
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('Tour System', () => {
  let navigation: Navigation;
  let interaction: InteractionSystem;
  let tour: TourSystem;

  beforeEach(() => {
    vi.clearAllMocks();
    navigation = createMockNavigation();
    interaction = createMockInteraction();
    tour = createTourSystem(navigation, interaction);
  });

  describe('createTourSystem', () => {
    it('should create a tour system with correct initial state', () => {
      expect(tour.isActive).toBe(false);
      expect(tour.currentStop).toBe(0);
      expect(tour.transitionProgress).toBe(0);
      expect(tour.waitTime).toBe(0);
      expect(tour.navigation).toBe(navigation);
      expect(tour.interaction).toBe(interaction);
    });

    it('should initialize with tour stops', () => {
      expect(tour.tourStops).toBeDefined();
      expect(tour.tourStops.length).toBeGreaterThan(0);
    });

    it('should have valid tour stop structure', () => {
      for (const stop of tour.tourStops) {
        expect(stop).toHaveProperty('position');
        expect(stop).toHaveProperty('lookAt');
        expect(stop).toHaveProperty('duration');
        expect(stop).toHaveProperty('name');
        expect(typeof stop.duration).toBe('number');
        expect(typeof stop.name).toBe('string');
      }
    });

    it('should have onTourEnd initially undefined', () => {
      expect(tour.onTourEnd).toBeUndefined();
    });
  });

  describe('startTour', () => {
    it('should activate the tour', () => {
      startTour(tour);
      expect(tour.isActive).toBe(true);
    });

    it('should reset tour state on start', () => {
      tour.currentStop = 5;
      tour.transitionProgress = 0.5;
      tour.waitTime = 2;

      startTour(tour);

      expect(tour.currentStop).toBe(0);
      expect(tour.transitionProgress).toBe(0);
      expect(tour.waitTime).toBe(0);
    });

    it('should not restart if already active', () => {
      startTour(tour);
      tour.currentStop = 3;

      startTour(tour);

      // Should not reset since already active
      expect(tour.currentStop).toBe(3);
    });

    it('should show tour indicator in DOM', () => {
      startTour(tour);
      expect(mockDocumentBody.appendChild).toHaveBeenCalled();
    });
  });

  describe('stopTour', () => {
    it('should deactivate the tour', () => {
      startTour(tour);
      expect(tour.isActive).toBe(true);

      stopTour(tour);
      expect(tour.isActive).toBe(false);
    });

    it('should do nothing if tour is not active', () => {
      const onTourEnd = vi.fn();
      tour.onTourEnd = onTourEnd;

      stopTour(tour);

      expect(onTourEnd).not.toHaveBeenCalled();
    });

    it('should call onTourEnd callback when stopping', () => {
      const onTourEnd = vi.fn();
      tour.onTourEnd = onTourEnd;

      startTour(tour);
      stopTour(tour);

      expect(onTourEnd).toHaveBeenCalledTimes(1);
    });

    it('should remove tour indicator from DOM', () => {
      startTour(tour);
      stopTour(tour);

      // getElementById should be called to find and remove the indicator
      expect(document.getElementById).toHaveBeenCalledWith('tour-indicator');
    });
  });

  describe('toggleTour', () => {
    it('should start tour if inactive', () => {
      expect(tour.isActive).toBe(false);
      toggleTour(tour);
      expect(tour.isActive).toBe(true);
    });

    it('should stop tour if active', () => {
      startTour(tour);
      expect(tour.isActive).toBe(true);
      toggleTour(tour);
      expect(tour.isActive).toBe(false);
    });
  });

  describe('updateTour', () => {
    it('should return false if tour is not active', () => {
      const result = updateTour(tour, 0.016);
      expect(result).toBe(false);
    });

    it('should return true if tour is active', () => {
      startTour(tour);
      const result = updateTour(tour, 0.016);
      expect(result).toBe(true);
    });

    it('should increase transition progress over time', () => {
      startTour(tour);
      const initialProgress = tour.transitionProgress;

      updateTour(tour, 0.5);

      expect(tour.transitionProgress).toBeGreaterThan(initialProgress);
    });

    it('should clamp transition progress to maximum of 1', () => {
      startTour(tour);

      // Simulate many updates
      for (let i = 0; i < 100; i++) {
        updateTour(tour, 0.1);
      }

      expect(tour.transitionProgress).toBeLessThanOrEqual(1);
    });

    it('should accumulate wait time when transition is complete', () => {
      startTour(tour);

      // Complete the transition
      tour.transitionProgress = 1;
      const initialWaitTime = tour.waitTime;

      updateTour(tour, 0.5);

      expect(tour.waitTime).toBeGreaterThan(initialWaitTime);
    });

    it('should advance to next stop when wait time exceeds duration', () => {
      startTour(tour);
      tour.transitionProgress = 1;

      const currentStop = tour.tourStops[tour.currentStop];
      const initialStopIndex = tour.currentStop;

      // Wait longer than the stop duration
      updateTour(tour, currentStop.duration + 1);

      expect(tour.currentStop).toBe(initialStopIndex + 1);
      expect(tour.transitionProgress).toBe(0);
      expect(tour.waitTime).toBe(0);
    });

    it('should stop tour when reaching the last stop', () => {
      startTour(tour);

      // Move to last stop
      tour.currentStop = tour.tourStops.length - 1;
      tour.transitionProgress = 1;

      const lastStopDuration = tour.tourStops[tour.currentStop].duration;
      updateTour(tour, lastStopDuration + 1);

      expect(tour.isActive).toBe(false);
    });
  });

  describe('disposeTour', () => {
    it('should stop an active tour', () => {
      startTour(tour);
      expect(tour.isActive).toBe(true);

      disposeTour(tour);
      expect(tour.isActive).toBe(false);
    });

    it('should be safe to call on inactive tour', () => {
      expect(() => disposeTour(tour)).not.toThrow();
    });
  });

  describe('Tour stops configuration', () => {
    it('should have Entrance as first stop', () => {
      expect(tour.tourStops[0].name).toBe('Entrance');
    });

    it('should include key locations', () => {
      const stopNames = tour.tourStops.map(s => s.name);

      expect(stopNames).toContain('Gallery Center');
      expect(stopNames).toContain('North Wing');
      expect(stopNames).toContain('West Wing');
      expect(stopNames).toContain('East Wing');
    });

    it('should end with Tour Complete', () => {
      const lastStop = tour.tourStops[tour.tourStops.length - 1];
      expect(lastStop.name).toBe('Tour Complete');
    });

    it('should have positive durations for all stops', () => {
      for (const stop of tour.tourStops) {
        expect(stop.duration).toBeGreaterThan(0);
      }
    });
  });
});
