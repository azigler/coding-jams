#!/usr/bin/env bash
# Publish a devlog markdown file as a post under the authenticated user's profile.
# Usage: publish-post.sh <path/to/draft.md>
#
# NOTE: This is a scaffold. The exact /vx/node/add payload for ldjam posts is
# not yet verified end-to-end — the first real publish should be done with
# `--dry-run` to inspect the request, then without it to send. If ldjam rejects
# the shape, inspect the browser devtools on a real manual post and update.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then DRY_RUN=1; shift; fi

if [[ $# -lt 1 ]]; then
  echo "usage: publish-post.sh [--dry-run] <draft.md>" >&2
  exit 1
fi

draft="$1"
if [[ ! -f "$draft" ]]; then
  echo "error: $draft not found" >&2
  exit 1
fi

require_session

# Parse front matter. Expect YAML block delimited by --- on first line.
title=""
subtitle=""
tags=""
body=""

awk 'BEGIN{mode="pre"}
/^---$/ { if (mode=="pre") {mode="fm"; next} else if (mode=="fm") {mode="body"; next} }
{ if (mode=="fm") print "FM:"$0; else if (mode=="body") print "BODY:"$0 }
' "$draft" > /tmp/ldjam-parse.$$

title="$(grep '^FM:title:' /tmp/ldjam-parse.$$ | sed 's/^FM:title:[[:space:]]*//' | sed 's/^"\(.*\)"$/\1/' | head -1)"
subtitle="$(grep '^FM:subtitle:' /tmp/ldjam-parse.$$ | sed 's/^FM:subtitle:[[:space:]]*//' | sed 's/^"\(.*\)"$/\1/' | head -1)"
body="$(grep '^BODY:' /tmp/ldjam-parse.$$ | sed 's/^BODY://' | sed '1{/^$/d}')"
rm -f /tmp/ldjam-parse.$$

if [[ -z "$title" ]]; then
  echo "error: draft must have a 'title:' front-matter key" >&2
  exit 1
fi

# ldjam posts are created as type=post under the user node.
# Caller is derived from the SIDS cookie; the API sets parent automatically.
resp_log="$(mktemp)"
trap 'rm -f "$resp_log"' EXIT

payload_body="$body"
if [[ -n "$subtitle" ]]; then
  payload_body="_${subtitle}_

$payload_body"
fi

echo "→ Draft: $draft"
echo "  title: $title"
[[ -n "$subtitle" ]] && echo "  subtitle: $subtitle"
echo "  body length: ${#payload_body} chars"

if [[ $DRY_RUN -eq 1 ]]; then
  echo
  echo "--- DRY RUN — would POST to $API/vx/node/add ---"
  echo "type=post"
  echo "name=$title"
  echo "body=<<<$payload_body>>>"
  echo "scope=public"
  exit 0
fi

echo
echo "✗ publish-post.sh not yet activated for live POST."
echo "  The /vx/node/add payload shape needs verification against a real"
echo "  ldjam browser session. Open the jam site, post a test entry manually,"
echo "  copy the devtools request, and update this script with the real"
echo "  field names + parent handling."
echo
echo "  Until then, use this script with --dry-run to validate drafts."
exit 2
