/**
 * Exhibit Reactions
 *
 * Quick emoji reactions that visitors can add to exhibits,
 * creating a sense of community engagement.
 */

// ============================================================================
// Types
// ============================================================================

export interface ReactionCount {
  emoji: string;
  count: number;
}

export interface ExhibitReactions {
  dayNumber: number;
  reactions: Record<string, number>;
  userReaction: string | null;
}

export interface ReactionsSystem {
  container: HTMLElement;
  reactions: Map<number, ExhibitReactions>;
  panel: HTMLElement | null;
  currentDay: number;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-reactions';
const REACTION_EMOJIS = ['🔥', '💜', '🤯', '✨', '👀', '🎨'];

// ============================================================================
// Reactions System Creation
// ============================================================================

/**
 * Create the reactions system
 */
export function createReactionsSystem(container: HTMLElement): ReactionsSystem {
  const saved = loadReactions();

  const system: ReactionsSystem = {
    container,
    reactions: saved || new Map(),
    panel: null,
    currentDay: 0,
    cleanup: () => {
      hideReactionsPanel(system);
    },
  };

  return system;
}

/**
 * Show reactions panel for an exhibit
 */
export function showReactionsPanel(system: ReactionsSystem, dayNumber: number): void {
  hideReactionsPanel(system);
  system.currentDay = dayNumber;

  // Get or create reactions for this day
  let exhibitReactions = system.reactions.get(dayNumber);
  if (!exhibitReactions) {
    exhibitReactions = {
      dayNumber,
      reactions: generateInitialReactions(),
      userReaction: null,
    };
    system.reactions.set(dayNumber, exhibitReactions);
  }

  const panel = document.createElement('div');
  panel.id = 'reactions-panel';
  panel.style.cssText = `
    position: fixed;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 30, 0.95);
    border: 1px solid rgba(255, 150, 200, 0.3);
    border-radius: 25px;
    padding: 8px 12px;
    display: flex;
    gap: 4px;
    align-items: center;
    font-family: system-ui, sans-serif;
    z-index: 600;
    opacity: 0;
    transition: opacity 0.3s;
  `;

  panel.innerHTML = REACTION_EMOJIS.map(emoji => {
    const count = exhibitReactions!.reactions[emoji] || 0;
    const isSelected = exhibitReactions!.userReaction === emoji;
    return `
      <button class="reaction-btn" data-emoji="${emoji}" style="
        background: ${isSelected ? 'rgba(255, 150, 200, 0.3)' : 'rgba(40, 40, 60, 0.5)'};
        border: 1px solid ${isSelected ? 'rgba(255, 150, 200, 0.5)' : 'transparent'};
        border-radius: 20px;
        padding: 6px 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s;
      ">
        <span style="font-size: 16px;">${emoji}</span>
        <span style="font-size: 11px; color: #aaa;">${count > 0 ? count : ''}</span>
      </button>
    `;
  }).join('');

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up clicks
  const buttons = panel.querySelectorAll('.reaction-btn');
  buttons.forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      const emoji = (btn as HTMLElement).dataset.emoji;
      if (emoji) {
        toggleReaction(system, dayNumber, emoji);
      }
    };

    (btn as HTMLElement).onmouseover = () => {
      (btn as HTMLElement).style.transform = 'scale(1.1)';
    };
    (btn as HTMLElement).onmouseout = () => {
      (btn as HTMLElement).style.transform = 'scale(1)';
    };
  });
}

/**
 * Hide reactions panel
 */
export function hideReactionsPanel(system: ReactionsSystem): void {
  if (!system.panel) return;

  system.panel.style.opacity = '0';
  const panel = system.panel;

  setTimeout(() => {
    panel.remove();
    if (system.panel === panel) {
      system.panel = null;
    }
  }, 300);

  system.currentDay = 0;
}

/**
 * Toggle a reaction
 */
function toggleReaction(system: ReactionsSystem, dayNumber: number, emoji: string): void {
  const exhibitReactions = system.reactions.get(dayNumber);
  if (!exhibitReactions) return;

  if (exhibitReactions.userReaction === emoji) {
    // Remove reaction
    exhibitReactions.reactions[emoji] = Math.max(0, (exhibitReactions.reactions[emoji] || 0) - 1);
    exhibitReactions.userReaction = null;
    showReactionFeedback(system, '');
  } else {
    // Remove old reaction if exists
    if (exhibitReactions.userReaction) {
      const oldEmoji = exhibitReactions.userReaction;
      exhibitReactions.reactions[oldEmoji] = Math.max(0, (exhibitReactions.reactions[oldEmoji] || 0) - 1);
    }
    // Add new reaction
    exhibitReactions.reactions[emoji] = (exhibitReactions.reactions[emoji] || 0) + 1;
    exhibitReactions.userReaction = emoji;
    showReactionFeedback(system, emoji);
  }

  saveReactions(system);

  // Refresh panel
  showReactionsPanel(system, dayNumber);
}

/**
 * Show reaction feedback animation
 */
function showReactionFeedback(system: ReactionsSystem, emoji: string): void {
  if (!emoji) return;

  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    left: 50%;
    bottom: 180px;
    transform: translateX(-50%);
    font-size: 48px;
    z-index: 700;
    pointer-events: none;
    animation: reaction-float 1s ease-out forwards;
  `;
  feedback.textContent = emoji;

  system.container.appendChild(feedback);

  // Add animation keyframes if not present
  if (!document.getElementById('reaction-animation')) {
    const style = document.createElement('style');
    style.id = 'reaction-animation';
    style.textContent = `
      @keyframes reaction-float {
        0% { transform: translateX(-50%) scale(0.5); opacity: 1; }
        100% { transform: translateX(-50%) translateY(-50px) scale(1.2); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => feedback.remove(), 1000);
}

/**
 * Generate initial simulated reactions
 */
function generateInitialReactions(): Record<string, number> {
  const reactions: Record<string, number> = {};

  REACTION_EMOJIS.forEach(emoji => {
    // Random initial count (simulated community reactions)
    const baseCount = Math.floor(Math.random() * 30);
    if (baseCount > 5) {
      reactions[emoji] = baseCount;
    }
  });

  return reactions;
}

/**
 * Get top reactions for a day
 */
export function getTopReactions(system: ReactionsSystem, dayNumber: number): ReactionCount[] {
  const exhibitReactions = system.reactions.get(dayNumber);
  if (!exhibitReactions) return [];

  return Object.entries(exhibitReactions.reactions)
    .filter(([_, count]) => count > 0)
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

/**
 * Get user's reaction for a day
 */
export function getUserReaction(system: ReactionsSystem, dayNumber: number): string | null {
  return system.reactions.get(dayNumber)?.userReaction || null;
}

// ============================================================================
// Persistence
// ============================================================================

function loadReactions(): Map<number, ExhibitReactions> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved) as Array<[number, ExhibitReactions]>;
      return new Map(data);
    }
  } catch {
    // localStorage may not be available
  }
  return null;
}

function saveReactions(system: ReactionsSystem): void {
  try {
    const data = Array.from(system.reactions.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeReactionsSystem(system: ReactionsSystem): void {
  system.cleanup();
}
