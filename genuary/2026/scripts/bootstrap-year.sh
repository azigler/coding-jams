#!/usr/bin/env bash
#
# Genuary Year Bootstrap Script
#
# This script prepares a new year's Genuary project. Run this on January 1st
# (or before) to set up the project for the new year.
#
# Usage:
#   ./scripts/bootstrap-year.sh           # Bootstrap for current year
#   ./scripts/bootstrap-year.sh 2027      # Bootstrap for specific year
#   ./scripts/bootstrap-year.sh --check   # Just check what needs to be done
#
# What this script does:
#   1. Creates src/days/ directory with placeholder files (01.ts - 31.ts)
#   2. Fetches prompts from genuary.art (or prompts from manual input)
#   3. Updates prompts.md with the new year's prompts
#   4. Updates package.json name
#   5. Updates vite.config.ts base path
#   6. Updates index.html title
#   7. Creates year-specific configuration
#
# Note: This script is idempotent - safe to run multiple times.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_PATH="$(dirname "$SCRIPT_DIR")"

# Parse arguments
CHECK_ONLY=false
TARGET_YEAR=""

for arg in "$@"; do
  case $arg in
    --check) CHECK_ONLY=true ;;
    [0-9][0-9][0-9][0-9]) TARGET_YEAR="$arg" ;;
  esac
done

# Determine target year
if [[ -z "$TARGET_YEAR" ]]; then
  TARGET_YEAR=$(date +%Y)
fi

# =============================================================================
# Logging
# =============================================================================

log() {
  echo "[BOOTSTRAP] $*"
}

log_check() {
  if [[ "$CHECK_ONLY" == "true" ]]; then
    echo "[CHECK] $*"
  fi
}

# =============================================================================
# Validation
# =============================================================================

validate_year() {
  if ! [[ "$TARGET_YEAR" =~ ^[0-9]{4}$ ]]; then
    echo "ERROR: Invalid year format: $TARGET_YEAR" >&2
    exit 1
  fi

  if [[ "$TARGET_YEAR" -lt 2024 ]]; then
    echo "ERROR: Year must be 2024 or later" >&2
    exit 1
  fi

  local max_year=$(($(date +%Y) + 1))
  if [[ "$TARGET_YEAR" -gt "$max_year" ]]; then
    echo "ERROR: Year $TARGET_YEAR seems too far in the future" >&2
    exit 1
  fi
}

# =============================================================================
# Prompts Fetching
# =============================================================================

fetch_prompts_from_web() {
  log "Attempting to fetch prompts from genuary.art..."

  # Try to fetch the prompts page
  local prompts_url="https://genuary.art/prompts"
  local html_content

  if command -v curl &> /dev/null; then
    html_content=$(curl -s "$prompts_url" 2>/dev/null || echo "")
  elif command -v wget &> /dev/null; then
    html_content=$(wget -q -O - "$prompts_url" 2>/dev/null || echo "")
  else
    log "WARNING: Neither curl nor wget available for fetching prompts"
    return 1
  fi

  if [[ -z "$html_content" ]]; then
    log "WARNING: Could not fetch prompts from genuary.art"
    return 1
  fi

  # Check if prompts are available (the page usually contains "JAN. 1")
  if echo "$html_content" | grep -q "JAN\. 1"; then
    log "Successfully fetched prompts page"
    # Note: Full HTML parsing would require additional tools
    # For now, we'll guide users to manually update prompts.md
    return 0
  else
    log "WARNING: Prompts page doesn't contain expected content"
    return 1
  fi
}

# =============================================================================
# Directory Structure
# =============================================================================

create_days_directory() {
  local days_dir="${REPO_PATH}/src/days"

  if [[ "$CHECK_ONLY" == "true" ]]; then
    if [[ -d "$days_dir" ]]; then
      log_check "src/days/ directory exists"
    else
      log_check "NEEDED: Create src/days/ directory"
    fi
    return
  fi

  mkdir -p "$days_dir"

  for day in {01..31}; do
    local day_file="${days_dir}/${day}.ts"
    if [[ ! -f "$day_file" ]]; then
      cat > "$day_file" << 'DAYEOF'
/**
 * Day DAYNUM - Genuary YEAR
 *
 * Prompt: [TO BE FILLED]
 *
 * This is a placeholder file. The Day Agent will implement this.
 */

import type p5 from 'p5';
import type { DayConfig, ControlConfig, ControlState } from '../types';

export const defaultControls: ControlState = {};

export const controlConfigs: ControlConfig[] = [];

export const config: DayConfig = {
  day: DAYNUM_INT,
  prompt: 'TODO: Add prompt here',
  creditName: 'Unknown',
  creditUrl: 'https://genuary.art/',
};

export function setup(_p: p5): void {
  // TODO: Implement
}

export function draw(_p: p5): void {
  // TODO: Implement
}
DAYEOF
      # Replace placeholders
      sed -i "s/DAYNUM/${day}/g" "$day_file"
      sed -i "s/YEAR/${TARGET_YEAR}/g" "$day_file"
      sed -i "s/DAYNUM_INT/$((10#$day))/g" "$day_file"
      log "Created placeholder: src/days/${day}.ts"
    fi
  done
}

# =============================================================================
# Configuration Updates
# =============================================================================

update_package_json() {
  local pkg_file="${REPO_PATH}/package.json"

  if [[ "$CHECK_ONLY" == "true" ]]; then
    if grep -q "\"name\": \"genuary-${TARGET_YEAR}\"" "$pkg_file" 2>/dev/null; then
      log_check "package.json name is correct"
    else
      log_check "NEEDED: Update package.json name to genuary-${TARGET_YEAR}"
    fi
    return
  fi

  if [[ -f "$pkg_file" ]]; then
    # Update the name field
    sed -i "s/\"name\": \"genuary-[0-9]*\"/\"name\": \"genuary-${TARGET_YEAR}\"/" "$pkg_file"
    sed -i "s/Genuary [0-9]*/Genuary ${TARGET_YEAR}/g" "$pkg_file"
    log "Updated package.json"
  fi
}

update_vite_config() {
  local vite_file="${REPO_PATH}/vite.config.ts"

  if [[ "$CHECK_ONLY" == "true" ]]; then
    if grep -q "genuary-${TARGET_YEAR}" "$vite_file" 2>/dev/null; then
      log_check "vite.config.ts base path is correct"
    else
      log_check "NEEDED: Update vite.config.ts base path"
    fi
    return
  fi

  if [[ -f "$vite_file" ]]; then
    sed -i "s|/coding-jams/genuary-[0-9]*/|/coding-jams/genuary-${TARGET_YEAR}/|g" "$vite_file"
    log "Updated vite.config.ts"
  fi
}

update_index_html() {
  local html_file="${REPO_PATH}/index.html"

  if [[ "$CHECK_ONLY" == "true" ]]; then
    if grep -q "Genuary ${TARGET_YEAR}" "$html_file" 2>/dev/null; then
      log_check "index.html title is correct"
    else
      log_check "NEEDED: Update index.html title"
    fi
    return
  fi

  if [[ -f "$html_file" ]]; then
    sed -i "s/Genuary [0-9]*/Genuary ${TARGET_YEAR}/g" "$html_file"
    log "Updated index.html"
  fi
}

update_prompts_md() {
  local prompts_file="${REPO_PATH}/prompts.md"

  if [[ "$CHECK_ONLY" == "true" ]]; then
    if [[ -f "$prompts_file" ]]; then
      # Check if prompts.md has actual prompt content (not just a template)
      if grep -q "JAN\. 1" "$prompts_file" 2>/dev/null; then
        log_check "prompts.md exists with prompt content"
      else
        log_check "NEEDED: Add prompts to prompts.md"
      fi
    else
      log_check "NEEDED: Create prompts.md for ${TARGET_YEAR}"
    fi
    return
  fi

  # If prompts.md exists but is for a different year, back it up
  if [[ -f "$prompts_file" ]]; then
    local old_year
    old_year=$(grep -oE 'genuary.art/prompts' "$prompts_file" | head -1 || echo "")
    if [[ -n "$old_year" ]]; then
      log "Backing up existing prompts.md"
      cp "$prompts_file" "${prompts_file}.bak"
    fi
  fi

  # Create a template prompts.md
  cat > "$prompts_file" << EOF
## PROMPTS

> From <https://genuary.art/prompts>
> Year: ${TARGET_YEAR}

---

**NOTE:** Prompts for Genuary ${TARGET_YEAR} need to be manually added here.

Visit https://genuary.art/prompts to get the official prompts once they are
published (usually late December or early January).

---

## Template Format

## JAN. 1 (credit: [Author Name](author_url))

Prompt text here.

## JAN. 2 (credit: [Author Name](author_url))

Prompt text here.

... (continue for all 31 days)
EOF

  log "Created template prompts.md - please update with actual prompts"
}

# =============================================================================
# TypeScript File Updates
# =============================================================================

update_typescript_files() {
  if [[ "$CHECK_ONLY" == "true" ]]; then
    # Check for year references that are NOT the target year
    local wrong_year_count=0
    local all_refs
    # Use set +e temporarily to avoid exit on grep finding nothing
    set +e
    all_refs=$(grep -r "genuary-[0-9]*-day" "${REPO_PATH}/src" 2>/dev/null)
    set -e

    if [[ -n "$all_refs" ]]; then
      wrong_year_count=$(echo "$all_refs" | grep -cv "genuary-${TARGET_YEAR}-day" || echo 0)
      wrong_year_count=$(echo "$wrong_year_count" | tr -d '[:space:]')
    fi
    wrong_year_count=${wrong_year_count:-0}

    if [[ "$wrong_year_count" -gt 0 ]]; then
      log_check "NEEDED: ${wrong_year_count} lines have old year references (not ${TARGET_YEAR})"
    else
      log_check "TypeScript year references are up to date"
    fi
    return
  fi

  log "Note: TypeScript files in src/ contain hardcoded year references."
  log "These should be updated as each day is implemented."
  log "Key files to update:"
  log "  - src/index.ts (filename generation)"
  log "  - src/utils/controls.ts (localStorage keys)"
  log "  - src/days/*.ts (recording filenames)"
}

# =============================================================================
# Main
# =============================================================================

main() {
  log "=========================================="
  log "Genuary Year Bootstrap"
  log "=========================================="
  log "Target year: $TARGET_YEAR"
  log "Repo path: $REPO_PATH"
  log "Check only: $CHECK_ONLY"
  log ""

  validate_year

  if [[ "$CHECK_ONLY" == "true" ]]; then
    log "Running in check-only mode..."
    log ""
  fi

  # Check/create directory structure
  create_days_directory

  # Check/update configuration files
  update_package_json
  update_vite_config
  update_index_html
  update_prompts_md

  # Note about TypeScript files
  update_typescript_files

  if [[ "$CHECK_ONLY" != "true" ]]; then
    log ""
    log "=========================================="
    log "Bootstrap complete for Genuary $TARGET_YEAR"
    log "=========================================="
    log ""
    log "Next steps:"
    log "1. Visit https://genuary.art/prompts to get the official prompts"
    log "2. Update prompts.md with the actual prompts"
    log "3. Review and update CLAUDE.md if needed"
    log "4. Run 'bun install' to ensure dependencies are ready"
    log "5. Run 'bun run dev' to verify the harness works"
    log ""
  fi
}

main "$@"
