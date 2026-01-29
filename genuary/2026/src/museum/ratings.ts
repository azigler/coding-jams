/**
 * Exhibit Rating System
 *
 * Allows visitors to rate exhibits with thumbs up/down.
 */

// ============================================================================
// Types
// ============================================================================

export interface Rating {
  dayNumber: number;
  rating: 'up' | 'down';
  timestamp: number;
}

export interface RatingsSystem {
  ratings: Map<number, 'up' | 'down'>;
  onRatingChange: ((dayNumber: number, rating: 'up' | 'down' | null) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-ratings';

// ============================================================================
// Ratings System Creation
// ============================================================================

/**
 * Create the ratings system
 */
export function createRatingsSystem(): RatingsSystem {
  const ratings = loadRatings();

  const system: RatingsSystem = {
    ratings,
    onRatingChange: null,
    cleanup: () => {},
  };

  return system;
}

/**
 * Rate an exhibit
 */
export function rateExhibit(
  system: RatingsSystem,
  dayNumber: number,
  rating: 'up' | 'down'
): 'up' | 'down' | null {
  const currentRating = system.ratings.get(dayNumber);

  if (currentRating === rating) {
    // Toggle off if same rating
    system.ratings.delete(dayNumber);
    saveRatings(system.ratings);
    system.onRatingChange?.(dayNumber, null);
    return null;
  } else {
    // Set new rating
    system.ratings.set(dayNumber, rating);
    saveRatings(system.ratings);
    system.onRatingChange?.(dayNumber, rating);
    return rating;
  }
}

/**
 * Get rating for an exhibit
 */
export function getRating(system: RatingsSystem, dayNumber: number): 'up' | 'down' | null {
  return system.ratings.get(dayNumber) ?? null;
}

/**
 * Get all exhibits with a specific rating
 */
export function getExhibitsByRating(system: RatingsSystem, rating: 'up' | 'down'): number[] {
  const results: number[] = [];
  system.ratings.forEach((r, dayNumber) => {
    if (r === rating) {
      results.push(dayNumber);
    }
  });
  return results.sort((a, b) => a - b);
}

/**
 * Get rating statistics
 */
export function getRatingStats(system: RatingsSystem): { up: number; down: number; total: number } {
  let up = 0;
  let down = 0;
  system.ratings.forEach(rating => {
    if (rating === 'up') up++;
    else down++;
  });
  return { up, down, total: up + down };
}

// ============================================================================
// Persistence
// ============================================================================

/**
 * Load ratings from localStorage
 */
function loadRatings(): Map<number, 'up' | 'down'> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved) as Array<[number, 'up' | 'down']>;
      return new Map(data);
    }
  } catch {
    // localStorage may not be available
  }
  return new Map();
}

/**
 * Save ratings to localStorage
 */
function saveRatings(ratings: Map<number, 'up' | 'down'>): void {
  try {
    const data = Array.from(ratings.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose ratings system
 */
export function disposeRatingsSystem(system: RatingsSystem): void {
  system.cleanup();
}
