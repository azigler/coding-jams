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

function nextAssignment(
  current: ConversationId | null,
  convs: { id: ConversationId }[],
): ConversationId | null {
  const order = convs.map((c) => c.id);
  if (current == null) return order[0] ?? null;
  const idx = order.indexOf(current);
  if (idx === -1 || idx === order.length - 1) return null;
  return order[idx + 1] ?? null;
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

function cycleLine(lineId: number) {
  if (state.solved) return;
  const level = currentLevel();
  const current = state.assignments.get(lineId) ?? null;
  const next = nextAssignment(current, level.conversations);
  state.assignments.set(lineId, next);
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
      onCycle: cycleLine,
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
