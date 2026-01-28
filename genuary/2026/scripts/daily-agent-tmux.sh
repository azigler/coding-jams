#!/usr/bin/env bash
# =============================================================================
# daily-agent-tmux.sh — Run daily agent in tmux for visibility
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source year configuration for multi-year support
# shellcheck source=lib/year-config.sh
source "$SCRIPT_DIR/lib/year-config.sh"

REPO_PATH="${GENUARY_REPO_PATH:-$(cd "$SCRIPT_DIR/.." && pwd)}"

# Configuration
TMUX_SESSION="genuary-agents"
GIT_ROOT="/home/ubuntu/coding-jams"

# Determine which day to work on
if [[ "${1:-}" =~ ^[0-9]+$ ]]; then
  DAY_NUM="$1"
elif [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  DAY_NUM=$(date +%-d)
else
  DAY_NUM=$(date +%-d)
fi

DRY_RUN="${DRY_RUN:-false}"

log() { echo "[$(date +%Y-%m-%d\ %H:%M:%S)] $*"; }

# =============================================================================
# Setup
# =============================================================================

setup_branch() {
  log "Setting up branch for Day $DAY_NUM..."
  cd "$REPO_PATH"
  git fetch origin main
  git checkout main
  git pull origin main

  local branch_name="feat/genuary-day-${DAY_NUM}-agent-$(date +%Y%m%d)"
  git checkout -b "$branch_name" 2>/dev/null || git checkout "$branch_name"

  echo "$branch_name"
}

# =============================================================================
# Main
# =============================================================================

main() {
  log "Daily Agent (Tmux Mode)"
  log "Year: $GENUARY_YEAR"
  log "Day: $DAY_NUM"
  log "Repo: $REPO_PATH"

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN - would start daily agent for Day $DAY_NUM"
    exit 0
  fi

  local branch_name
  branch_name=$(setup_branch)
  log "Branch: $branch_name"

  local window_name="day${DAY_NUM}-$(date +%m%d-%H%M)"
  local signal="${window_name}-done"

  # Build the prompt
  local prompt="You are working on Genuary $GENUARY_YEAR Day $DAY_NUM.

Your task is to complete this day from start to finish:

1. Run /start-day $DAY_NUM and complete ALL mandatory steps
2. Implement the artwork following your creative vision
3. Run /finish-day $DAY_NUM to complete the reflection
4. Run /pull-request to create the PR with captures

This is an automated run. Work autonomously and make creative decisions yourself.
If you encounter any blockers, document them clearly.

Begin with /start-day $DAY_NUM"

  # Write prompt to temp file
  local prompt_file
  prompt_file=$(mktemp /tmp/agent-day${DAY_NUM}-XXXXXX.txt)
  echo "$prompt" > "$prompt_file"

  # Create session if needed, spawn window with signal
  if ! /usr/bin/tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
    /usr/bin/tmux new-session -d -s "$TMUX_SESSION" -n "$window_name" \
      "trap 'rm -f $prompt_file' EXIT; \
       cd '$REPO_PATH' && cat '$prompt_file' | claude --dangerously-skip-permissions --max-turns 100; \
       /usr/bin/tmux wait-for -S $signal; \
       /usr/bin/tmux rename-window '[done] $window_name'; \
       echo ''; echo 'Done. Press Enter to close...'; read"
  else
    /usr/bin/tmux new-window -t "$TMUX_SESSION" -n "$window_name" \
      "trap 'rm -f $prompt_file' EXIT; \
       cd '$REPO_PATH' && cat '$prompt_file' | claude --dangerously-skip-permissions --max-turns 100; \
       /usr/bin/tmux wait-for -S $signal; \
       /usr/bin/tmux rename-window '[done] $window_name'; \
       echo ''; echo 'Done. Press Enter to close...'; read"
  fi

  log "Started: $window_name"
  log "Signal: $signal"
  log "Watch: tmux attach -t $TMUX_SESSION"
}

main "$@"
