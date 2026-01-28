#!/usr/bin/env bash
#
# Year Configuration Library for Genuary Multi-Year Support
#
# This library provides year detection and configuration for Genuary scripts.
# It can detect the year from:
#   1. GENUARY_YEAR environment variable
#   2. The directory name (genuary/YYYY)
#   3. The current date (during January)
#
# Usage:
#   source "$(dirname "$0")/lib/year-config.sh"
#   echo "Year: $GENUARY_YEAR"
#   echo "Project name: $GENUARY_PROJECT_NAME"
#

# =============================================================================
# Year Detection
# =============================================================================

# Detect year from directory path
detect_year_from_path() {
  local script_path="${1:-$0}"
  local dir_path
  dir_path=$(cd "$(dirname "$script_path")/.." 2>/dev/null && pwd)

  # Try to extract year from path like /path/to/genuary/2026
  if [[ "$dir_path" =~ genuary/([0-9]{4})$ ]]; then
    echo "${BASH_REMATCH[1]}"
    return 0
  fi

  return 1
}

# Detect year from current date (only valid in January)
detect_year_from_date() {
  local current_month=$(date +%m)
  if [[ "$current_month" == "01" ]]; then
    date +%Y
    return 0
  fi
  return 1
}

# Main year detection logic
get_genuary_year() {
  # Priority 1: Environment variable
  if [[ -n "${GENUARY_YEAR:-}" ]]; then
    echo "$GENUARY_YEAR"
    return 0
  fi

  # Priority 2: Detect from directory path
  local path_year
  if path_year=$(detect_year_from_path "${BASH_SOURCE[1]:-$0}"); then
    echo "$path_year"
    return 0
  fi

  # Priority 3: Detect from current date (only in January)
  local date_year
  if date_year=$(detect_year_from_date); then
    echo "$date_year"
    return 0
  fi

  # Fallback: Use current year regardless of month
  date +%Y
}

# =============================================================================
# Derived Configuration
# =============================================================================

# Set the year (call this early in scripts)
GENUARY_YEAR="${GENUARY_YEAR:-$(get_genuary_year)}"
export GENUARY_YEAR

# Project identifiers
GENUARY_PROJECT_NAME="genuary-${GENUARY_YEAR}"
export GENUARY_PROJECT_NAME

# File prefixes
GENUARY_FILE_PREFIX="genuary-${GENUARY_YEAR}"
export GENUARY_FILE_PREFIX

# URL paths (for GitHub Pages)
GENUARY_BASE_PATH="/coding-jams/genuary-${GENUARY_YEAR}/"
export GENUARY_BASE_PATH

# =============================================================================
# Path Helpers
# =============================================================================

# Get the repository root for this year
get_genuary_repo_path() {
  if [[ -n "${GENUARY_REPO_PATH:-}" ]]; then
    echo "$GENUARY_REPO_PATH"
  else
    # Assume this script is in scripts/lib/
    cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd
  fi
}

# Generate a timestamped filename
genuary_filename() {
  local day="$1"
  local extension="${2:-png}"
  local day_padded
  day_padded=$(printf '%02d' "$day")
  local timestamp
  timestamp=$(date +%Y%m%d-%H%M%S)
  echo "${GENUARY_FILE_PREFIX}-day-${day_padded}-${timestamp}.${extension}"
}

# =============================================================================
# Logging Helpers
# =============================================================================

log_year_info() {
  echo "=========================================="
  echo "Genuary Multi-Year Configuration"
  echo "=========================================="
  echo "Year: $GENUARY_YEAR"
  echo "Project: $GENUARY_PROJECT_NAME"
  echo "File prefix: $GENUARY_FILE_PREFIX"
  echo "=========================================="
}

# =============================================================================
# Validation
# =============================================================================

validate_year() {
  local year="${1:-$GENUARY_YEAR}"

  # Must be a 4-digit number
  if ! [[ "$year" =~ ^[0-9]{4}$ ]]; then
    echo "ERROR: Invalid year format: $year" >&2
    return 1
  fi

  # Must be >= 2024 (first Genuary year this system supports)
  if [[ "$year" -lt 2024 ]]; then
    echo "ERROR: Year must be 2024 or later: $year" >&2
    return 1
  fi

  # Must be <= current year + 1 (reasonable future limit)
  local max_year=$(($(date +%Y) + 1))
  if [[ "$year" -gt "$max_year" ]]; then
    echo "ERROR: Year seems too far in the future: $year" >&2
    return 1
  fi

  return 0
}
