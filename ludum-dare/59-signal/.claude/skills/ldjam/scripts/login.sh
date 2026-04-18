#!/usr/bin/env bash
# Authenticate with ldjam.com; cache session cookie in .claude/.ldjam-session.
# Credentials from .claude/.ldjam-credentials (JSON: {"login":"…","pw":"…"})
# or LDJAM_LOGIN / LDJAM_PW env vars.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

LOGIN="${LDJAM_LOGIN:-}"
PW="${LDJAM_PW:-}"

if [[ -z "$LOGIN" || -z "$PW" ]] && [[ -s "$CREDS_FILE" ]]; then
  if command -v jq >/dev/null 2>&1; then
    LOGIN="$(jq -r '.login // empty' "$CREDS_FILE")"
    PW="$(jq -r '.pw // empty' "$CREDS_FILE")"
  else
    LOGIN="$(grep -oP '"login"\s*:\s*"\K[^"]+' "$CREDS_FILE" || true)"
    PW="$(grep -oP '"pw"\s*:\s*"\K[^"]+' "$CREDS_FILE" || true)"
  fi
fi

if [[ -z "$LOGIN" || -z "$PW" ]]; then
  echo "error: missing credentials." >&2
  echo "Provide one of:" >&2
  echo "  - $CREDS_FILE  (JSON: {\"login\":\"…\",\"pw\":\"…\"})" >&2
  echo "  - LDJAM_LOGIN / LDJAM_PW env vars" >&2
  exit 1
fi

headers="$(mktemp)"
trap 'rm -f "$headers"' EXIT

body="$(curl -fsS --max-time 20 -D "$headers" -X POST "$API/vx/user/login" \
  --data-urlencode "login=$LOGIN" \
  --data-urlencode "pw=$PW")"

sids="$(grep -i '^set-cookie:' "$headers" | sed -n 's/.*SIDS=\([^;]*\).*/\1/p' | head -1)"

if [[ -z "$sids" ]]; then
  echo "error: login did not return a session cookie." >&2
  echo "Response: $body" >&2
  exit 1
fi

umask 077
echo -n "$sids" > "$SESSION_FILE"
chmod 600 "$SESSION_FILE"

uid="$(echo "$body" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')"
mail="$(echo "$body" | sed -n 's/.*"mail":"\([^"]*\)".*/\1/p')"
echo "✓ logged in as $mail (id $uid)"
echo "  session cached in $SESSION_FILE"
