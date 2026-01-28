#!/usr/bin/env bash
# =============================================================================
# curator-agent-tmux.sh — Run curator agent in tmux for visibility
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source year configuration for multi-year support
# shellcheck source=lib/year-config.sh
source "$SCRIPT_DIR/lib/year-config.sh"

REPO_PATH="${GENUARY_REPO_PATH:-$(cd "$SCRIPT_DIR/.." && pwd)}"

# Configuration
TMUX_SESSION="genuary-agents"
WORKTREE_ROOT="/home/ubuntu/coding-jams-museum-wip"
WORKTREE_PATH="$WORKTREE_ROOT/genuary/$GENUARY_YEAR"
BRANCH_NAME="feat/genuary-museum"
GIT_ROOT="/home/ubuntu/coding-jams"
PROMPT_FILE="$WORKTREE_PATH/.claude/prompts/curator-session.md"

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

log() { echo "[$(date +%Y-%m-%d\ %H:%M:%S)] $*"; }

# =============================================================================
# Setup
# =============================================================================

setup_worktree() {
  log "Setting up worktree..."
  cd "$GIT_ROOT"
  git fetch origin main

  if [[ -d "$WORKTREE_ROOT" ]]; then
    cd "$WORKTREE_ROOT"
    git checkout "$BRANCH_NAME" 2>/dev/null || git checkout -b "$BRANCH_NAME"
    git pull --rebase origin "$BRANCH_NAME" 2>/dev/null || true
  else
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
  log "Curator Agent (Tmux Mode)"
  log "Worktree: $WORKTREE_PATH"

  setup_worktree

  if [[ ! -f "$PROMPT_FILE" ]]; then
    log "ERROR: Prompt file not found: $PROMPT_FILE"
    exit 1
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN - would start curator"
    exit 0
  fi

  local window_name="curator-$(date +%m%d-%H%M)"

  # Create session if needed (first window becomes the agent, no placeholder)
  if ! tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
    tmux new-session -d -s "$TMUX_SESSION" -n "$window_name" \
      "cd '$WORKTREE_PATH' && cat '$PROMPT_FILE' | claude --dangerously-skip-permissions --max-turns 75; echo ''; echo 'Done. Press Enter to close...'; read"
  else
    tmux new-window -t "$TMUX_SESSION" -n "$window_name" \
      "cd '$WORKTREE_PATH' && cat '$PROMPT_FILE' | claude --dangerously-skip-permissions --max-turns 75; echo ''; echo 'Done. Press Enter to close...'; read"
  fi

  log "Started: $window_name"
  log "Watch: tmux attach -t $TMUX_SESSION"
}

main "$@"
