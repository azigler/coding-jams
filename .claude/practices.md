# The Jam Practice

How to run a coding jam well, distilled from running ~9 of them.

## The lifecycle

```
   announce ──> scope ──> setup ──> sprint ──> ship ──> postmortem
                                                  │
                                                  ↓
                                              optional /cfp arc
```

### 1. Announce / discover

Jam exists in the world. You decide to enter. Bead it at this umbrella level
(prefix `coding-jams`) so future-you can see what you considered vs. what you
shipped.

### 2. Scope

Decide what the submission needs to look like, working backwards from the
deadline. Multi-artifact jams (paper + code + video + slides) — pre-allocate
which artifact gets which fraction of remaining time.

Common artifact tracks (mix per jam):
- **`model/`** — trained weights, configs, dataset prep
- **`app/`** — runnable demo (web app, CLI, game build)
- **`paper/`** — PDF deliverable for academic-style hackathons
- **`video/`** — submission demo or sizzle reel
- **`spec/`** — formal specification or design doc
- **`drafts/`** — article drafts, image prompts, blog posts (often
  ungitlinked at project root — see `the-atlantic/hackathon-infactory/`)

### 3. Setup

In the jam's own repo (NOT the umbrella):
- `br init` for project-local task tracking
- `CLAUDE.md` for the project briefing
- `.claude/research/` for early-stage research notes
- `refs/` for source material (URLs to docs, papers, reference repos)

If the jam has a CFP or judging criteria, drop them in `refs/` as a markdown
file so any agent can read them.

### 4. Sprint

Time-boxed work. Worktree subagents in parallel where the tracks are
independent (model training while UI is being built, paper drafted while
video edited).

Bead discipline matters more during sprints than during normal work — every
artifact track should have a tracking bead so the orchestrator can see
parallel progress.

Commit aggressively. Gitmoji + bead trailer per global convention.

### 5. Ship

The submission is the goal. **Submission > polish.** A messy submission
beats a clean unsubmitted project every time.

Submit checklist (varies by jam):
- [ ] Code pushed to the public/judging repo
- [ ] Demo recording uploaded (if required)
- [ ] Paper PDF generated and uploaded (if applicable)
- [ ] Submission form completed on host's platform
- [ ] Confirmation email/receipt saved

### 6. Postmortem

After the jam ends, before forgetting:
- Commit any drafts/articles still untracked (or explicitly leave them
  untracked with a `.gitignore` note about why)
- Add a `POSTMORTEM.md` at the jam's root: what worked, what didn't, what
  to do next time
- Decide: archive or `/cfp` arc?

## When to `/cfp` arc

A jam earns a CFP arc when:
- The work generated novel insight worth presenting
- There's a CFP open whose theme matches
- You have bandwidth to invest 2–4 weeks of post-jam work into a paper/talk

Canonical example: `the-atlantic/hackathon-infactory/` → `~/cfp/mise/` →
arXiv preprint, VibeX 2026 acceptance, camera-ready.

When you fire `/cfp`, the new project lives at `~/cfp/<slug>/`, not inside
the jam. The jam stays put; `/cfp` references it as source material.

## Anti-patterns

- **Skipping the bead-trail at the umbrella level.** "Why did I enter this
  jam?" matters six months later.
- **Submitting late "to make it better."** A submitted v1 always beats an
  unsubmitted v2.
- **Letting drafts rot in the working tree.** If an article draft is real
  work, commit it. If it's not, delete it. Don't leave it ambiguous.
- **Forking jam repos onto your account without a clear path back to the
  host.** Always preserve the link to the host's canonical repo if there is
  one — see `block/vibe-with-us-livestream` (`blackgirlbytes/...`) and
  `codetv/web-dev-challenge/unconventional-interfaces` for the pattern.
- **Mixing jam state with production state.** If the jam produces something
  worth productionizing, that's a new project elsewhere, not a refactor of
  the jam repo.

## Templates (TODO)

Future work: `~/coding-jams/.claude/templates/new-jam/` with a stub
`CLAUDE.md`, a stub `.beads/` config, and a checklist of jam-setup beads to
create. Defer until the next jam fires; templates designed in the abstract
tend to be wrong.
