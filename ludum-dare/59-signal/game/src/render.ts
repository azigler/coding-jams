import { END_CARD, LEVELS } from './levels';
import type { ConversationId, GameState, Level } from './types';

// --- Asset feature detection ---------------------------------------------
// At startup we probe for optional pixel-art drops from Zig. Results are
// cached so render passes don't re-probe. If the file is missing we simply
// fall back to CSS-only styling.

const assetCache = new Map<string, boolean>();

function probeAsset(path: string): Promise<boolean> {
  const cached = assetCache.get(path);
  if (cached !== undefined) return Promise.resolve(cached);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      assetCache.set(path, true);
      resolve(true);
    };
    img.onerror = () => {
      assetCache.set(path, false);
      resolve(false);
    };
    img.src = path;
  });
}

export async function warmAssetCache() {
  const candidates = [
    'assets/title.png',
    'assets/end-ornament.png',
    'assets/paper-texture.png',
  ];
  const levelIcons = new Set<string>();
  for (const level of LEVELS) {
    for (const c of level.conversations) {
      if (c.icon) levelIcons.add(`assets/speaker-${c.icon}-mask.png`);
    }
  }
  await Promise.all(
    [...candidates, ...levelIcons].map((p) =>
      probeAsset(withBase(p)).catch(() => false),
    ),
  );
}

function withBase(path: string): string {
  // Vite injects import.meta.env.BASE_URL at build time. Use it so GH Pages
  // sub-paths resolve correctly.
  const base = import.meta.env.BASE_URL || '/';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function hasAsset(path: string): boolean {
  return assetCache.get(withBase(path)) === true;
}

// --- DOM helpers ---------------------------------------------------------

type El = HTMLElement;

function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: {
    class?: string;
    text?: string;
    html?: string;
    attrs?: Record<string, string>;
    children?: (HTMLElement | string | null | undefined)[];
  } = {},
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (opts.class) el.className = opts.class;
  if (opts.text !== undefined) el.textContent = opts.text;
  if (opts.html !== undefined) el.innerHTML = opts.html;
  if (opts.attrs) {
    for (const [k, v] of Object.entries(opts.attrs)) el.setAttribute(k, v);
  }
  if (opts.children) {
    for (const c of opts.children) {
      if (c == null) continue;
      if (typeof c === 'string') el.appendChild(document.createTextNode(c));
      else el.appendChild(c);
    }
  }
  return el;
}

// --- Shared chrome -------------------------------------------------------

function muteButton(state: GameState, onToggle: () => void): HTMLButtonElement {
  const btn = h('button', {
    class: 'mute',
    text: state.muted ? 'sound off' : 'sound on',
    attrs: {
      type: 'button',
      'aria-pressed': state.muted ? 'true' : 'false',
      'aria-label': state.muted ? 'Unmute sound' : 'Mute sound',
      title: state.muted ? 'Sound off (click to enable)' : 'Sound on',
    },
  });
  btn.addEventListener('click', onToggle);
  return btn;
}

// --- Menu ---------------------------------------------------------------

export function renderMenu(
  root: El,
  state: GameState,
  opts: { onStart: () => void; onMuteToggle: () => void },
) {
  root.className = 'screen screen-menu';
  root.replaceChildren();

  const header = h('div', {
    class: 'menu-chrome',
    children: [muteButton(state, opts.onMuteToggle)],
  });

  const card = h('section', { class: 'menu-card' });

  const titleImg = hasAsset('assets/title.png')
    ? h('img', {
        class: 'title-illustration',
        attrs: {
          src: withBase('assets/title.png'),
          alt: 'A switchboard operator at her panel, lit by a single overhead lamp.',
          width: '320',
          height: '240',
        },
      })
    : h('div', {
        class: 'title-illustration title-illustration--fallback',
        attrs: { 'aria-hidden': 'true' },
        children: [
          h('div', { class: 'title-flourish' }),
          h('div', { class: 'title-flourish title-flourish--mirror' }),
        ],
      });

  const title = h('h1', { class: 'display-title', text: 'CROSSED WIRES' });
  const sub = h('p', {
    class: 'display-sub',
    text: 'One shift. Five calls. Most of them crossed.',
  });

  const startBtn = h('button', {
    class: 'btn btn-primary btn-start',
    text: 'Start shift',
    attrs: { type: 'button' },
  });
  startBtn.addEventListener('click', opts.onStart);

  card.append(titleImg, title, sub, startBtn);

  const footer = h('footer', {
    class: 'menu-footer',
    text: 'Ludum Dare 59 · theme: Signal',
  });

  root.append(header, card, footer);

  // Move focus to Start for keyboard players.
  queueMicrotask(() => startBtn.focus());
}

// --- Level -------------------------------------------------------------

type LevelHandlers = {
  onAssign: (lineId: number, conv: ConversationId | null) => void;
  onConnect: () => void;
  onAdvance: () => void;
  onMuteToggle: () => void;
};

export function renderLevel(
  root: El,
  level: Level,
  state: GameState,
  handlers: LevelHandlers,
) {
  root.className = 'screen screen-level';
  root.replaceChildren();

  // --- Header / progress ---
  const shiftLabel = h('p', {
    class: 'shift-label',
    text: `Shift ${level.id} of ${LEVELS.length}`,
  });
  const title = h('h2', {
    class: 'display-title display-title--level',
    text: level.title,
  });
  const epigraph = level.epigraph
    ? h('p', { class: 'level-epigraph', text: `\u201C${level.epigraph}\u201D` })
    : null;

  const chromeRight = h('div', {
    class: 'level-chrome',
    children: [muteButton(state, handlers.onMuteToggle)],
  });

  const header = h('header', {
    class: 'level-header',
    children: [
      h('div', {
        class: 'level-header-left',
        children: [shiftLabel, title, epigraph],
      }),
      chromeRight,
    ],
  });

  // --- Transcript (puzzle mode) OR grouped (solved view) ---
  const body = h('div', { class: 'level-body' });
  if (!state.solved) {
    body.append(renderTranscript(level, state, handlers));
  } else {
    body.append(renderGrouped(level));
  }

  // --- Legend ---
  const legend = renderLegend(level, state);

  // --- Actions ---
  const actions = h('div', { class: 'level-actions' });
  if (!state.solved) {
    const allAssigned = level.lines.every(
      (l) => state.assignments.get(l.id) != null,
    );
    const connect = h('button', {
      class: 'btn btn-primary btn-connect',
      text: 'Connect',
      attrs: {
        type: 'button',
        ...(allAssigned ? {} : { disabled: 'true' }),
      },
    });
    connect.addEventListener('click', handlers.onConnect);
    actions.append(connect);
  } else {
    const isLast = state.levelIndex >= LEVELS.length - 1;
    const next = h('button', {
      class: 'btn btn-primary btn-next',
      text: isLast ? 'Finish shift' : 'Next shift \u2192',
      attrs: { type: 'button' },
    });
    next.addEventListener('click', handlers.onAdvance);
    actions.append(next);
    if (level.postamble) {
      const post = h('blockquote', {
        class: 'postamble',
      });
      for (const para of level.postamble.split('\n\n')) {
        post.appendChild(h('p', { text: para }));
      }
      body.appendChild(post);
    }
  }

  root.append(header, legend, body, actions);
}

function renderLegend(level: Level, state: GameState): El {
  const ul = h('ul', {
    class: 'legend',
    attrs: { 'aria-label': 'Conversations' },
  });
  for (const c of level.conversations) {
    const li = h('li', { class: `legend-item legend-${c.id}` });
    const swatch = h('span', {
      class: 'legend-swatch',
      attrs: { 'aria-hidden': 'true' },
    });
    swatch.style.setProperty('--swatch', `var(--conv-${c.id.toLowerCase()})`);
    const iconPath = c.icon ? `assets/speaker-${c.icon}-mask.png` : null;
    if (iconPath && hasAsset(iconPath)) {
      const icon = h('span', {
        class: 'legend-icon',
        attrs: { 'aria-hidden': 'true' },
      });
      icon.style.setProperty('--icon', `url('${withBase(iconPath)}')`);
      icon.style.setProperty(
        '--icon-color',
        `var(--conv-${c.id.toLowerCase()})`,
      );
      li.append(icon, h('span', { text: c.label }));
    } else {
      li.append(swatch, h('span', { text: c.label }));
    }
    const count = countAssigned(state, c.id);
    if (count > 0) {
      li.appendChild(
        h('span', {
          class: 'legend-count',
          text: ` (${count})`,
          attrs: { 'aria-hidden': 'true' },
        }),
      );
    }
    ul.appendChild(li);
  }
  // Unassigned tally helps the player see remaining work.
  const unassigned = level.lines.filter(
    (l) => state.assignments.get(l.id) == null,
  ).length;
  if (unassigned > 0 && !state.solved) {
    const li = h('li', {
      class: 'legend-item legend-unassigned',
      children: [
        h('span', {
          class: 'legend-swatch legend-swatch--unassigned',
          attrs: { 'aria-hidden': 'true' },
        }),
        h('span', { text: `${unassigned} unassigned` }),
      ],
    });
    ul.appendChild(li);
  }
  return ul;
}

function countAssigned(state: GameState, conv: ConversationId): number {
  let n = 0;
  for (const v of state.assignments.values()) {
    if (v === conv) n += 1;
  }
  return n;
}

function renderTranscript(
  level: Level,
  state: GameState,
  handlers: LevelHandlers,
): El {
  const list = h('ol', {
    class: 'transcript',
    attrs: { 'aria-label': 'Tangled transcript' },
  });
  for (const line of level.lines) {
    const assigned = state.assignments.get(line.id) ?? null;
    const li = h('li', {
      class: `line-item${assigned ? ` line-item--${assigned.toLowerCase()}` : ''}`,
      attrs: { 'data-line-id': String(line.id) },
    });

    // Picker: one jack-plug button per conversation, plus an unplug.
    const picker = h('div', {
      class: 'picker',
      attrs: { role: 'group', 'aria-label': `Assign line ${line.id}` },
    });
    for (const conv of level.conversations) {
      const isOn = assigned === conv.id;
      const iconPath = conv.icon
        ? `assets/speaker-${conv.icon}-mask.png`
        : null;
      const useIcon = iconPath && hasAsset(iconPath);
      const pick = h('button', {
        class: `pick pick--${conv.id.toLowerCase()}${isOn ? ' is-on' : ''}${useIcon ? ' pick--icon' : ''}`,
        attrs: {
          type: 'button',
          'aria-pressed': isOn ? 'true' : 'false',
          'aria-label': isOn
            ? `Unassign from ${conv.label}`
            : `Assign to ${conv.label}`,
        },
      });
      pick.style.setProperty(
        '--pick-color',
        `var(--conv-${conv.id.toLowerCase()})`,
      );
      if (useIcon && iconPath) {
        const iconSpan = h('span', {
          class: 'pick-icon',
          attrs: { 'aria-hidden': 'true' },
        });
        iconSpan.style.setProperty(
          '--icon-url',
          `url('${withBase(iconPath)}')`,
        );
        pick.appendChild(iconSpan);
        pick.appendChild(h('span', { class: 'sr-only', text: conv.id }));
      } else {
        pick.textContent = conv.id;
      }
      pick.addEventListener('click', () => {
        handlers.onAssign(line.id, isOn ? null : conv.id);
      });
      picker.appendChild(pick);
    }

    const text = h('p', { class: 'line-text', text: line.text });

    li.append(picker, text);
    list.appendChild(li);
  }
  return list;
}

function renderGrouped(level: Level): El {
  const wrapper = h('div', { class: 'grouped' });
  for (const conv of level.conversations) {
    const group = h('section', {
      class: `group group--${conv.id.toLowerCase()}`,
    });
    group.style.setProperty(
      '--group-color',
      `var(--conv-${conv.id.toLowerCase()})`,
    );
    const head = h('h3', { class: 'group-label', text: conv.label });
    group.appendChild(head);
    const block = h('div', { class: 'group-block' });
    for (const line of level.lines.filter((l) => l.owner === conv.id)) {
      block.appendChild(h('p', { class: 'group-line', text: line.text }));
    }
    group.appendChild(block);
    wrapper.appendChild(group);
  }
  return wrapper;
}

// --- End screen --------------------------------------------------------

export function renderEnd(
  root: El,
  state: GameState,
  opts: { onReplay: () => void; onMuteToggle: () => void },
) {
  root.className = 'screen screen-end';
  root.replaceChildren();

  const chrome = h('div', {
    class: 'menu-chrome',
    children: [muteButton(state, opts.onMuteToggle)],
  });

  const card = h('section', { class: 'end-card' });

  const hasOrnament = hasAsset('assets/end-ornament.png');
  const ornament = hasOrnament
    ? h('span', {
        class: 'end-ornament',
        attrs: { 'aria-hidden': 'true' },
      })
    : h('span', {
        class: 'end-ornament end-ornament--fallback',
        text: '\u273F',
        attrs: { 'aria-hidden': 'true' },
      });
  if (hasOrnament) {
    ornament.style.setProperty(
      '--icon',
      `url('${withBase('assets/end-ornament.png')}')`,
    );
    ornament.style.setProperty('--icon-color', 'var(--ink)');
  }

  // Level 5 postamble, then end card.
  const lastLevel = LEVELS[LEVELS.length - 1];
  const postWrap = h('blockquote', { class: 'postamble postamble--end' });
  if (lastLevel?.postamble) {
    for (const para of lastLevel.postamble.split('\n\n')) {
      postWrap.appendChild(h('p', { text: para }));
    }
  }

  const thanks = h('p', { class: 'end-top', text: END_CARD.top });
  const sig = h('p', { class: 'end-bottom', text: END_CARD.bottom });

  const replay = h('button', {
    class: 'btn btn-ghost btn-replay',
    text: 'Play again',
    attrs: { type: 'button' },
  });
  replay.addEventListener('click', opts.onReplay);

  card.append(ornament, postWrap, thanks, sig, replay);
  root.append(chrome, card);
  queueMicrotask(() => replay.focus());
}

// --- Wrong-flash helper ------------------------------------------------

export function flashWrongLines(root: El, wrongLineIds: number[]) {
  for (const id of wrongLineIds) {
    const row = root.querySelector<HTMLElement>(`[data-line-id="${id}"]`);
    if (!row) continue;
    row.classList.remove('is-wrong');
    // Re-trigger animation by forcing reflow.
    void row.offsetWidth;
    row.classList.add('is-wrong');
  }
}
