/**
 * Exhibit Favorites System
 *
 * Allows users to mark exhibits as favorites and quickly access them.
 */

// ============================================================================
// Types
// ============================================================================

export interface FavoritesSystem {
  favorites: Set<number>;
  onFavoriteToggle: ((dayNumber: number, isFavorite: boolean) => void) | null;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-favorites';

// ============================================================================
// Favorites System Creation
// ============================================================================

/**
 * Create the favorites system
 */
export function createFavoritesSystem(): FavoritesSystem {
  const favorites = loadFavorites();

  return {
    favorites,
    onFavoriteToggle: null,
  };
}

/**
 * Check if a day is favorited
 */
export function isFavorite(system: FavoritesSystem, dayNumber: number): boolean {
  return system.favorites.has(dayNumber);
}

/**
 * Toggle favorite status for a day
 */
export function toggleFavorite(system: FavoritesSystem, dayNumber: number): boolean {
  const wasFavorite = system.favorites.has(dayNumber);

  if (wasFavorite) {
    system.favorites.delete(dayNumber);
  } else {
    system.favorites.add(dayNumber);
  }

  saveFavorites(system.favorites);
  system.onFavoriteToggle?.(dayNumber, !wasFavorite);

  return !wasFavorite;
}

/**
 * Get all favorite day numbers
 */
export function getFavorites(system: FavoritesSystem): number[] {
  return [...system.favorites].sort((a, b) => a - b);
}

/**
 * Get count of favorites
 */
export function getFavoriteCount(system: FavoritesSystem): number {
  return system.favorites.size;
}

// ============================================================================
// Persistence
// ============================================================================

/**
 * Load favorites from localStorage
 */
function loadFavorites(): Set<number> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return new Set(JSON.parse(saved));
    }
  } catch {
    // localStorage may not be available
  }
  return new Set();
}

/**
 * Save favorites to localStorage
 */
function saveFavorites(favorites: Set<number>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// UI Helpers
// ============================================================================

/**
 * Create a favorite button for the zoom info panel
 */
export function createFavoriteButton(
  system: FavoritesSystem,
  dayNumber: number,
  container: HTMLElement
): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'favorite-button';
  button.style.cssText = `
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 5px;
    transition: transform 0.2s;
  `;

  const updateButton = () => {
    const fav = isFavorite(system, dayNumber);
    button.innerHTML = fav ? '❤️' : '🤍';
    button.title = fav ? 'Remove from favorites' : 'Add to favorites';
  };

  updateButton();

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(system, dayNumber);
    updateButton();
    // Animate
    button.style.transform = 'scale(1.3)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 200);
  });

  container.appendChild(button);
  return button;
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose favorites system
 */
export function disposeFavoritesSystem(_system: FavoritesSystem): void {
  // Nothing to clean up - data is persisted in localStorage
}
