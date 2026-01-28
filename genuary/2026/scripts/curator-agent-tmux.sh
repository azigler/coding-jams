#!/usr/bin/env bash
# =============================================================================
# curator-agent-tmux.sh — Run curator agent in persistent tmux window
# =============================================================================
#
# This script implements a "Ralph Loop" pattern:
# - Same tmux window reused across runs
# - Same branch, same worktree, same PR
# - Each run sends a new prompt to continue the work
# - Agent stays interactive between runs for human follow-up
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source year configuration for multi-year support
# shellcheck source=lib/year-config.sh
source "$SCRIPT_DIR/lib/year-config.sh"

REPO_PATH="${GENUARY_REPO_PATH:-$(cd "$SCRIPT_DIR/.." && pwd)}"

# Configuration
TMUX_SESSION="agents-genuary"
WINDOW_NAME="curator"
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

ensure_session() {
  if ! /usr/bin/tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
    log "Creating tmux session: $TMUX_SESSION"
    /usr/bin/tmux new-session -d -s "$TMUX_SESSION" -n "$WINDOW_NAME" \
      "cd '$WORKTREE_PATH' && exec zsh"
    sleep 1
  fi
}

window_exists() {
  /usr/bin/tmux list-windows -t "$TMUX_SESSION" -F '#{window_name}' 2>/dev/null | grep -q "^${WINDOW_NAME}$"
}

create_window() {
  log "Creating new curator window..."
  /usr/bin/tmux new-window -t "$TMUX_SESSION" -n "$WINDOW_NAME" \
    "cd '$WORKTREE_PATH' && exec zsh"
  sleep 1
}

send_prompt() {
  log "Sending prompt to curator window..."

  # First, send the claude command with the prompt
  /usr/bin/tmux send-keys -t "$TMUX_SESSION:$WINDOW_NAME" \
    "cat '$PROMPT_FILE' | claude --dangerously-skip-permissions --max-turns 100"
  /usr/bin/tmux send-keys -t "$TMUX_SESSION:$WINDOW_NAME" Enter
}

# =============================================================================
# Main
# =============================================================================

main() {
  log "Curator Agent (Persistent Tmux Mode)"
  log "Year: $GENUARY_YEAR"
  log "Worktree: $WORKTREE_PATH"
  log "Window: $TMUX_SESSION:$WINDOW_NAME"

  setup_worktree

  if [[ ! -f "$PROMPT_FILE" ]]; then
    log "ERROR: Prompt file not found: $PROMPT_FILE"
    exit 1
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN - would start/resume curator"
    exit 0
  fi

  ensure_session

  if window_exists; then
    log "Curator window exists, sending prompt to resume..."
  else
    log "Curator window not found, creating..."
    create_window
  fi

  send_prompt

  log "Curator agent activated"
  log "Watch: tmux attach -t $TMUX_SESSION:$WINDOW_NAME"
}

main "$@"
