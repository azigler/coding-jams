#!/usr/bin/env bash
#
# Genuary Daily Agent Automation (Multi-Year Support)
#
# This script is designed to be run by cron or systemd to automatically
# kick off a Day Agent for the current Genuary day.
#
# Usage:
#   ./scripts/daily-agent.sh           # Run for today's day number
#   ./scripts/daily-agent.sh 15        # Run for specific day
#   ./scripts/daily-agent.sh --dry-run # Show what would happen
#
# Environment variables:
#   GENUARY_YEAR       - Override the detected year (e.g., 2027)
#   GENUARY_REPO_PATH  - Path to the genuary/YYYY directory
#   CLAUDE_API_KEY     - Required for Claude Code CLI
#   GITHUB_TOKEN       - Required for PR creation via gh
#
# Cron example (6:30 AM Pacific = 14:30 UTC):
#   30 14 1-31 1 * /path/to/genuary/YYYY/scripts/daily-agent.sh
#
# systemd timer example in accompanying file: genuary-daily-agent.timer
#

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the year configuration library
source "${SCRIPT_DIR}/lib/year-config.sh"

REPO_PATH="${GENUARY_REPO_PATH:-$(dirname "$SCRIPT_DIR")}"
LOG_DIR="${REPO_PATH}/logs"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Determine which day to work on
if [[ "${1:-}" =~ ^[0-9]+$ ]]; then
  DAY_NUM="$1"
elif [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  DAY_NUM=$(date +%-d)  # Current day of month
else
  DAY_NUM=$(date +%-d)  # Current day of month (no leading zero)
fi

DRY_RUN="${DRY_RUN:-false}"

# Validate day number
if [[ "$DAY_NUM" -lt 1 || "$DAY_NUM" -gt 31 ]]; then
  echo "Error: Day must be between 1 and 31"
  exit 1
fi

LOG_FILE="${LOG_DIR}/day-${DAY_NUM}-${TIMESTAMP}.log"

# =============================================================================
# Helper Functions
# =============================================================================

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
  echo "$msg"
  echo "$msg" >> "$LOG_FILE"
}

check_prerequisites() {
  log "Checking prerequisites..."

  # Check for Claude Code CLI
  if ! command -v claude &> /dev/null; then
    log "ERROR: Claude Code CLI not found. Install with: npm install -g @anthropic-ai/claude-code"
    exit 1
  fi

  # Check for gh CLI
  if ! command -v gh &> /dev/null; then
    log "ERROR: GitHub CLI not found. Install with: sudo apt install gh"
    exit 1
  fi

  # Check gh auth
  if ! gh auth status &> /dev/null; then
    log "ERROR: GitHub CLI not authenticated. Run: gh auth login"
    exit 1
  fi

  # Check for bun
  if ! command -v bun &> /dev/null; then
    log "ERROR: Bun not found. Install with: curl -fsSL https://bun.sh/install | bash"
    exit 1
  fi

  log "All prerequisites satisfied"
}

check_day_status() {
  local day_file="${REPO_PATH}/src/days/$(printf '%02d' "$DAY_NUM").ts"
  local manifesto_pattern="${REPO_PATH}/.claude/manifesto/day-${DAY_NUM}-*.md"

  # Check if day file exists and has substantive content
  if [[ -f "$day_file" ]]; then
    local lines=$(wc -l < "$day_file")
    if [[ "$lines" -gt 50 ]]; then
      log "Day $DAY_NUM appears to be already implemented ($lines lines)"
      return 1  # Already done
    fi
  fi

  # Check if manifesto exists
  if compgen -G "$manifesto_pattern" > /dev/null; then
    log "Day $DAY_NUM manifesto already exists"
    return 1  # Already done
  fi

  return 0  # Needs to be done
}

create_branch() {
  log "Creating feature branch..."
  cd "$REPO_PATH"

  git fetch origin main
  git checkout main
  git pull origin main

  local branch_name="feat/genuary-day-${DAY_NUM}-agent-$(date +%Y%m%d)"
  git checkout -b "$branch_name"

  log "Created branch: $branch_name"
  echo "$branch_name"
}

# =============================================================================
# Main Agent Workflow
# =============================================================================

run_agent() {
  log "Starting Day Agent workflow for Day $DAY_NUM"

  cd "$REPO_PATH"

  # The Claude Code prompt that orchestrates the full day workflow
  # Note: This uses the slash commands defined in .claude/commands/
  local prompt="You are the Genuary Daily Agent.

## Step 0: Check the Date and Year (ALWAYS DO THIS FIRST)

Run this command to check today's date:
\`\`\`bash
date '+%Y-%m-%d (Day %d of %B)'
\`\`\`

Based on the result:
- If the year is NOT ${GENUARY_YEAR}, you need to work in a different directory
- Check if \`genuary/<current-year>/\` exists. If not, create and bootstrap it:
  \`\`\`bash
  mkdir -p /home/ubuntu/coding-jams/genuary/<year>
  cp -r /home/ubuntu/coding-jams/genuary/2026/scripts /home/ubuntu/coding-jams/genuary/<year>/
  cp -r /home/ubuntu/coding-jams/genuary/2026/src/harness /home/ubuntu/coding-jams/genuary/<year>/src/
  cp -r /home/ubuntu/coding-jams/genuary/2026/src/utils /home/ubuntu/coding-jams/genuary/<year>/src/
  cd /home/ubuntu/coding-jams/genuary/<year>
  ./scripts/bootstrap-year.sh
  \`\`\`
- If the year IS ${GENUARY_YEAR}, proceed with Day $DAY_NUM below

## Your Task: Genuary Day $DAY_NUM

Complete this day from start to finish:

1. Run /start-day $DAY_NUM and complete ALL 13 mandatory steps
2. Implement the artwork following your creative vision
3. Run /finish-day $DAY_NUM to complete the reflection
4. Run /pull-request to create the PR with captures

This is an automated run. Work autonomously and make creative decisions yourself.
If you encounter any blockers, document them in a file called 'agent-notes.md'.

Begin by checking the date, then proceed with /start-day $DAY_NUM"

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN: Would execute Claude Code with prompt:"
    echo "$prompt"
    return 0
  fi

  # Run Claude Code in non-interactive mode
  # The --dangerously-skip-permissions flag allows full autonomy
  # Adjust --max-turns based on expected complexity
  # NOTE: Multi-line prompts must be piped via stdin, not passed as arguments
  log "Invoking Claude Code..."

  echo "$prompt" | claude --print \
    --dangerously-skip-permissions \
    --max-turns 100 \
    --allowedTools "Bash,Read,Write,Edit,Glob,Grep,Task,WebSearch,WebFetch" \
    2>&1 | tee -a "$LOG_FILE"

  local exit_code=${PIPESTATUS[1]}

  if [[ $exit_code -ne 0 ]]; then
    log "WARNING: Claude Code exited with code $exit_code"
  fi

  return $exit_code
}

# =============================================================================
# Main Entry Point
# =============================================================================

main() {
  mkdir -p "$LOG_DIR"

  log "=========================================="
  log "Genuary ${GENUARY_YEAR} Daily Agent"
  log "=========================================="
  log "Year: $GENUARY_YEAR"
  log "Day: $DAY_NUM"
  log "Repo: $REPO_PATH"
  log "Log: $LOG_FILE"
  log "Dry run: $DRY_RUN"
  log ""

  # Preflight checks
  check_prerequisites

  # Check if day is already done
  if ! check_day_status; then
    log "Day $DAY_NUM is already complete. Exiting."
    exit 0
  fi

  log "Day $DAY_NUM needs implementation. Proceeding..."

  # Create feature branch
  local branch
  branch=$(create_branch)

  # Run the agent
  if run_agent; then
    log "Agent completed successfully"
  else
    log "Agent completed with warnings (check logs)"
  fi

  log "=========================================="
  log "Daily agent run complete"
  log "=========================================="
}

main "$@"
