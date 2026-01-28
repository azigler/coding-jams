#!/usr/bin/env bash
#
# Genuary Curator Agent Orchestrator (Multi-Year Support)
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
#   GENUARY_YEAR       - Override the detected year (e.g., 2027)
#   GENUARY_REPO_PATH  - Path to genuary/YYYY (default: script's parent)
#   CLAUDE_API_KEY     - Required for Claude Code CLI
#   GITHUB_TOKEN       - Required for gh CLI
#

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the year configuration library
source "${SCRIPT_DIR}/lib/year-config.sh"

REPO_PATH="${GENUARY_REPO_PATH:-$(dirname "$SCRIPT_DIR")}"
# Worktree is a sibling of coding-jams, not nested inside it
# coding-jams/genuary/YYYY -> coding-jams -> /home/ubuntu -> coding-jams-museum-wip
GIT_ROOT="$(cd "$REPO_PATH/../.." && pwd)"
WORKTREE_ROOT="$(dirname "$GIT_ROOT")/coding-jams-museum-wip"
WORKTREE_PATH="${WORKTREE_ROOT}/genuary/${GENUARY_YEAR}"
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
    --body "$(cat <<EOF
## Virtual Museum for Genuary ${GENUARY_YEAR}

This PR contains the incremental development of the WebXR virtual museum that showcases all 31 days of Genuary ${GENUARY_YEAR}.

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

  # Load prompt from file (allows iteration without modifying this script)
  local prompt_file="$WORKTREE_PATH/.claude/prompts/curator-session.md"

  if [[ ! -f "$prompt_file" ]]; then
    log "ERROR: Prompt file not found: $prompt_file"
    exit 1
  fi

  local prompt
  prompt=$(cat "$prompt_file")
  log "Loaded prompt from $prompt_file (${#prompt} chars)"

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN: Would execute Claude Code with curator prompt"
    echo "Prompt length: ${#prompt} chars"
    return 0
  fi

  # Run Claude Code
  # NOTE: Multi-line prompts must be piped via stdin, not passed as arguments
  log "Invoking Claude Code..."

  # Capture output for session summary
  local output_file="${LOG_DIR}/output-${TIMESTAMP}.txt"

  echo "$prompt" | claude --print \
    --dangerously-skip-permissions \
    --max-turns 75 \
    --allowedTools "Bash,Read,Write,Edit,Glob,Grep,Task,WebSearch,WebFetch" \
    2>&1 | tee "$output_file" | tee -a "$LOG_FILE"

  local exit_code=${PIPESTATUS[1]}

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
  log "Genuary ${GENUARY_YEAR} Curator Agent"
  log "=========================================="
  log "Year: $GENUARY_YEAR"
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
