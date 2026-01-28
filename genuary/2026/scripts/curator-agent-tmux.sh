#!/usr/bin/env bash
# =============================================================================
# curator-agent-tmux.sh — Run curator agent in tmux for visibility
# =============================================================================
#
# This script runs the curator agent in a tmux window where you can:
# - Watch it work in real-time: tmux attach -t genuary-agents
# - See full history (scroll up)
# - Intervene if it gets stuck
# - Resume sessions later
#
# Usage:
#   ./scripts/curator-agent-tmux.sh           # Run curator in tmux
#   ./scripts/curator-agent-tmux.sh --dry-run # Show what would happen
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_PATH="${GENUARY_REPO_PATH:-$(cd "$SCRIPT_DIR/.." && pwd)}"

# Configuration
TMUX_SESSION="genuary-agents"
WORKTREE_ROOT="/home/ubuntu/coding-jams-museum-wip"
WORKTREE_PATH="$WORKTREE_ROOT/genuary/2026"
BRANCH_NAME="feat/genuary-museum"
GIT_ROOT="/home/ubuntu/coding-jams"

LOG_DIR="$REPO_PATH/logs/curator"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

log() {
  echo "[$(date +%Y-%m-%d\ %H:%M:%S)] $*"
}

# =============================================================================
# Setup
# =============================================================================

ensure_session() {
  if ! tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
    tmux new-session -d -s "$TMUX_SESSION" -n "control"
    tmux send-keys -t "$TMUX_SESSION:control" "echo 'Genuary Agents Session - use tmux attach -t $TMUX_SESSION'" Enter
  fi
}

setup_worktree() {
  log "Setting up worktree..."

  cd "$GIT_ROOT"
  git fetch origin main

  if [[ -d "$WORKTREE_ROOT" ]]; then
    log "Worktree exists at $WORKTREE_ROOT"
    cd "$WORKTREE_ROOT"
    git checkout "$BRANCH_NAME" 2>/dev/null || git checkout -b "$BRANCH_NAME"
    git pull --rebase origin "$BRANCH_NAME" 2>/dev/null || true
  else
    log "Creating worktree at $WORKTREE_ROOT"
    git worktree add -b "$BRANCH_NAME" "$WORKTREE_ROOT" origin/main 2>/dev/null || \
    git worktree add "$WORKTREE_ROOT" "$BRANCH_NAME"
  fi

  cd "$WORKTREE_PATH"
  br sync --flush-only 2>/dev/null || true
}

# =============================================================================
# Main
# =============================================================================

main() {
  log "=========================================="
  log "Genuary 2026 Curator Agent (Tmux Mode)"
  log "=========================================="
  log "Worktree: $WORKTREE_PATH"
  log "Session: $TMUX_SESSION"
  log "Dry run: $DRY_RUN"

  # Setup worktree
  setup_worktree

  # Load prompt from file
  local prompt_file="$WORKTREE_PATH/.claude/prompts/curator-session.md"
  if [[ ! -f "$prompt_file" ]]; then
    log "ERROR: Prompt file not found: $prompt_file"
    exit 1
  fi

  log "Prompt file: $prompt_file ($(wc -c < "$prompt_file") bytes)"

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN: Would start curator in tmux"
    log "Prompt preview:"
    head -20 "$prompt_file"
    exit 0
  fi

  # Ensure tmux session exists
  ensure_session

  # Create window name
  local window_name="curator-$(date +%m%d-%H%M)"

  log "Starting curator in tmux window: $window_name"
  log ""
  log "To watch: tmux attach -t $TMUX_SESSION"
  log "Or jump to window: tmux select-window -t $TMUX_SESSION:$window_name"
  log ""

  # Create a runner script that the tmux window will execute
  # This avoids quoting issues with embedding the prompt in bash -c
  local runner_script="/tmp/curator-runner-$$.sh"
  cat > "$runner_script" << 'RUNNER_EOF'
#!/usr/bin/env bash
set -e

PROMPT_FILE="$1"
WORKTREE="$2"
WINDOW_NAME="$3"
TMUX_SESSION="$4"
BRANCH_NAME="$5"

echo '═══════════════════════════════════════════════════════════════'
echo "Curator Agent"
echo "Window: $WINDOW_NAME"
echo "Worktree: $WORKTREE"
echo "Started: $(date)"
echo '═══════════════════════════════════════════════════════════════'
echo ''

cd "$WORKTREE"

# Run claude with the prompt piped from the file
cat "$PROMPT_FILE" | claude \
  --dangerously-skip-permissions \
  --max-turns 75

EXIT_CODE=$?

echo ''
echo '═══════════════════════════════════════════════════════════════'
echo "Curator finished at $(date) with exit code $EXIT_CODE"
echo '═══════════════════════════════════════════════════════════════'

# Mark window as done
tmux rename-window -t "$TMUX_SESSION:$WINDOW_NAME" "[done] $WINDOW_NAME" 2>/dev/null || true

# Commit any remaining work
echo 'Committing any uncommitted work...'
cd "$WORKTREE"
if [[ -n "$(git status --porcelain)" ]]; then
  git add -A
  git commit -m "wip: curator session $(date +%Y%m%d-%H%M)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>" || true
fi
git push origin "$BRANCH_NAME" || true

echo ''
echo 'Press Enter to close this window...'
read -r
RUNNER_EOF

  chmod +x "$runner_script"

  # Create the tmux window running the script
  tmux new-window -t "$TMUX_SESSION" -n "$window_name" \
    "$runner_script" "$prompt_file" "$WORKTREE_PATH" "$window_name" "$TMUX_SESSION" "$BRANCH_NAME"

  log "Curator started in tmux window: $window_name"
}

main "$@"
