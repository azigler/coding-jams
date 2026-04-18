# LD59 — "Signal"

Ludum Dare 59 jam entry. Solo entry by [zigtalk](https://ldjam.com/users/zigtalk).
Theme locked **Apr 2026**: **Signal**. Weekend scope (~72h).

> This file is the cross-cutting agent identity for the jam. When you work
> deep in a subfolder (e.g. `src/`, `specs/`), check whether that folder has
> its own scoped `CLAUDE.md` — the local one is load-bearing context; this
> root is the shared identity.

## What we're building

**TBD — we are in concept lock.** Zig is brainstorming radio/space directions
but hasn't committed. See `.claude/plans/brainstorm.md` for current options.

Hard constraints, regardless of direction:
- **Playable in a browser.** No installs, no native, no logins. Judges get a URL.
- **72-hour window.** Scope ruthlessly — one mechanic, one vibe, shipped.
- **Originality and taste.** No AI-slop surface — visual / audio / copy should feel
  bespoke, like it came out of a specific human weekend.
- **Signal theme, interpreted tightly.** A game that loosely waves at the theme
  loses the category. Integrate the theme into a mechanic, not just flavor.

## Roles

- **Zig (human):** director, designer, reviewer. Brainstorms, picks the
  direction, writes micro-blog devlog posts, plays and critiques each build.
  Runs dev servers. Makes taste calls.
- **Claude (orchestrator, this session):** scaffolds, dispatches subagents, owns
  bead lifecycle, drafts devlogs, runs non-interactive tooling.
- **Claude subagents (worktree):** implement individual beads in isolation, write
  tests, land commits. Never spawn further subagents.

## Working style

- **Zig runs dev servers.** Never start a long-running `bun dev` / `vite` from
  here — ask Zig to run it and open it.
- **Read before writing.** Orient yourself with the existing `specs/` and
  `devlog/` before modifying.
- **One mechanic at a time.** If a build has a bug, fix it before adding the next
  thing. No half-finished features.
- **Taste over features.** A smaller, tighter, weirder game beats a bigger
  generic one.
- **Commit after every merge.** Push only when Zig asks.

## Pipeline (skills)

Standard LB skill loop, lightly adapted for a 72h jam:

```
brainstorm → spec → (review) → test → impl → branch → release
                                        ↑             │
                                        └── devlog ←──┘
```

- `/orient` — run at every session start; classifies where we are in the jam
- `/spec` — lock a mechanic or subsystem spec before building
- `/review` — resolve open questions
- `/test` — TDD where it helps (logic systems); skip for pure visual/audio tweaks
- `/impl` — build
- `/branch` — branch/merge/tag
- `/release` — cut the submission build (final only on deadline day)
- `/commit` — gitmoji + bead trailer
- `/beads` — task tracking reference
- `/lint` — linter policy
- `/zig-voice` — Zig's voice for devlog posts

Skills are local copies in `.claude/skills/` — customize freely, the originals
are in `~/lb-skills`.

## Devlog workflow

Ludum Dare submissions benefit from a visible devlog on the jam site. Zig will
want to post short updates (with screenshots) over the 72 hours.

- Drafts land in `devlog/YYYY-MM-DD-HHmm-slug.md` (local + committed).
- Screenshots go in `screenshots/`, referenced from drafts.
- Publishing to ldjam.com goes through `.claude/skills/ldjam/` — that skill
  handles login, draft post, and publish via `api.ldjam.com`.
- Follow the zig-voice skill for tone. Short, specific, no generic hype.

## Structure

```
59-signal/
├── CLAUDE.md              # this file — jam identity
├── README.md              # public-facing (links to jam entry once live)
├── .gitignore
├── .claude/
│   ├── skills/            # local copies of skills — customize freely
│   ├── hooks/             # lifecycle / lint / commit hooks
│   ├── agents/            # custom subagent definitions (if any)
│   ├── plans/             # brainstorm + specs in progress
│   ├── refs/              # jam rules, theme notes, inspirational games
│   ├── settings.json      # local hook wiring
│   └── .ldjam-session     # gitignored — cached SIDS cookie
├── .beads/                # bead tracking
├── specs/                 # locked-down specs, one per subsystem
├── devlog/                # micro-blog drafts
├── screenshots/           # devlog + submission assets
└── <game code TBD>        # stack picked after concept lock
```

## Tech stack options (not yet locked)

Zig will choose after brainstorm. Likely candidates:
- **Phaser 3 + Bun + Vite** — what LD57 used; fast start, arcade-friendly
- **PixiJS + Bun + Vite** — more flexible rendering, better for weird visuals
- **Plain Canvas + Bun + Vite** — lightest, best for handcrafted visual identity
- **Text-mode / HTML-DOM** — if the concept leans interactive-fiction or puzzle

Constraint: must deploy to a static host (GitHub Pages / Vercel / Netlify) as
a single URL with no backend. Rule out anything that requires a server.

## Jam logistics

- **Event page:** https://ldjam.com/events/ludum-dare/59
- **Zig's profile:** https://ldjam.com/users/zigtalk
- **Theme:** Signal (locked)
- **Category:** Jam (not Compo — AI assistance allowed)
- **Submission:** single URL to the playable build + source repo + short writeup

## Beads

Orchestrator owns the full lifecycle — create, claim, close, commit bead state.
Subagents reference bead IDs in commit trailers only; never run `br update` /
`br close`. See `~/.claude/CLAUDE.md` for the full orchestrator protocol.

```bash
br create -p 2 "scope: title"
br update <id> --status=in_progress
br close <id>
git add .beads/issues.jsonl && git commit -m ":card_file_box: beads: close <id>"
```

<!-- br-agent-instructions-v1 -->
