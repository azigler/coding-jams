#!/usr/bin/env bash
# Resolve a slug path to a node id. Usage: walk.sh events/ludum-dare/59

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

if [[ $# -lt 1 ]]; then
  echo "usage: walk.sh <slug-path>" >&2
  echo "example: walk.sh events/ludum-dare/59" >&2
  exit 1
fi

api_get "/vx/node2/walk/1/$1" | jq_or_cat .
