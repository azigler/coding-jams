#!/usr/bin/env bash
# Fetch an ldjam node by id. Pretty-prints if jq is available.
# Usage: get-node.sh <id>

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

if [[ $# -lt 1 ]]; then
  echo "usage: get-node.sh <id>" >&2
  exit 1
fi

api_get "/vx/node2/get/$1" | jq_or_cat .
