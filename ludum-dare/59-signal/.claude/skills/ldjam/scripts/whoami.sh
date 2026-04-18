#!/usr/bin/env bash
# Print the current session's user info. Exit non-zero if session is invalid.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

# The API echoes "caller_id":<your-uid> in every response when authenticated,
# even on errors. We hit a deliberately-bad node path so the response is small,
# and drop -f so we still parse the 400 body.
resp="$(curl -sS --max-time 15 -H "Cookie: SIDS=$(sids)" "$API/vx/node/get/me")"
uid="$(echo "$resp" | sed -n 's/.*"caller_id":\([0-9]*\).*/\1/p')"

if [[ -z "$uid" || "$uid" == "0" ]]; then
  echo "✗ session invalid or expired. Run login.sh." >&2
  exit 1
fi

# Fetch the node for pretty display.
profile="$(api_get "/vx/node2/get/$uid")"
slug="$(echo "$profile" | sed -n 's/.*"slug":"\([^"]*\)".*/\1/p' | head -1)"
name="$(echo "$profile" | sed -n 's/.*"name":"\([^"]*\)".*/\1/p' | head -1)"

echo "✓ authenticated"
echo "  user: $name (@$slug, id $uid)"
echo "  profile: https://ldjam.com/users/$slug"
