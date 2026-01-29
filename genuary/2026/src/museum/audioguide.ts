/**
 * Audio Guide
 *
 * Text-to-speech narration for exhibits,
 * providing an accessible audio tour experience.
 */

// ============================================================================
// Types
// ============================================================================

export interface ExhibitNarration {
  title: string;
  description: string;
  technique: string;
}

export interface AudioGuideSystem {
  container: HTMLElement;
  isSpeaking: boolean;
  utterance: SpeechSynthesisUtterance | null;
  indicator: HTMLElement | null;
  enabled: boolean;
  cleanup: () => void;
}

// ============================================================================
// Narration Database
// ============================================================================

const NARRATIONS: Record<number, ExhibitNarration> = {
  1: {
    title: 'Day 1: Vertical',
    description: 'This piece explores vertical rhythm through simple lines. The artist uses minimal elements to create a sense of depth and movement.',
    technique: 'Created using linear gradients and carefully positioned vertical strokes.',
  },
  3: {
    title: 'Day 3: Exactly 42',
    description: 'A meditation on the number 42, the answer to life, the universe, and everything. Each element in this work relates to this cosmic number.',
    technique: 'Geometric patterns constrained by the number 42 in various ways.',
  },
  5: {
    title: 'Day 5: Isometric',
    description: 'An isometric perspective creates impossible spaces that trick the eye. This work plays with our perception of three-dimensional space.',
    technique: 'Isometric projection with careful attention to light and shadow.',
  },
  7: {
    title: 'Day 7: Use OP',
    description: 'Op Art, short for Optical Art, creates visual illusions through precise patterns. This piece demonstrates how simple shapes can produce complex visual effects.',
    technique: 'Boolean operations combining geometric shapes create optical interference patterns.',
  },
  10: {
    title: 'Day 10: You Can Only Move',
    description: 'Movement becomes the entire language of this piece. Every visual element responds to motion, creating a dynamic conversation between viewer and artwork.',
    technique: 'Particle systems that flow through force fields created by noise functions.',
  },
  11: {
    title: 'Day 11: Impossible Objects',
    description: 'Inspired by artists like M.C. Escher, this piece constructs objects that cannot exist in our three-dimensional world.',
    technique: '3D rendering techniques used to create visual paradoxes.',
  },
  12: {
    title: 'Day 12: Subdivision',
    description: 'Starting from simple shapes, this work progressively divides space into increasingly complex patterns, revealing beauty in mathematical recursion.',
    technique: 'Recursive subdivision algorithms applied to geometric forms.',
  },
  19: {
    title: 'Day 19: Pixelated',
    description: 'A celebration of the pixel, the fundamental unit of digital imagery. This work embraces low-resolution aesthetics as an art form.',
    technique: 'Deliberate pixelation and dithering techniques create retro-digital aesthetics.',
  },
  23: {
    title: 'Day 23: More Is Not More',
    description: 'This maximalist piece challenges the viewer with layered complexity. Sometimes more truly becomes more when each element serves a purpose.',
    technique: 'Multiple generative systems layered together to create rich visual density.',
  },
  24: {
    title: 'Day 24: Less Is Not Less',
    description: 'In contrast to yesterday, this minimalist work proves that simplicity can be equally powerful. Each element is essential.',
    technique: 'Constraint-based design where every mark must justify its existence.',
  },
  26: {
    title: 'Day 26: Symmetry',
    description: 'Symmetry has fascinated humans since ancient times. This piece explores how mirrored forms create harmony and visual balance.',
    technique: 'Reflection algorithms create bilateral and rotational symmetries.',
  },
  27: {
    title: 'Day 27: Organic Growth',
    description: 'Nature grows through simple rules applied repeatedly. This work simulates plant growth patterns using algorithmic branching.',
    technique: 'L-systems and recursive branching create organic, plant-like forms.',
  },
};

// Default narration for days without specific content
const DEFAULT_NARRATION: ExhibitNarration = {
  title: 'Generative Art',
  description: 'This piece is part of Genuary 2026, a month-long celebration of creative coding. Each day presents a new prompt, challenging artists to explore different aspects of generative art.',
  technique: 'Created using algorithms, randomness, and careful parameter tuning.',
};

// ============================================================================
// Audio Guide System Creation
// ============================================================================

/**
 * Create the audio guide system
 */
export function createAudioGuideSystem(container: HTMLElement): AudioGuideSystem {
  const system: AudioGuideSystem = {
    container,
    isSpeaking: false,
    utterance: null,
    indicator: null,
    enabled: true,
    cleanup: () => {
      stopNarration(system);
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
    },
  };

  // Create indicator
  createIndicator(system);

  return system;
}

/**
 * Create the audio guide indicator
 */
function createIndicator(system: AudioGuideSystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'audioguide-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 20px;
    background: rgba(20, 20, 30, 0.9);
    border: 1px solid rgba(100, 200, 100, 0.3);
    border-radius: 25px;
    padding: 8px 14px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: #a0d0a0;
    z-index: 400;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  indicator.innerHTML = `
    <span style="font-size: 16px;">🎧</span>
    <span>Audio Guide</span>
  `;
  indicator.title = 'Click to toggle audio guide (Shift+A)';

  indicator.onclick = () => {
    system.enabled = !system.enabled;
    updateIndicator(system);
    if (!system.enabled && system.isSpeaking) {
      stopNarration(system);
    }
  };

  indicator.onmouseover = () => {
    indicator.style.borderColor = 'rgba(100, 200, 100, 0.6)';
  };
  indicator.onmouseout = () => {
    indicator.style.borderColor = 'rgba(100, 200, 100, 0.3)';
  };

  system.container.appendChild(indicator);
  system.indicator = indicator;
}

/**
 * Update indicator appearance
 */
function updateIndicator(system: AudioGuideSystem): void {
  if (!system.indicator) return;

  if (system.enabled) {
    system.indicator.style.opacity = '1';
    system.indicator.innerHTML = `
      <span style="font-size: 16px;">🎧</span>
      <span>${system.isSpeaking ? 'Speaking...' : 'Audio Guide'}</span>
    `;
  } else {
    system.indicator.style.opacity = '0.5';
    system.indicator.innerHTML = `
      <span style="font-size: 16px;">🔇</span>
      <span>Audio Off</span>
    `;
  }
}

/**
 * Speak narration for an exhibit
 */
export function speakNarration(system: AudioGuideSystem, dayNumber: number): void {
  if (!system.enabled) return;
  if (!('speechSynthesis' in window)) return;

  // Stop any current narration
  stopNarration(system);

  const narration = NARRATIONS[dayNumber] || {
    ...DEFAULT_NARRATION,
    title: `Day ${dayNumber}`,
  };

  const text = `${narration.title}. ${narration.description} ${narration.technique}`;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 0.8;

  // Try to use a good voice
  const voices = speechSynthesis.getVoices();
  const preferredVoice = voices.find(v =>
    v.name.includes('Google') ||
    v.name.includes('Microsoft') ||
    v.name.includes('Natural')
  );
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => {
    system.isSpeaking = true;
    updateIndicator(system);
  };

  utterance.onend = () => {
    system.isSpeaking = false;
    system.utterance = null;
    updateIndicator(system);
  };

  utterance.onerror = () => {
    system.isSpeaking = false;
    system.utterance = null;
    updateIndicator(system);
  };

  system.utterance = utterance;
  speechSynthesis.speak(utterance);
}

/**
 * Stop current narration
 */
export function stopNarration(system: AudioGuideSystem): void {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  system.isSpeaking = false;
  system.utterance = null;
  updateIndicator(system);
}

/**
 * Toggle audio guide enabled state
 */
export function toggleAudioGuide(system: AudioGuideSystem): void {
  system.enabled = !system.enabled;
  updateIndicator(system);

  if (!system.enabled && system.isSpeaking) {
    stopNarration(system);
  }
}

/**
 * Get narration text for an exhibit
 */
export function getNarrationText(dayNumber: number): ExhibitNarration {
  return NARRATIONS[dayNumber] || {
    ...DEFAULT_NARRATION,
    title: `Day ${dayNumber}`,
  };
}

/**
 * Check if speech synthesis is available
 */
export function isSpeechAvailable(): boolean {
  return 'speechSynthesis' in window;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeAudioGuideSystem(system: AudioGuideSystem): void {
  system.cleanup();
}
