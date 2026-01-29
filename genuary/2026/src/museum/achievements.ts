/**
 * Museum Achievements System
 *
 * Rewards users with badges for various accomplishments.
 */

// ============================================================================
// Types
// ============================================================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  secret?: boolean; // Hidden until unlocked
}

export interface AchievementsSystem {
  unlocked: Set<string>;
  onAchievementUnlocked: ((achievement: Achievement) => void) | null;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-achievements';

const ACHIEVEMENTS: Achievement[] = [
  // Exploration achievements
  {
    id: 'first-visit',
    name: 'Welcome',
    description: 'Enter the museum for the first time',
    icon: '🚪',
  },
  {
    id: 'explorer-10',
    name: 'Explorer',
    description: 'View 10 different exhibits',
    icon: '🔍',
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'View all 31 exhibits',
    icon: '🏆',
  },
  // Favorites achievements
  {
    id: 'first-favorite',
    name: 'Art Lover',
    description: 'Add your first favorite',
    icon: '❤️',
  },
  {
    id: 'favorites-5',
    name: 'Curator',
    description: 'Favorite 5 exhibits',
    icon: '🎨',
  },
  {
    id: 'favorites-15',
    name: 'Connoisseur',
    description: 'Favorite 15 exhibits',
    icon: '👑',
  },
  // Tour achievements
  {
    id: 'tour-started',
    name: 'Tourist',
    description: 'Start a guided tour',
    icon: '🎫',
  },
  // Photo achievements
  {
    id: 'first-photo',
    name: 'Photographer',
    description: 'Take your first screenshot',
    icon: '📸',
  },
  {
    id: 'photos-10',
    name: 'Photo Album',
    description: 'Take 10 screenshots',
    icon: '📷',
  },
  // Sharing achievement
  {
    id: 'shared-view',
    name: 'Social Butterfly',
    description: 'Share your view with someone',
    icon: '🔗',
  },
  // Time achievements
  {
    id: 'spent-5min',
    name: 'Taking It In',
    description: 'Spend 5 minutes in the museum',
    icon: '⏱️',
  },
  {
    id: 'spent-30min',
    name: 'Art Enthusiast',
    description: 'Spend 30 minutes in the museum',
    icon: '⌛',
  },
  // Distance achievement
  {
    id: 'walked-100m',
    name: 'Walker',
    description: 'Walk 100 meters in the museum',
    icon: '🚶',
  },
  {
    id: 'walked-500m',
    name: 'Marathon',
    description: 'Walk 500 meters in the museum',
    icon: '🏃',
  },
  // Secret achievements
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Visit the museum after midnight',
    icon: '🦉',
    secret: true,
  },
  {
    id: 'speed-run',
    name: 'Speed Runner',
    description: 'View 10 exhibits in under 2 minutes',
    icon: '⚡',
    secret: true,
  },
];

// ============================================================================
// Achievements System Creation
// ============================================================================

/**
 * Create the achievements system
 */
export function createAchievementsSystem(): AchievementsSystem {
  const unlocked = loadAchievements();

  const system: AchievementsSystem = {
    unlocked,
    onAchievementUnlocked: null,
  };

  // Check for first visit
  if (!unlocked.has('first-visit')) {
    setTimeout(() => {
      unlockAchievement(system, 'first-visit');
    }, 2000);
  }

  // Check for night owl
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5 && !unlocked.has('night-owl')) {
    setTimeout(() => {
      unlockAchievement(system, 'night-owl');
    }, 5000);
  }

  return system;
}

// ============================================================================
// Achievement Unlocking
// ============================================================================

/**
 * Unlock an achievement
 */
export function unlockAchievement(system: AchievementsSystem, achievementId: string): boolean {
  if (system.unlocked.has(achievementId)) return false;

  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return false;

  system.unlocked.add(achievementId);
  saveAchievements(system.unlocked);

  console.log(`Achievement unlocked: ${achievement.name}`);
  system.onAchievementUnlocked?.(achievement);

  return true;
}

/**
 * Check and unlock achievements based on stats
 */
export function checkAchievements(
  system: AchievementsSystem,
  stats: {
    exhibitsViewed: number;
    favoritesCount: number;
    screenshotsTaken: number;
    toursTaken: number;
    totalTimeSpent: number;
    distanceWalked: number;
    sharedViews: number;
  }
): void {
  // Exploration
  if (stats.exhibitsViewed >= 10) unlockAchievement(system, 'explorer-10');
  if (stats.exhibitsViewed >= 31) unlockAchievement(system, 'completionist');

  // Favorites
  if (stats.favoritesCount >= 1) unlockAchievement(system, 'first-favorite');
  if (stats.favoritesCount >= 5) unlockAchievement(system, 'favorites-5');
  if (stats.favoritesCount >= 15) unlockAchievement(system, 'favorites-15');

  // Photos
  if (stats.screenshotsTaken >= 1) unlockAchievement(system, 'first-photo');
  if (stats.screenshotsTaken >= 10) unlockAchievement(system, 'photos-10');

  // Tour
  if (stats.toursTaken >= 1) unlockAchievement(system, 'tour-started');

  // Sharing
  if (stats.sharedViews >= 1) unlockAchievement(system, 'shared-view');

  // Time (in seconds)
  if (stats.totalTimeSpent >= 300) unlockAchievement(system, 'spent-5min');
  if (stats.totalTimeSpent >= 1800) unlockAchievement(system, 'spent-30min');

  // Distance
  if (stats.distanceWalked >= 100) unlockAchievement(system, 'walked-100m');
  if (stats.distanceWalked >= 500) unlockAchievement(system, 'walked-500m');
}

// ============================================================================
// Achievement Queries
// ============================================================================

/**
 * Get all achievements (including locked ones)
 */
export function getAllAchievements(system: AchievementsSystem): Array<Achievement & { isUnlocked: boolean }> {
  return ACHIEVEMENTS.map(a => ({
    ...a,
    isUnlocked: system.unlocked.has(a.id),
  }));
}

/**
 * Get unlocked achievement count
 */
export function getUnlockedCount(system: AchievementsSystem): { unlocked: number; total: number } {
  return {
    unlocked: system.unlocked.size,
    total: ACHIEVEMENTS.length,
  };
}

// ============================================================================
// Achievement Notification
// ============================================================================

/**
 * Show achievement unlocked notification
 */
export function showAchievementNotification(achievement: Achievement): void {
  const existing = document.getElementById('achievement-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'achievement-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, rgba(74, 158, 255, 0.95), rgba(168, 85, 247, 0.95));
    color: white;
    padding: 15px 25px;
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    z-index: 400;
    text-align: center;
    animation: achievement-pop 0.5s ease-out;
    box-shadow: 0 4px 20px rgba(74, 158, 255, 0.4);
  `;

  notification.innerHTML = `
    <div style="font-size: 28px; margin-bottom: 5px;">${achievement.icon}</div>
    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8;">
      Achievement Unlocked
    </div>
    <div style="font-size: 16px; font-weight: bold; margin-top: 4px;">
      ${achievement.name}
    </div>
    <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">
      ${achievement.description}
    </div>
    <style>
      @keyframes achievement-pop {
        0% { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.8); }
        100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
      }
    </style>
  `;

  document.body.appendChild(notification);

  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    setTimeout(() => notification.remove(), 500);
  }, 4000);
}

// ============================================================================
// Persistence
// ============================================================================

/**
 * Load achievements from localStorage
 */
function loadAchievements(): Set<string> {
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
 * Save achievements to localStorage
 */
function saveAchievements(achievements: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...achievements]));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose achievements system
 */
export function disposeAchievementsSystem(_system: AchievementsSystem): void {
  // Nothing to clean up
}
