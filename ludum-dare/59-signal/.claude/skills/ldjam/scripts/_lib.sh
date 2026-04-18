#!/usr/bin/env bash
# Shared helpers for ldjam scripts. Source, don't execute.

set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_DIR="$(cd "$SKILL_DIR/../.." && pwd)"
SESSION_FILE="$CLAUDE_DIR/.ldjam-session"
CREDS_FILE="$CLAUDE_DIR/.ldjam-credentials"
API="https://api.ldjam.com"

require_session() {
  if [[ ! -s "$SESSION_FILE" ]]; then
    echo "error: no session cached. Run .claude/skills/ldjam/scripts/login.sh first." >&2
    exit 1
  fi
}

sids() {
  require_session
  cat "$SESSION_FILE"
}

api_get() {
  local path="$1"
  curl -fsS --max-time 20 -H "Cookie: SIDS=$(sids)" "$API$path"
}

api_post() {
  local path="$1"; shift
  curl -fsS --max-time 20 -H "Cookie: SIDS=$(sids)" -X POST "$API$path" "$@"
}

jq_or_cat() {
  if command -v jq >/dev/null 2>&1; then jq "$@"; else cat; fi
}
