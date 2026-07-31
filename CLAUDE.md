# coding-jams

Umbrella for time-boxed creative exercises with a shipping deliverable.

## What this is

`~/coding-jams/` is the home for **jams**: hackathons, daily-prompt challenges,
game-jam weekends, livestream events, hackdays. Every child here was (or will
be) an event with a clock and a public submission. The umbrella exists so a
single agent invocation can navigate cleanly between past and current jams,
share reusable templates, and apply jam-flavored practices consistently.

Each child is its own atomic unit (its own submodule, its own remote, its own
`CLAUDE.md`) because jams ship as standalone artifacts that get judged,
graded, or published. Don't fold a jam's history into this umbrella — keep
it independent.

## Children

Organized as `<host-org>/<event-or-track>/<repo>`:

| Path | Host | What it is |
|---|---|---|
| `advent-of-code/` | Eric Wastl | Daily December puzzles |
| `adventjs/` | midudev | Daily JS puzzles (Advent variant) |
| `block/vibe-with-us-livestream` | Block (Square) | Livestream hackathon |
| `codetv/web-dev-challenge/unconventional-interfaces` | CodeTV | Web dev challenge |
| `genuary/` | Genuary org | Generative-art prompts (January) |
| `google/hackathon-gemma` | Google | Gemma hackathon (model + app + paper + video + spec) |
| `ifcomp/2026` | IFComp | Interactive fiction competition — `ifcompd`, a headless Inform 7 build/test harness (agent codes, human writes) |
| `intrinsic/aic` | Intrinsic Dev | AI Challenge hackathon |
| `ludum-dare/59-signal` | Ludum Dare org | 48hr game jam |
| `the-atlantic/hackathon-infactory` | The Atlantic | Hackathon → article drafts → VibeX paper (`~/cfp/mise/`) |
| `theory-ventures/antm-hackathon/antm` | Theory Ventures | ANTM hackathon |
| `warp-coding-with-zach/partykit-quiz-game` | Warp + Zach | Live coding event |

All children that are git repos are submodules. `git submodule status` shows
which are currently initialized in this checkout.

## The practice

See [`.claude/practices.md`](.claude/practices.md) for the full jam practice
spec. The short version:

1. **Time-box first.** Every jam has a deadline. Even daily prompts have a
   24-hour clock. The clock shapes everything else.
2. **Submission-driven.** A jam isn't done until something is *submitted* —
   uploaded, posted, presented. Working code without a submission is
   incomplete work.
3. **Multi-artifact deliverables are normal.** A hackathon may produce code +
   paper + video + slides + post-event writeup. See `google/hackathon-gemma/`
   for the canonical 5-track layout (`model/`, `app/`, `paper/`, `video/`,
   `spec/`).
4. **Drafts are first-class.** Article drafts, image prompts, slide outlines
   live alongside code, often untracked or in `.claude/research/`. They are
   the secondary deliverables of the jam.
5. **Worktree subagents for parallelism.** When the clock is tight, dispatch
   parallel agents per track. See the global `/orchestrator` skill.
6. **Post-jam → /cfp arc is optional.** A jam that's worth more than its
   submission can become a CFP/paper/talk via the `/cfp` skill. Reference
   path: `the-atlantic/hackathon-infactory/` → `~/cfp/mise/` → VibeX 2026.

## Routing

| When you're... | Go here |
|---|---|
| Working inside a specific jam | That child's `CLAUDE.md` |
| Starting a new jam | `.claude/templates/new-jam/` (TODO: create when first new jam fires) |
| Looking up "what did I do during X jam" | The child's `.beads/` + commit history |
| Planning meta-work across jams | This umbrella's `.beads/` (prefix `coding-jams`) |
| Turning a jam into a paper/talk | Global `/cfp` skill |

## Beads at this level

Umbrella `.beads/` (prefix `coding-jams`) is for **meta-work**: stale-jam
audits, cross-jam patterns, planning the next jam slate. Per-jam work lives
inside that jam's own `.beads/`, never here.

## What NOT to do at this level

- **Don't put jam code here directly.** Code goes in a child repo. The
  umbrella holds gitlinks + meta-state, not project code.
- **Don't fold a jam's history into umbrella commits.** Each submodule has
  its own history. Respect it.
- **Don't delete a finished jam.** Archive it (leave the submodule, mark its
  status in `.beads/`). Finished jams are reference material.
- **Don't add a non-jam project here.** Open-ended exploration goes in
  `~/explore/`. Production code goes wherever you keep production code.

## Universal conventions (shared with `~/explore/`)

Both umbrellas honor the same per-child conventions:
- `.beads/` for task tracking (prefix per project)
- `.claude/` for project-local Claude state
- `CLAUDE.md` for project briefing
- `refs/` at project root for active reference material (not `.claude/refs/`)
- Gitmoji + bead trailer on commits
- Worktree subagents for parallel work (orchestrator pattern)

What makes coding-jams distinct from explore: **deadline + submission**.
That's it. The difference is the clock and the deliverable.
