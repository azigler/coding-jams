import { audio } from './audio';
import { LEVELS } from './levels';
import {
  flashWrongLines,
  renderEnd,
  renderLevel,
  renderMenu,
  warmAssetCache,
} from './render';
import type { ConversationId, GameState, Screen } from './types';

const rootEl = document.getElementById('app');
if (!rootEl) throw new Error('app root missing');
const root: HTMLElement = rootEl;

let screen: Screen = 'menu';
const state: GameState = {
  levelIndex: 0,
  assignments: new Map(),
  solved: false,
  muted: audio.muted,
};

function currentLevel() {
  return LEVELS[state.levelIndex];
}

function resetAssignments() {
  state.assignments = new Map();
  for (const l of currentLevel().lines) state.assignments.set(l.id, null);
}

function startShift() {
  state.levelIndex = 0;
  state.solved = false;
  resetAssignments();
  screen = 'level';
  audio.play('page');
  paint();
}

function assignLine(lineId: number, conv: ConversationId | null) {
  if (state.solved) return;
  state.assignments.set(lineId, conv);
  audio.play('click');
  paint();
}

function connect() {
  const level = currentLevel();
  const wrong: number[] = [];
  for (const line of level.lines) {
    if (state.assignments.get(line.id) !== line.owner) wrong.push(line.id);
  }
  if (wrong.length === 0) {
    state.solved = true;
    audio.play('right');
    paint();
  } else {
    audio.play('wrong');
    flashWrongLines(root, wrong);
  }
}

function advance() {
  if (state.levelIndex >= LEVELS.length - 1) {
    screen = 'end';
    audio.play('page');
    paint();
    return;
  }
  state.levelIndex += 1;
  state.solved = false;
  resetAssignments();
  audio.play('page');
  paint();
}

function toggleMute() {
  state.muted = audio.toggleMute();
  paint();
}

function replay() {
  startShift();
}

function paint() {
  if (screen === 'menu') {
    renderMenu(root, state, { onStart: startShift, onMuteToggle: toggleMute });
  } else if (screen === 'level') {
    renderLevel(root, currentLevel(), state, {
      onAssign: assignLine,
      onConnect: connect,
      onAdvance: advance,
      onMuteToggle: toggleMute,
    });
  } else {
    renderEnd(root, state, { onReplay: replay, onMuteToggle: toggleMute });
  }
}

// First-gesture audio init (iOS/Safari autoplay policy)
function unlockAudioOnce() {
  audio.init();
  document.removeEventListener('pointerdown', unlockAudioOnce);
  document.removeEventListener('keydown', unlockAudioOnce);
}
document.addEventListener('pointerdown', unlockAudioOnce, { once: true });
document.addEventListener('keydown', unlockAudioOnce, { once: true });

// Kick off: probe optional assets in parallel, paint immediately.
warmAssetCache().then(() => {
  // Re-paint after asset probes so icons/illustration slot in if present.
  paint();
});

paint();
