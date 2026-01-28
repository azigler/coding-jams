#!/usr/bin/env bash
#
# Genuary 2026 Curator Agent Orchestrator
#
# This script runs the Curator Agent for incremental museum development.
# It manages the worktree, PR, and session workflow.
#
# Usage:
#   ./scripts/curator-agent.sh           # Normal run
#   ./scripts/curator-agent.sh --dry-run # Show what would happen
#   ./scripts/curator-agent.sh --setup   # First-time setup only
#
# Environment:
#   GENUARY_REPO_PATH  - Path to genuary/2026 (default: script's parent)
#   CLAUDE_API_KEY     - Required for Claude Code CLI
#   GITHUB_TOKEN       - Required for gh CLI
#

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_PATH="${GENUARY_REPO_PATH:-$(dirname "$SCRIPT_DIR")}"
# Worktree is a sibling of coding-jams, not nested inside it
# coding-jams/genuary/2026 -> coding-jams -> /home/ubuntu -> coding-jams-museum-wip
GIT_ROOT="$(cd "$REPO_PATH/../.." && pwd)"
WORKTREE_ROOT="$(dirname "$GIT_ROOT")/coding-jams-museum-wip"
WORKTREE_PATH="${WORKTREE_ROOT}/genuary/2026"
LOG_DIR="${REPO_PATH}/logs/curator"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="${LOG_DIR}/session-${TIMESTAMP}.log"

BRANCH_NAME="feat/genuary-museum"
PR_TITLE="feat(genuary): Virtual Museum Experience"

DRY_RUN="${DRY_RUN:-false}"
SETUP_ONLY="${SETUP_ONLY:-false}"

# Parse args
for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN=true ;;
    --setup) SETUP_ONLY=true ;;
  esac
done

# =============================================================================
# Logging
# =============================================================================

mkdir -p "$LOG_DIR"

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
  echo "$msg"
  echo "$msg" >> "$LOG_FILE"
}

# =============================================================================
# Prerequisites
# =============================================================================

check_prerequisites() {
  log "Checking prerequisites..."

  if ! command -v claude &> /dev/null; then
    log "ERROR: Claude Code CLI not found"
    exit 1
  fi

  if ! command -v gh &> /dev/null; then
    log "ERROR: GitHub CLI not found"
    exit 1
  fi

  if ! command -v br &> /dev/null; then
    log "ERROR: beads_rust (br) not found"
    exit 1
  fi

  if ! gh auth status &> /dev/null; then
    log "ERROR: GitHub CLI not authenticated"
    exit 1
  fi

  log "Prerequisites OK"
}

# =============================================================================
# Worktree Management
# =============================================================================

setup_worktree() {
  log "Setting up worktree..."

  cd "$GIT_ROOT"

  # Ensure we're up to date
  git fetch origin main

  # Check if worktree exists (check root, not subdirectory)
  if [[ -d "$WORKTREE_ROOT" ]]; then
    log "Worktree already exists at $WORKTREE_ROOT"
    cd "$WORKTREE_ROOT"
    git fetch origin
    # Try to update from remote if branch exists
    if git rev-parse --verify "origin/$BRANCH_NAME" &>/dev/null; then
      git checkout "$BRANCH_NAME"
      git pull origin "$BRANCH_NAME" --rebase || true
    fi
    return 0
  fi

  # Check if branch exists remotely
  if git ls-remote --heads origin "$BRANCH_NAME" | grep -q "$BRANCH_NAME"; then
    log "Remote branch exists, creating worktree from it"
    git worktree add "$WORKTREE_ROOT" "$BRANCH_NAME"
  else
    # Create new branch from main
    log "Creating new worktree with fresh branch"
    git worktree add "$WORKTREE_ROOT" -b "$BRANCH_NAME" origin/main
  fi

  log "Worktree ready at $WORKTREE_ROOT"
  log "Agent will work in $WORKTREE_PATH"
}

# =============================================================================
# PR Management
# =============================================================================

find_or_create_pr() {
  log "Checking for existing PR..."

  cd "$WORKTREE_ROOT"

  # Check for existing PR
  local pr_number
  pr_number=$(gh pr list --head "$BRANCH_NAME" --json number --jq '.[0].number' 2>/dev/null || echo "")

  if [[ -n "$pr_number" && "$pr_number" != "null" ]]; then
    log "Found existing PR #$pr_number"
    echo "$pr_number"
    return 0
  fi

  log "No existing PR found"

  # Check if there are any commits to push
  local commits
  commits=$(git log origin/main..HEAD --oneline 2>/dev/null | wc -l || echo "0")

  if [[ "$commits" -eq 0 ]]; then
    log "No commits yet, PR will be created after first commit"
    echo ""
    return 0
  fi

  # Push branch and create PR
  log "Creating new PR..."
  git push -u origin "$BRANCH_NAME"

  local pr_url
  pr_url=$(gh pr create \
    --title "$PR_TITLE" \
    --base main \
    --head "$BRANCH_NAME" \
    --body "$(cat <<'EOF'
## Virtual Museum for Genuary 2026

This PR contains the incremental development of the WebXR virtual museum that showcases all 31 days of Genuary 2026.

### Vision
A navigable 3D space where visitors walk *through* art that has become architecture.

### Status
Work in progress. Updated daily by the Curator Agent.

### Session Log
*Daily updates will be added as comments below.*

---

🤖 Built incrementally by the Curator Agent
EOF
)")

  pr_number=$(gh pr list --head "$BRANCH_NAME" --json number --jq '.[0].number')
  log "Created PR #$pr_number: $pr_url"
  echo "$pr_number"
}

add_session_comment() {
  local pr_number="$1"
  local session_summary="$2"

  if [[ -z "$pr_number" ]]; then
    log "No PR to comment on yet"
    return 0
  fi

  log "Adding session comment to PR #$pr_number..."

  gh pr comment "$pr_number" --body "$(cat <<EOF
## Session: $(date '+%Y-%m-%d %H:%M UTC')

$session_summary

---
*Automated comment from Curator Agent*
EOF
)"
}

# =============================================================================
# Main Agent Workflow
# =============================================================================

run_curator_agent() {
  log "Starting Curator Agent session..."

  cd "$WORKTREE_PATH"

  # Sync beads from origin
  git pull origin "$BRANCH_NAME" --rebase || true
  br sync 2>/dev/null || true

  # Find existing PR (might not exist yet)
  local pr_number
  pr_number=$(gh pr list --head "$BRANCH_NAME" --json number --jq '.[0].number' 2>/dev/null || echo "")

  # The comprehensive orchestrator prompt
  local prompt
  prompt=$(cat <<'PROMPT'
You are the **Museum Curator Agent** for Genuary 2026.

## Your Mission
Build an immersive WebXR virtual museum that showcases all 31 days of Genuary as a unified, navigable 3D experience. The art doesn't hang on walls — it BECOMES the architecture.

## This Session

### Phase 1: Orient (read these files)
1. Read `.claude/agents/curator.md` — your agent definition
2. Read `.claude/analysis/progress.md` — what happened last session
3. Read `.claude/analysis/blockers.md` — known issues
4. Run `br ready` to see available beads

### Phase 2: Assess & Plan
1. What's the current state of the museum? Does it even render?
2. What beads exist? What's missing?
3. What's the most impactful thing to work on today?

If this is an early session, focus on:
- Creating foundational beads for the museum architecture
- Getting a basic Three.js scene rendering at `#museum`
- Setting up navigation (WASD + mouse look)

If the museum exists, focus on:
- Fixing blockers from `.claude/analysis/blockers.md`
- Implementing the highest-priority bead
- Integrating another day's artwork

### Phase 3: Create/Update Beads
If you identify work that doesn't have a bead:
```bash
br create "Title" --priority N --labels domain:museum
```

Priority levels:
- 0 = Critical (blocks everything)
- 1 = High (this session)
- 2 = Medium (this week)
- 3 = Low (nice to have)
- 4 = Backlog (future)

Good beads for museum work:
- `mu-xxx: Set up basic Three.js scene and camera`
- `mu-xxx: Implement WASD + mouse navigation`
- `mu-xxx: Create entrance zone with lighting`
- `mu-xxx: Integrate Day 7 as framed piece`
- `mu-xxx: Add collision detection for walls`

### Phase 4: Implement
Pick 1-3 beads to work on this session. For each:

1. Claim it: `br update mu-xxx --claim`
2. Implement the work in `src/museum/`
3. Test with: `bun run museum:test --quick`
4. Commit with bead reference: `git commit -m "feat(museum): description (mu-xxx)"`
5. Close if done: `br close mu-xxx`

Use subagents for parallel work when tasks are independent:
- Spawn with `run_in_background: true`
- Let them handle complete implementation

### Phase 5: Document & Ship
1. Update `.claude/analysis/progress.md` with this session's work
2. Update `.claude/analysis/blockers.md` if you found issues
3. Sync beads: `br sync --flush-only`
4. Commit documentation: `git commit -m "docs: update museum progress"`
5. Push: `git push origin feat/genuary-museum`

## Key Files

Your code goes in `src/museum/`:
```
src/museum/
├── index.ts          # Entry point, exports to harness
├── scene.ts          # Three.js scene setup
├── navigation.ts     # Camera, movement, controls
├── zones/            # Individual spaces
└── exhibits/         # Day integrations
```

The harness will need to be updated to route `#museum` to your code.

## Testing

After changes, run:
```bash
bun run museum:test --quick  # Basic load test
```

## Important

- ALWAYS work in this worktree (you're already in it)
- ALWAYS reference beads in commits
- ALWAYS update progress.md at session end
- The museum route is `#museum` (separate from Day 31)
- Use `.claude/museum-plan.md` as INSPIRATION, not prescription
- Focus on making something NAVIGABLE before making it beautiful

## Begin

Start with Phase 1: read your agent definition and last session's progress.
PROMPT
)

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN: Would execute Claude Code with curator prompt"
    echo "Prompt length: ${#prompt} chars"
    return 0
  fi

  # Run Claude Code
  log "Invoking Claude Code..."

  # Capture output for session summary
  local output_file="${LOG_DIR}/output-${TIMESTAMP}.txt"

  claude --print \
    --dangerously-skip-permissions \
    --max-turns 75 \
    --allowedTools "Bash,Read,Write,Edit,Glob,Grep,Task,WebSearch,WebFetch" \
    "$prompt" 2>&1 | tee "$output_file" | tee -a "$LOG_FILE"

  local exit_code=${PIPESTATUS[0]}

  # After agent completes, ensure we push and comment
  log "Agent session completed with exit code $exit_code"

  # Push any uncommitted work (git operations from worktree root)
  cd "$WORKTREE_ROOT"
  if [[ -n "$(git status --porcelain)" ]]; then
    log "Uncommitted changes found, committing..."
    git add -A
    git commit -m "wip: curator session $(date +%Y%m%d-%H%M)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>" || true
  fi

  git push origin "$BRANCH_NAME" || true
  br sync --flush-only || true

  # Create or find PR
  pr_number=$(find_or_create_pr)

  # Add session comment if we have a PR
  if [[ -n "$pr_number" && "$pr_number" != "null" ]]; then
    # Extract summary from output (last 50 lines, filtered)
    local summary
    summary=$(tail -100 "$output_file" | grep -v "^$" | tail -30 || echo "Session completed")
    add_session_comment "$pr_number" "$summary"
  fi

  return $exit_code
}

# =============================================================================
# Main
# =============================================================================

main() {
  log "=========================================="
  log "Genuary 2026 Curator Agent"
  log "=========================================="
  log "Repo: $REPO_PATH"
  log "Git root: $GIT_ROOT"
  log "Worktree root: $WORKTREE_ROOT"
  log "Agent workdir: $WORKTREE_PATH"
  log "Log: $LOG_FILE"
  log "Dry run: $DRY_RUN"
  log "Setup only: $SETUP_ONLY"

  check_prerequisites
  setup_worktree

  if [[ "$SETUP_ONLY" == "true" ]]; then
    log "Setup complete. Run without --setup to start agent."
    exit 0
  fi

  if run_curator_agent; then
    log "Session completed successfully"
  else
    log "Session completed with warnings"
  fi

  log "=========================================="
  log "Curator session complete"
  log "=========================================="
}

main "$@"
