/**
 * Mood Filter System
 *
 * Lets visitors change the visual atmosphere of the museum
 * with different color themes and visual effects.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface Mood {
  id: string;
  name: string;
  icon: string;
  ambientColor: number;
  fogColor: number;
  fogDensity: number;
  filter: string;
  description: string;
}

export interface MoodSystem {
  container: HTMLElement;
  scene: THREE.Scene;
  currentMood: string;
  originalAmbient: number;
  originalFogColor: number;
  originalFogDensity: number;
  selector: HTMLElement | null;
  indicator: HTMLElement | null;
  cleanup: () => void;
}

// ============================================================================
// Mood Presets
// ============================================================================

const MOODS: Mood[] = [
  {
    id: 'default',
    name: 'Gallery',
    icon: '🏛️',
    ambientColor: 0x404050,
    fogColor: 0x0a0a12,
    fogDensity: 0.015,
    filter: 'none',
    description: 'Classic museum lighting',
  },
  {
    id: 'warm',
    name: 'Golden Hour',
    icon: '🌅',
    ambientColor: 0x806040,
    fogColor: 0x201510,
    fogDensity: 0.012,
    filter: 'sepia(20%) saturate(110%)',
    description: 'Warm sunset ambiance',
  },
  {
    id: 'cool',
    name: 'Moonlit',
    icon: '🌙',
    ambientColor: 0x304060,
    fogColor: 0x050810,
    fogDensity: 0.018,
    filter: 'saturate(80%) brightness(95%)',
    description: 'Cool nighttime glow',
  },
  {
    id: 'neon',
    name: 'Cyber',
    icon: '💜',
    ambientColor: 0x602080,
    fogColor: 0x100818,
    fogDensity: 0.02,
    filter: 'saturate(130%) contrast(105%)',
    description: 'Neon cyberpunk vibes',
  },
  {
    id: 'noir',
    name: 'Noir',
    icon: '🖤',
    ambientColor: 0x303030,
    fogColor: 0x080808,
    fogDensity: 0.025,
    filter: 'grayscale(80%) contrast(110%)',
    description: 'Black and white drama',
  },
  {
    id: 'dream',
    name: 'Dreamscape',
    icon: '✨',
    ambientColor: 0x505080,
    fogColor: 0x101020,
    fogDensity: 0.01,
    filter: 'saturate(120%) brightness(105%) blur(0.5px)',
    description: 'Soft dreamy glow',
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: '🌲',
    ambientColor: 0x305030,
    fogColor: 0x081008,
    fogDensity: 0.02,
    filter: 'sepia(10%) hue-rotate(-15deg)',
    description: 'Natural green tones',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    icon: '🌇',
    ambientColor: 0x804030,
    fogColor: 0x180808,
    fogDensity: 0.015,
    filter: 'sepia(30%) saturate(120%)',
    description: 'Dramatic orange hues',
  },
];

// ============================================================================
// Mood System Creation
// ============================================================================

/**
 * Create the mood system
 */
export function createMoodSystem(container: HTMLElement, scene: THREE.Scene): MoodSystem {
  // Store original scene settings
  const ambientLight = scene.children.find(c => c instanceof THREE.AmbientLight) as THREE.AmbientLight | undefined;
  const originalAmbient = ambientLight?.color.getHex() || 0x404050;

  const fog = scene.fog as THREE.FogExp2 | null;
  const originalFogColor = fog?.color.getHex() || 0x0a0a12;
  const originalFogDensity = fog?.density || 0.015;

  const system: MoodSystem = {
    container,
    scene,
    currentMood: 'default',
    originalAmbient,
    originalFogColor,
    originalFogDensity,
    selector: null,
    indicator: null,
    cleanup: () => {
      if (system.selector) {
        system.selector.remove();
        system.selector = null;
      }
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
    },
  };

  // Create mood indicator
  createMoodIndicator(system);

  // Toggle selector with Shift+M
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyM' && event.shiftKey) {
      event.preventDefault();
      if (system.selector) {
        closeMoodSelector(system);
      } else {
        openMoodSelector(system);
      }
    }
  };
  document.addEventListener('keydown', keyHandler);

  const originalCleanup = system.cleanup;
  system.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
    // Reset to default mood
    applyMood(system, 'default');
    originalCleanup();
  };

  return system;
}

/**
 * Create the small mood indicator in corner
 */
function createMoodIndicator(system: MoodSystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'mood-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(20, 20, 30, 0.8);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 20px;
    padding: 6px 12px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: #888;
    cursor: pointer;
    z-index: 400;
    transition: all 0.3s;
  `;

  const mood = MOODS.find(m => m.id === system.currentMood) || MOODS[0];
  indicator.innerHTML = `<span style="margin-right: 4px;">${mood.icon}</span> ${mood.name}`;
  indicator.title = 'Click or Shift+M to change mood';

  indicator.onclick = () => {
    if (system.selector) {
      closeMoodSelector(system);
    } else {
      openMoodSelector(system);
    }
  };

  indicator.onmouseover = () => {
    indicator.style.borderColor = 'rgba(100, 150, 255, 0.6)';
  };
  indicator.onmouseout = () => {
    indicator.style.borderColor = 'rgba(100, 150, 255, 0.3)';
  };

  system.container.appendChild(indicator);
  system.indicator = indicator;
}

/**
 * Open the mood selector popup
 */
function openMoodSelector(system: MoodSystem): void {
  if (system.selector) return;

  const selector = document.createElement('div');
  selector.id = 'mood-selector';
  selector.style.cssText = `
    position: fixed;
    bottom: 60px;
    left: 20px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 12px;
    padding: 15px;
    font-family: system-ui, sans-serif;
    z-index: 800;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s;
  `;

  selector.innerHTML = `
    <div style="font-size: 12px; color: #888; margin-bottom: 10px;">Atmosphere</div>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
      ${MOODS.map(mood => `
        <button class="mood-btn" data-mood="${mood.id}" title="${mood.description}" style="
          background: ${mood.id === system.currentMood ? 'rgba(74, 158, 255, 0.3)' : 'rgba(40, 40, 60, 0.5)'};
          border: 1px solid ${mood.id === system.currentMood ? 'rgba(74, 158, 255, 0.5)' : 'rgba(60, 60, 80, 0.5)'};
          border-radius: 8px;
          padding: 10px 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        ">
          <span style="font-size: 20px;">${mood.icon}</span>
          <span style="font-size: 9px; color: ${mood.id === system.currentMood ? '#fff' : '#888'};">${mood.name}</span>
        </button>
      `).join('')}
    </div>
  `;

  system.container.appendChild(selector);
  system.selector = selector;

  // Animate in
  requestAnimationFrame(() => {
    selector.style.opacity = '1';
    selector.style.transform = 'translateY(0)';
  });

  // Wire up mood buttons
  setTimeout(() => {
    const buttons = selector.querySelectorAll('.mood-btn');
    buttons.forEach(btn => {
      (btn as HTMLElement).onmouseover = () => {
        if ((btn as HTMLElement).dataset.mood !== system.currentMood) {
          (btn as HTMLElement).style.background = 'rgba(60, 60, 80, 0.5)';
        }
      };
      (btn as HTMLElement).onmouseout = () => {
        if ((btn as HTMLElement).dataset.mood !== system.currentMood) {
          (btn as HTMLElement).style.background = 'rgba(40, 40, 60, 0.5)';
        }
      };
      (btn as HTMLElement).onclick = () => {
        const moodId = (btn as HTMLElement).dataset.mood || 'default';
        applyMood(system, moodId);
        updateSelectorStyles(system);
        updateIndicator(system);
      };
    });
  }, 0);

  // Close on click outside or Escape
  const closeHandler = (e: MouseEvent | KeyboardEvent) => {
    if (e instanceof KeyboardEvent) {
      if (e.key === 'Escape') {
        closeMoodSelector(system);
        document.removeEventListener('keydown', closeHandler as EventListener);
      }
    } else if (e instanceof MouseEvent) {
      if (!selector.contains(e.target as Node) && e.target !== system.indicator) {
        closeMoodSelector(system);
        document.removeEventListener('click', closeHandler as EventListener);
      }
    }
  };

  setTimeout(() => {
    document.addEventListener('click', closeHandler as EventListener);
    document.addEventListener('keydown', closeHandler as EventListener);
  }, 100);
}

/**
 * Close the mood selector
 */
function closeMoodSelector(system: MoodSystem): void {
  if (!system.selector) return;

  system.selector.style.opacity = '0';
  system.selector.style.transform = 'translateY(10px)';
  const selector = system.selector;

  setTimeout(() => {
    selector.remove();
    if (system.selector === selector) {
      system.selector = null;
    }
  }, 300);
}

/**
 * Apply a mood to the scene
 */
export function applyMood(system: MoodSystem, moodId: string): void {
  const mood = MOODS.find(m => m.id === moodId);
  if (!mood) return;

  system.currentMood = moodId;

  // Update ambient light
  const ambientLight = system.scene.children.find(c => c instanceof THREE.AmbientLight) as THREE.AmbientLight | undefined;
  if (ambientLight) {
    ambientLight.color.setHex(mood.ambientColor);
  }

  // Update fog
  if (system.scene.fog instanceof THREE.FogExp2) {
    system.scene.fog.color.setHex(mood.fogColor);
    system.scene.fog.density = mood.fogDensity;
  }

  // Update canvas filter
  const canvas = system.container.querySelector('canvas');
  if (canvas) {
    canvas.style.filter = mood.filter;
  }
}

/**
 * Update the selector button styles
 */
function updateSelectorStyles(system: MoodSystem): void {
  if (!system.selector) return;

  const buttons = system.selector.querySelectorAll('.mood-btn');
  buttons.forEach(btn => {
    const isSelected = (btn as HTMLElement).dataset.mood === system.currentMood;
    (btn as HTMLElement).style.background = isSelected ? 'rgba(74, 158, 255, 0.3)' : 'rgba(40, 40, 60, 0.5)';
    (btn as HTMLElement).style.borderColor = isSelected ? 'rgba(74, 158, 255, 0.5)' : 'rgba(60, 60, 80, 0.5)';

    const nameSpan = btn.querySelector('span:last-child') as HTMLElement;
    if (nameSpan) {
      nameSpan.style.color = isSelected ? '#fff' : '#888';
    }
  });
}

/**
 * Update the mood indicator
 */
function updateIndicator(system: MoodSystem): void {
  if (!system.indicator) return;

  const mood = MOODS.find(m => m.id === system.currentMood) || MOODS[0];
  system.indicator.innerHTML = `<span style="margin-right: 4px;">${mood.icon}</span> ${mood.name}`;
}

/**
 * Get current mood
 */
export function getCurrentMood(system: MoodSystem): string {
  return system.currentMood;
}

/**
 * Get all available moods
 */
export function getAllMoods(): Mood[] {
  return MOODS;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeMoodSystem(system: MoodSystem): void {
  system.cleanup();
}
