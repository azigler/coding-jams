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

# Source the tmux agent library
source "$SCRIPT_DIR/lib/tmux-agents.sh"

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

  local prompt
  prompt=$(cat "$prompt_file")
  log "Loaded prompt (${#prompt} chars)"

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN: Would start curator in tmux"
    log "Prompt preview:"
    echo "$prompt" | head -20
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

  # Build the command to run in tmux
  # We cd to the worktree and run claude there
  local claude_cmd="cd '$WORKTREE_PATH' && echo \"\$PROMPT\" | claude --dangerously-skip-permissions --max-turns 75"

  # Create the tmux window with a wrapper that shows status
  tmux new-window -t "$TMUX_SESSION" -n "$window_name" bash -c "
    export PROMPT='$prompt'

    echo '═══════════════════════════════════════════════════════════════'
    echo 'Curator Agent'
    echo 'Window: $window_name'
    echo 'Worktree: $WORKTREE_PATH'
    echo 'Started: \$(date)'
    echo '═══════════════════════════════════════════════════════════════'
    echo ''

    cd '$WORKTREE_PATH'

    # Run claude with the prompt piped in
    echo \"\$PROMPT\" | claude \\
      --dangerously-skip-permissions \\
      --max-turns 75

    EXIT_CODE=\$?

    echo ''
    echo '═══════════════════════════════════════════════════════════════'
    echo \"Curator finished at \$(date) with exit code \$EXIT_CODE\"
    echo '═══════════════════════════════════════════════════════════════'

    # Mark window as done
    tmux rename-window -t '$TMUX_SESSION:$window_name' '[done] $window_name' 2>/dev/null || true

    # Commit any remaining work
    echo 'Committing any uncommitted work...'
    cd '$WORKTREE_PATH'
    if [[ -n \"\$(git status --porcelain)\" ]]; then
      git add -A
      git commit -m 'wip: curator session \$(date +%Y%m%d-%H%M)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>' || true
    fi
    git push origin '$BRANCH_NAME' || true

    echo ''
    echo 'Press Enter to close this window...'
    read -r
  "

  log "Curator started in tmux window: $window_name"
}

main "$@"
