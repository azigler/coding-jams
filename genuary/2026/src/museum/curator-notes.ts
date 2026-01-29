/**
 * Curator Notes
 *
 * Hidden messages and fun facts that appear when certain conditions are met.
 * Adds personality and discovery elements to the museum experience.
 */

// ============================================================================
// Types
// ============================================================================

export interface CuratorNote {
  id: string;
  condition: NoteCondition;
  title: string;
  message: string;
  icon: string;
}

export type NoteCondition =
  | { type: 'day'; dayNumber: number }
  | { type: 'time'; hour: number }
  | { type: 'viewCount'; count: number }
  | { type: 'combo'; days: number[] }
  | { type: 'firstVisit' }
  | { type: 'wing'; wing: string }
  | { type: 'allInWing'; wing: string }
  | { type: 'random'; chance: number };

export interface CuratorNoteSystem {
  container: HTMLElement;
  shownNotes: Set<string>;
  currentNote: HTMLElement | null;
  cleanup: () => void;
}

// ============================================================================
// Curator Notes Data
// ============================================================================

const CURATOR_NOTES: CuratorNote[] = [
  // Day-specific notes
  {
    id: 'day7-seven',
    condition: { type: 'day', dayNumber: 7 },
    title: 'Lucky Number',
    message: "The artist was required to use the digit '7' in their code. Look closely - can you spot it in the patterns?",
    icon: '7️⃣',
  },
  {
    id: 'day42-meaning',
    condition: { type: 'day', dayNumber: 3 },
    title: 'The Answer',
    message: 'This piece uses exactly 42 lines of code - the answer to life, the universe, and everything.',
    icon: '📖',
  },
  {
    id: 'day10-tau',
    condition: { type: 'day', dayNumber: 10 },
    title: 'The Tau Manifesto',
    message: "This piece uses TAU (2π) instead of PI. Some mathematicians argue TAU is more natural for describing circles.",
    icon: '🔄',
  },
  {
    id: 'day11-impossible',
    condition: { type: 'day', dayNumber: 11 },
    title: 'The Impossible Day',
    message: 'This piece attempts to satisfy ALL 31 prompts at once. How many can you identify?',
    icon: '🎯',
  },
  {
    id: 'day31-celebrate',
    condition: { type: 'day', dayNumber: 31 },
    title: 'The Finale',
    message: "You've reached the final day of Genuary. Every ending is also a beginning.",
    icon: '🎆',
  },
  {
    id: 'day1-origin',
    condition: { type: 'day', dayNumber: 1 },
    title: 'Where It Begins',
    message: 'Day 1 sets the tone. Simple constraints often yield surprising results.',
    icon: '🌅',
  },
  {
    id: 'day4-darkness',
    condition: { type: 'day', dayNumber: 4 },
    title: 'Into Darkness',
    message: "Black on black - this piece challenges you to see what's hidden in shadow.",
    icon: '🌑',
  },
  {
    id: 'day8-million',
    condition: { type: 'day', dayNumber: 8 },
    title: 'One Million',
    message: "This piece renders one million elements. If you counted one per second, it would take over 11 days.",
    icon: '💫',
  },
  {
    id: 'day21-physics',
    condition: { type: 'day', dayNumber: 21 },
    title: 'Laws of Motion',
    message: "This piece implements collision detection - the foundation of all video game physics.",
    icon: '🎮',
  },

  // Time-based notes
  {
    id: 'midnight-visitor',
    condition: { type: 'time', hour: 0 },
    title: 'Midnight Visitor',
    message: "The museum is quiet at this hour. You're among the few who explore when the world sleeps.",
    icon: '🌙',
  },
  {
    id: 'dawn-light',
    condition: { type: 'time', hour: 6 },
    title: 'Early Light',
    message: "Art looks different in morning light. The early visitor sees what others miss.",
    icon: '🌄',
  },
  {
    id: 'golden-hour',
    condition: { type: 'time', hour: 17 },
    title: 'Golden Hour',
    message: "Photographers call this the magic hour. Light makes everything more beautiful.",
    icon: '✨',
  },

  // Progress notes
  {
    id: 'first-ten',
    condition: { type: 'viewCount', count: 10 },
    title: 'Getting Started',
    message: "10 exhibits down! You're developing an eye for generative art.",
    icon: '👀',
  },
  {
    id: 'halfway',
    condition: { type: 'viewCount', count: 16 },
    title: 'Halfway Point',
    message: "You've seen half the museum. What themes connect these pieces?",
    icon: '⚖️',
  },
  {
    id: 'almost-complete',
    condition: { type: 'viewCount', count: 28 },
    title: 'The Final Stretch',
    message: "Just a few more to go. True collectors see everything.",
    icon: '🏃',
  },

  // Combo notes (viewing specific combinations)
  {
    id: 'shapes-trio',
    condition: { type: 'combo', days: [13, 6, 5] },
    title: 'Shape Explorer',
    message: "You've seen triangles, landscapes, and isometric art - all built from simple geometric shapes.",
    icon: '🔷',
  },
  {
    id: 'color-spectrum',
    condition: { type: 'combo', days: [4, 14, 22, 23] },
    title: 'Color Theory',
    message: "From black to white to gradients to many colors - you've experienced the full spectrum.",
    icon: '🌈',
  },
  {
    id: 'math-bundle',
    condition: { type: 'combo', days: [3, 7, 10, 27] },
    title: 'Mathematical Mind',
    message: "42 lines, digit 7, TAU only, no randomness - you appreciate the mathematical constraints.",
    icon: '🔢',
  },

  // Wing completion notes
  {
    id: 'north-wing-complete',
    condition: { type: 'allInWing', wing: 'North' },
    title: 'North Wing Complete',
    message: "You've explored every piece in the North Wing. Each wing has its own character.",
    icon: '🧭',
  },
  {
    id: 'south-wing-complete',
    condition: { type: 'allInWing', wing: 'South' },
    title: 'South Wing Complete',
    message: "The South Wing is complete. Notice how the lighting differs from the north?",
    icon: '🌞',
  },
  {
    id: 'east-wing-complete',
    condition: { type: 'allInWing', wing: 'East' },
    title: 'East Wing Complete',
    message: "East Wing mastered! The morning sun would illuminate these pieces first.",
    icon: '🌅',
  },
  {
    id: 'west-wing-complete',
    condition: { type: 'allInWing', wing: 'West' },
    title: 'West Wing Complete',
    message: "The West Wing is yours. Sunsets through these windows must be spectacular.",
    icon: '🌇',
  },

  // First visit note
  {
    id: 'welcome',
    condition: { type: 'firstVisit' },
    title: 'Welcome',
    message: "Welcome to the Genuary 2026 Virtual Museum. 31 days of creative code await you.",
    icon: '🏛️',
  },

  // Random/rare notes
  {
    id: 'rare-insight',
    condition: { type: 'random', chance: 0.05 },
    title: 'A Thought',
    message: "Every pixel you see was calculated, not drawn. Code is the brush, mathematics the paint.",
    icon: '💭',
  },
  {
    id: 'rare-quote',
    condition: { type: 'random', chance: 0.03 },
    title: 'Artist\'s Words',
    message: '"The computer is a tool, but the art comes from the human who wields it."',
    icon: '💬',
  },
];

// ============================================================================
// Storage
// ============================================================================

const STORAGE_KEY = 'genuary-museum-curator-notes';

function loadShownNotes(): Set<string> {
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

function saveShownNotes(shown: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...shown]));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Curator Note System Creation
// ============================================================================

/**
 * Create the curator notes system
 */
export function createCuratorNoteSystem(container: HTMLElement): CuratorNoteSystem {
  const system: CuratorNoteSystem = {
    container,
    shownNotes: loadShownNotes(),
    currentNote: null,
    cleanup: () => {
      if (system.currentNote) {
        system.currentNote.remove();
        system.currentNote = null;
      }
    },
  };

  return system;
}

/**
 * Check if a note should be shown based on its condition
 */
function shouldShowNote(
  note: CuratorNote,
  context: NoteContext,
  shownNotes: Set<string>
): boolean {
  // Don't show notes that have already been shown
  if (shownNotes.has(note.id)) {
    return false;
  }

  const { condition } = note;

  switch (condition.type) {
    case 'day':
      return context.currentDay === condition.dayNumber;

    case 'time':
      return new Date().getHours() === condition.hour;

    case 'viewCount':
      return context.exhibitsViewed.size === condition.count;

    case 'combo':
      return condition.days.every(d => context.exhibitsViewed.has(d));

    case 'firstVisit':
      return context.isFirstVisit;

    case 'wing':
      return context.currentWing === condition.wing;

    case 'allInWing': {
      const wingDays = getWingDays(condition.wing);
      return wingDays.every(d => context.exhibitsViewed.has(d)) &&
             wingDays.includes(context.currentDay);
    }

    case 'random':
      return Math.random() < condition.chance;

    default:
      return false;
  }
}

/**
 * Get the days that belong to a wing
 */
function getWingDays(wing: string): number[] {
  switch (wing) {
    case 'North':
      return [1, 2, 3, 4, 5, 6, 7, 8];
    case 'South':
      return [9, 10, 11, 12, 13, 14, 15, 16];
    case 'East':
      return [17, 18, 19, 20, 21, 22, 23, 24];
    case 'West':
      return [25, 26, 27, 28, 29, 30, 31];
    default:
      return [];
  }
}

// ============================================================================
// Note Context
// ============================================================================

export interface NoteContext {
  currentDay: number;
  currentWing: string;
  exhibitsViewed: Set<number>;
  isFirstVisit: boolean;
}

/**
 * Check for and show curator notes based on current context
 */
export function checkCuratorNotes(
  system: CuratorNoteSystem,
  context: NoteContext
): void {
  // Don't show if a note is already displayed
  if (system.currentNote) {
    return;
  }

  // Find a note to show
  for (const note of CURATOR_NOTES) {
    if (shouldShowNote(note, context, system.shownNotes)) {
      showCuratorNote(system, note);
      break;
    }
  }
}

/**
 * Show a curator note
 */
function showCuratorNote(system: CuratorNoteSystem, note: CuratorNote): void {
  // Mark as shown
  system.shownNotes.add(note.id);
  saveShownNotes(system.shownNotes);

  // Create the note element
  const noteEl = document.createElement('div');
  noteEl.id = 'curator-note';
  noteEl.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 320px;
    background: linear-gradient(135deg, rgba(15, 15, 25, 0.98), rgba(30, 20, 40, 0.98));
    border: 1px solid rgba(168, 85, 247, 0.4);
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 900;
    opacity: 0;
    transform: translateX(20px);
    transition: opacity 0.5s, transform 0.5s;
    overflow: hidden;
  `;

  noteEl.innerHTML = `
    <div style="
      padding: 15px;
      border-bottom: 1px solid rgba(168, 85, 247, 0.2);
      display: flex;
      align-items: center;
      gap: 10px;
    ">
      <span style="font-size: 24px;">${note.icon}</span>
      <div>
        <div style="font-size: 10px; color: #a855f7; text-transform: uppercase; letter-spacing: 1px;">Curator's Note</div>
        <div style="font-size: 14px; font-weight: 600; color: white;">${note.title}</div>
      </div>
    </div>
    <div style="padding: 15px;">
      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #c0c0d0;">
        ${note.message}
      </p>
    </div>
    <button id="curator-note-close" style="
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #888;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    ">×</button>
  `;

  system.container.appendChild(noteEl);
  system.currentNote = noteEl;

  // Wire up close button
  setTimeout(() => {
    const closeBtn = document.getElementById('curator-note-close');
    if (closeBtn) {
      closeBtn.onclick = () => closeCuratorNote(system);
    }
  }, 0);

  // Animate in
  requestAnimationFrame(() => {
    noteEl.style.opacity = '1';
    noteEl.style.transform = 'translateX(0)';
  });

  // Auto-dismiss after 12 seconds
  setTimeout(() => {
    closeCuratorNote(system);
  }, 12000);
}

/**
 * Close the current curator note
 */
function closeCuratorNote(system: CuratorNoteSystem): void {
  if (!system.currentNote) return;

  const note = system.currentNote;
  note.style.opacity = '0';
  note.style.transform = 'translateX(20px)';

  setTimeout(() => {
    note.remove();
    if (system.currentNote === note) {
      system.currentNote = null;
    }
  }, 500);
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeCuratorNoteSystem(system: CuratorNoteSystem): void {
  system.cleanup();
}
