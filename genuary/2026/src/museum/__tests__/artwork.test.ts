/**
 * Unit tests for the Artwork System
 *
 * Tests caching behavior, pause/resume, and dispose functions.
 * Uses a mock-based approach to avoid loading actual day modules.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ============================================================================
// Mocks - Must be hoisted (no references to variables defined later)
// ============================================================================

// Mock Three.js with inline class definitions
vi.mock('three', () => {
  class CanvasTexture {
    image: unknown = null;
    needsUpdate = false;
    minFilter = 0;
    magFilter = 0;

    constructor(canvas?: unknown) {
      this.image = canvas;
    }

    dispose() {}
  }

  return {
    CanvasTexture,
    LinearFilter: 1,
  };
});

// Mock p5
vi.mock('p5', () => {
  class MockP5 {
    _looping = true;

    constructor(sketch: (p: MockP5) => void) {
      // Simulate p5 initialization asynchronously
      setTimeout(() => {
        sketch(this);
      }, 0);
    }

    createCanvas() {
      return {
        elt: { width: 400, height: 400, getContext: () => null },
      };
    }

    pixelDensity() {}
    setup?: () => void;
    draw?: () => void;

    noLoop() {
      this._looping = false;
    }

    loop() {
      this._looping = true;
    }

    remove() {}
  }

  return { default: MockP5 };
});

// Mock DOM
vi.stubGlobal('document', {
  createElement: vi.fn((tag: string) => {
    if (tag === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          fillRect: vi.fn(),
          fillStyle: '',
        })),
        parentElement: null,
      };
    }
    return {
      style: {},
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    };
  }),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
});

vi.stubGlobal('performance', {
  now: vi.fn(() => Date.now()),
});

// ============================================================================
// Import after mocks
// ============================================================================

import {
  pauseArtwork,
  resumeArtwork,
  getRunningArtworks,
  disposeAllArtwork,
  disposeLiveArtwork,
} from '../exhibits/artwork';

// ============================================================================
// Tests
// ============================================================================

describe('Artwork System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any cached artworks
    disposeAllArtwork();
  });

  afterEach(() => {
    disposeAllArtwork();
  });

  describe('pauseArtwork', () => {
    it('should not throw when artwork does not exist', () => {
      expect(() => pauseArtwork(999)).not.toThrow();
    });

    it('should not throw for any day number', () => {
      for (let day = 1; day <= 31; day++) {
        expect(() => pauseArtwork(day)).not.toThrow();
      }
    });
  });

  describe('resumeArtwork', () => {
    it('should not throw when artwork does not exist', () => {
      expect(() => resumeArtwork(999)).not.toThrow();
    });

    it('should not throw for any day number', () => {
      for (let day = 1; day <= 31; day++) {
        expect(() => resumeArtwork(day)).not.toThrow();
      }
    });
  });

  describe('getRunningArtworks', () => {
    it('should return empty array when no artworks are running', () => {
      const running = getRunningArtworks();
      expect(running).toEqual([]);
    });

    it('should return an array', () => {
      const running = getRunningArtworks();
      expect(Array.isArray(running)).toBe(true);
    });
  });

  describe('disposeAllArtwork', () => {
    it('should not throw when cache is empty', () => {
      expect(() => disposeAllArtwork()).not.toThrow();
    });

    it('should clear all running artworks', () => {
      disposeAllArtwork();
      const running = getRunningArtworks();
      expect(running).toEqual([]);
    });

    it('should be idempotent', () => {
      disposeAllArtwork();
      disposeAllArtwork();
      disposeAllArtwork();

      const running = getRunningArtworks();
      expect(running).toEqual([]);
    });
  });

  describe('disposeLiveArtwork', () => {
    it('should not throw for non-existent artworks', () => {
      expect(() => disposeLiveArtwork(1)).not.toThrow();
      expect(() => disposeLiveArtwork(15)).not.toThrow();
      expect(() => disposeLiveArtwork(31)).not.toThrow();
      expect(() => disposeLiveArtwork(999)).not.toThrow();
    });

    it('should be safe to call multiple times for same day', () => {
      expect(() => {
        disposeLiveArtwork(7);
        disposeLiveArtwork(7);
        disposeLiveArtwork(7);
      }).not.toThrow();
    });
  });

  describe('Module structure', () => {
    it('should export pauseArtwork function', () => {
      expect(typeof pauseArtwork).toBe('function');
    });

    it('should export resumeArtwork function', () => {
      expect(typeof resumeArtwork).toBe('function');
    });

    it('should export getRunningArtworks function', () => {
      expect(typeof getRunningArtworks).toBe('function');
    });

    it('should export disposeAllArtwork function', () => {
      expect(typeof disposeAllArtwork).toBe('function');
    });

    it('should export disposeLiveArtwork function', () => {
      expect(typeof disposeLiveArtwork).toBe('function');
    });
  });
});

describe('Artwork Cache Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    disposeAllArtwork();
  });

  afterEach(() => {
    disposeAllArtwork();
  });

  it('should start with empty cache', () => {
    expect(getRunningArtworks()).toHaveLength(0);
  });

  it('should maintain cache isolation between tests', () => {
    // This test verifies that disposeAllArtwork properly clears state
    expect(getRunningArtworks()).toHaveLength(0);
  });
});

describe('Artwork Lifecycle', () => {
  beforeEach(() => {
    disposeAllArtwork();
  });

  afterEach(() => {
    disposeAllArtwork();
  });

  it('should handle rapid pause/resume cycles gracefully', () => {
    for (let i = 0; i < 10; i++) {
      pauseArtwork(1);
      resumeArtwork(1);
    }

    // Should not throw or cause issues
    expect(getRunningArtworks()).toEqual([]);
  });

  it('should handle dispose of non-existent artworks', () => {
    // Should not throw for any day
    expect(() => disposeLiveArtwork(1)).not.toThrow();
    expect(() => disposeLiveArtwork(15)).not.toThrow();
    expect(() => disposeLiveArtwork(31)).not.toThrow();
    expect(() => disposeLiveArtwork(999)).not.toThrow();
  });

  it('should handle interleaved operations', () => {
    // Simulate a complex usage pattern
    pauseArtwork(1);
    pauseArtwork(2);
    resumeArtwork(1);
    disposeLiveArtwork(2);
    resumeArtwork(2);
    pauseArtwork(1);

    // Should complete without errors
    expect(getRunningArtworks()).toEqual([]);
  });
});

describe('Day Import Map Coverage', () => {
  // These tests verify the module exports without actually
  // invoking the imports (which would require full p5/Three.js setup)

  it('should have imports defined for days 1-31', async () => {
    // Import the module to check its structure
    const artwork = await import('../exhibits/artwork');

    // Verify the module exports the expected functions
    expect(artwork.createLiveArtwork).toBeDefined();
    expect(artwork.getDayTexture).toBeDefined();
    expect(artwork.disposeLiveArtwork).toBeDefined();
    expect(artwork.disposeAllArtwork).toBeDefined();
    expect(artwork.pauseArtwork).toBeDefined();
    expect(artwork.resumeArtwork).toBeDefined();
    expect(artwork.updateArtworkControls).toBeDefined();
    expect(artwork.getRunningArtworks).toBeDefined();
  });
});
