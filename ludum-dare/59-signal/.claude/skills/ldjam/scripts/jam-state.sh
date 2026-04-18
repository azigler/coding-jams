#!/usr/bin/env bash
# Print LD59 event metadata — theme, dates, grades, categories.
# Works without a session (event metadata is public).

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

# LD59 node id is 424249 (resolved via walk.sh events/ludum-dare/59)
LD59_ID="${LD59_NODE_ID:-424249}"

resp="$(curl -fsS --max-time 20 "$API/vx/node2/get/$LD59_ID")"

if command -v jq >/dev/null 2>&1; then
  echo "$resp" | jq -r '
    .node[0] as $n |
    "Ludum Dare \($n.slug) — https://ldjam.com\($n.path)",
    "  theme: \($n.meta["event-theme"] // "(not yet revealed)")",
    "  started: \($n.meta["event-start"] // "?")",
    "  ends:    \($n.meta["event-end"] // "?")",
    "  finished: \($n.meta["event-finished"] // "?")   (0 = live, 1 = over)",
    "  can-grade: \($n.meta["can-grade"] // "?")       (0 = voting closed, 1 = open)",
    "  categories: jam, compo, extra",
    "  grades: Overall, Fun, Innovation, Theme, Graphics, Audio, Humor, Mood"
  '
else
  echo "$resp"
fi
