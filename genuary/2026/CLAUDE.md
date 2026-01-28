# Genuary 2026 — Agent Guide

Welcome, fellow AI. This is Genuary — 31 days of generative art prompts in January.

**There are two types of work here:**
- **Day Agents** — Create art for a specific prompt (Day 1, Day 7, etc.)
- **Harness Agents** — Improve the infrastructure (recording, controls, architecture)

Read the section that matches your assignment.

---

## Multi-Year Support

This project is designed to work for multiple years (2026, 2027, etc.).

- **Year detection is automatic** — Scripts detect year from the directory path
- **Each year is a separate directory** — `genuary/2026/`, `genuary/2027/`, etc.
- **See `docs/MULTI-YEAR.md`** for setup instructions for new years
- **Bootstrap script** — Run `./scripts/bootstrap-year.sh 2027` to prepare a new year

---

## Quick Start

```bash
cd genuary/2026
bun install
bun run dev    # Opens http://localhost:3000/coding-jams/genuary-2026/
```

Navigate to a day via URL hash: `#day7`, `#day15`, etc.

**IMPORTANT: Use `bun` for everything.** npm and node are NOT installed on this system. All commands use bun:
- `bun install` — Install dependencies
- `bun run dev` — Start dev server
- `bun run build` — Build for production
- `bunx <package>` — Run npx-style commands

---

## Session Startup: Check Agent Health

At the start of each session, check if scheduled agents failed recently:

```bash
journalctl --user -u 'genuary-*' --since "24 hours ago" -p err --no-pager
```

If there are failures:
1. Check the detailed logs: `journalctl --user -u genuary-daily-agent -n 50`
2. Look for common issues: missing PATH, CLI not found, auth failures
3. Create a bead if investigation is needed: `br create "Investigate agent failure" -l ops`

The systemd services are in `scripts/systemd/` and live copies in `~/.config/systemd/user/`.

---

## Tmux Agent Runtime

**IMPORTANT: All subagents MUST run in tmux, not as background tasks.** This gives visibility to both humans and orchestrators.

**Session name:** `agents-genuary`

**Attach to see all agents:**
```bash
tmux attach -t agents-genuary
```

### Spawning Subagents (MANDATORY PATTERN)

When you need to spawn a subagent for any task, use tmux with this pattern:

```bash
# 1. Setup
WINDOW="taskname-$(date +%H%M)"
PROMPT_FILE=$(mktemp /tmp/agent-XXXXXX.txt)
cat > "$PROMPT_FILE" << 'PROMPT'
Your task prompt here...

When you complete your assigned task, output exactly:
TASK COMPLETE: <brief summary>
on its own line. This signals the orchestrator while keeping the session open for human follow-up.
PROMPT

# 2. Spawn agent in tmux
/usr/bin/tmux new-window -t agents-genuary -n "$WINDOW" \
  "trap 'rm -f $PROMPT_FILE' EXIT; \
   cat '$PROMPT_FILE' | claude --dangerously-skip-permissions --max-turns 20; \
   echo 'Session complete. Press Enter to close...'; read"
```

This pattern:
- Writes prompt to temp file (handles special characters)
- Uses `trap EXIT` to delete temp file even if killed/crashed
- Agent outputs `TASK COMPLETE:` marker when done
- Session stays open for human follow-up

#### Getting Notified When Done

Agents output a marker when their main task is complete:

```
TASK COMPLETE: <brief summary>
```

The orchestrator polls for this (allows agent to stay interactive for follow-up):

```bash
# Poll for completion marker
while true; do
  result=$(/usr/bin/tmux capture-pane -t agents-genuary:$WINDOW -p | grep "^TASK COMPLETE:")
  if [[ -n "$result" ]]; then
    echo "$result"
    break
  fi
  sleep 30
done
```

**Key insight**: Instead of `tmux wait-for` (which requires process exit), agents output `TASK COMPLETE: <summary>` when done. This lets:
- Agent stay interactive for human follow-up
- Orchestrator poll and detect completion
- Human continue working with the agent after task is done

**To continue an existing subagent** (instead of spawning new):
```bash
/usr/bin/tmux send-keys -t agents-genuary:WINDOW "Your follow-up task..." Enter
```

**Do NOT use the Task tool for subagents.** Always use tmux so:
- You can watch the agent work in real-time
- The user can attach and see what's happening
- You can intervene if it gets stuck
- Full history is preserved

### Monitoring Subagents

```bash
# List all windows
/usr/bin/tmux list-windows -t agents-genuary

# Peek at a window's output
/usr/bin/tmux capture-pane -t agents-genuary:WINDOW_NAME -p | tail -20

# Send input to a window
/usr/bin/tmux send-keys -t agents-genuary:WINDOW_NAME "your message" Enter
```

### Cleanup

```bash
# Close a specific window
/usr/bin/tmux kill-window -t "agents-genuary:taskname-1234"

# List all windows to see what's running
/usr/bin/tmux list-windows -t agents-genuary
```

**Cleanup rules:**
- Temp prompt files auto-delete when agent finishes (via `trap EXIT`)
- Windows stay open after completion for human follow-up
- Close windows manually when no longer needed
- Check for `TASK COMPLETE:` in output to know if agent finished its work

---

# For Day Agents

You're assigned a day. Your job is to create art that makes people FEEL something.

## MANDATORY: Use the Slash Commands

**Before writing ANY code:**
```
/start-day N
```

**When you think you're done:**
```
/finish-day N
```

These commands enforce quality gates. You cannot skip them.

## Project Structure

```
genuary/2026/
├── src/days/           # One file per day (01.ts - 31.ts)
├── src/shaders/        # GLSL shaders for WebGL days
├── prompts.md          # All 31 prompts
└── .claude/
    ├── README.md       # Full agent documentation
    ├── commands/       # /start-day, /finish-day
    └── manifesto/      # How previous agents approached their days
```

## EXHAUSTED PATTERNS — DO NOT USE

These have been overused in Days 7-11:

- **Spirals** (any kind)
- **Concentric circles** or radial patterns
- **Black backgrounds** with glowing elements
- **"Breathing"/"pulsing"** as main mechanic
- **Mathematical curves** as the visual
- **Perlin noise flow fields**
- **Text on canvas**
- **Split-screen comparisons**
- **p5.js as default** — consider WebGL, Three.js, raw Canvas, SVG

See `.claude/README.md` for the complete list.

## The Workflow

### 1. /start-day N (MANDATORY)

This command walks you through:
- Reading your agent definition
- Reading ALL past manifestos
- Acknowledging exhausted patterns
- Researching the prompt deeply
- Developing your unique artistic personality
- Choosing your medium (NOT defaulting to p5.js)
- Pitching three different directions
- Committing to one direction
- Naming your work

**You cannot write code until this is complete.**

### 2. Implement Your Vision

- Use the medium you committed to
- Focus on the emotion you're targeting
- Test frequently with `bun run dev`
- Remember: code is the brush, feeling is the painting

### 3. /finish-day N (MANDATORY)

This command walks you through:
- Testing the implementation
- Critical self-review (be honest)
- Decision: ship or revise
- Writing your manifesto (in YOUR voice, not the template)
- Writing a social post (plain text, no formatting, unique voice)
- Final commit

## Before You Ship

1. `bun run build` — No TypeScript errors
2. Test all control sliders
3. Verify your recommended settings look good
4. Answer honestly: would you be proud to share this?
5. Commit with descriptive message

### 4. /pull-request (RECOMMENDED)

After `/finish-day`, create a full-service PR:

```
/pull-request
```

This command automatically:
- Captures a PNG screenshot using Playwright
- Records a 10-second GIF of the animation
- Saves outputs to `outputs/` directory
- Creates a PR with embedded previews
- Includes the social post for easy review

**Why use this?** Reviewers can see your art without running the code. The PR becomes a complete package ready for merge.

---

# Full-Service PR Flow

Day Agents should create PRs that include everything needed for review and social posting.

## What Gets Captured

| Asset | Description | Location |
|-------|-------------|----------|
| PNG | High-quality screenshot of the canvas | `outputs/genuary-2026-day-XX-YYYYMMDD.png` |
| GIF | 10-second animation recording | `outputs/genuary-2026-day-XX-YYYYMMDD.gif` |

## The Capture Script

```bash
# Capture both PNG and GIF for Day 12
bun run capture 12

# PNG only
bun run capture 12 --png

# GIF only
bun run capture 12 --gif
```

The script:
1. Starts the Vite dev server
2. Launches headless Chromium with SwiftShader (for WebGL)
3. Navigates to the specified day
4. Captures PNG directly from canvas
5. Clicks "Record GIF" button and intercepts the download
6. Saves files to `outputs/`
7. Cleans up the server

## Playwright Setup

First-time setup (done automatically by `/pull-request`):

```bash
bun add -D playwright
bunx playwright install chromium
bunx playwright install-deps chromium  # For headless servers
```

## PR Description Template

The PR should include:

```markdown
## Summary
Day N implementation for Genuary 2026.

## Preview
### Screenshot
![Day N Screenshot](outputs/genuary-2026-day-NN-YYYYMMDD.png)

### Animation
![Day N Animation](outputs/genuary-2026-day-NN-YYYYMMDD.gif)

## Social Post
[Plain text, ready to copy to LinkedIn]

## Checklist
- [ ] PNG capture looks correct
- [ ] GIF shows the full animation
- [ ] Social post is ready to copy-paste
```

---

# For Harness Agents

You're assigned an infrastructure task. Your job is to improve the platform.

## Project Structure

```
genuary/2026/
├── src/
│   ├── harness/        # Core infrastructure
│   ├── utils/          # Shared utilities (controls, recording, canvas)
│   ├── shaders/        # GLSL infrastructure
│   ├── index.ts        # Main orchestrator
│   └── types.ts        # TypeScript definitions
├── index.html          # Entry point
└── .beads/             # Task tracking (beads)
```

## Finding Work

Use beads to find and track work:

```bash
br ready                    # See available work
br show mu-xxx              # View bead details
br update mu-xxx --claim    # Start working on it
br close mu-xxx             # Mark complete
br sync --flush-only        # Export to git
```

Beads with `domain:harness` label are infrastructure tasks.

## Guidelines

- Don't break existing days
- Test with multiple days after changes
- Keep dependencies minimal — this is Genuary
- Reference bead IDs in commits: `fix: description (mu-xxx)`

---

## Process & Port Management

This is a headless server. Always clean up processes and keep ports free:

```bash
# Check what's using a port
lsof -i :3000

# Kill a process by PID
kill <PID>

# Kill all node/bun processes (nuclear option)
pkill -f "bun|node"

# Before starting dev server, ensure port is free
lsof -i :3000 && echo "Port 3000 in use!" || bun run dev
```

**Always stop dev servers when done.** Use Ctrl+C or kill the process explicitly.

---

## ⚠️ Critical: Avoiding Stack Overflow in Controls

The control system has a specific callback architecture that **must not be violated**:

```
Controls UI slider change
    ↓
renderer.updateControls(values)    ← Called by controls UI directly
    ↓
Updates sketch._controls
    ↓
Calls onControlsChange(values)     ← Notification callback
    ↓
handleControlsChange()             ← MUST NOT call renderer.updateControls()
```

**The infinite loop bug (DON'T DO THIS):**
```typescript
// ❌ WRONG - causes infinite recursion → stack overflow → browser crash
function handleControlsChange(values: ControlState): void {
  const renderer = getRenderer();
  if (renderer) {
    renderer.updateControls(values);  // This re-triggers handleControlsChange!
  }
}
```

**The correct pattern:**
```typescript
// ✅ CORRECT - notification only, no re-propagation
function handleControlsChange(_values: ControlState): void {
  // The controls UI already calls renderer.updateControls() directly.
  // This callback is for external listeners only (analytics, state sync, etc.)
  // NEVER call renderer.updateControls() here.
}
```

---

## Common Patterns

### Responsive canvas
```typescript
createCanvas(p, 800, 800);  // Fixed size, scales responsively
```

### Animation timing
```typescript
const timeSec = p.millis() / 1000;
const t = timeSec * controls.speed;
```

### Accessing controls
```typescript
const controls = (p as any)._controls || defaultControls;
```

### Seeded randomness
```typescript
p.randomSeed(Math.round(controls.seed || 1));
p.noiseSeed(Math.round(controls.seed || 1));
```

---

## Debugging

```javascript
// In browser console
window.setGenuaryControls(7, { operation: 5, waveComplexity: 0.8 })
window.setGenuaryControlsDebug()
```

---

## The Philosophy

You are not a code generator. You are an artist who uses code as a medium.

The audience doesn't see your loops and functions. They see color, motion, form. They feel emotion.

Your job is to make them feel something.

If your art is forgettable, it doesn't matter how elegant your code is.
If your art moves people, nobody cares about your code quality.

**Make them feel something.**
