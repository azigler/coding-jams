#!/usr/bin/env bash
# =============================================================================
# tmux-agents.sh — Tmux-based agent runtime
# =============================================================================
#
# Provides functions for running Claude agents in tmux windows where both
# humans and orchestrator agents can monitor, intervene, and collaborate.
#
# Usage:
#   source scripts/lib/tmux-agents.sh
#   agent_start "curator" "Your prompt here" [options]
#   agent_status "curator-0128-1830"
#   agent_cleanup 24  # cleanup done windows older than 24h
#

TMUX_SESSION="${TMUX_AGENT_SESSION:-genuary-agents}"
AGENTS_LOG_DIR="${AGENTS_LOG_DIR:-$(pwd)/logs/agents}"

# =============================================================================
# Core Functions
# =============================================================================

# Ensure the agents tmux session exists
ensure_session() {
  if ! tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
    tmux new-session -d -s "$TMUX_SESSION" -n "control"
    tmux send-keys -t "$TMUX_SESSION:control" "echo 'Genuary Agents Session - use tmux attach -t $TMUX_SESSION'" Enter
  fi
}

# Generate a window name with timestamp
# Args: $1 = agent type (curator, day-28, etc.)
make_window_name() {
  local agent_type="$1"
  local timestamp
  timestamp=$(date +%m%d-%H%M)
  echo "${agent_type}-${timestamp}"
}

# Start an agent in a new tmux window
# Args: $1 = agent type, $2 = prompt, $3... = extra claude args
agent_start() {
  local agent_type="$1"
  local prompt="$2"
  shift 2
  local extra_args=("$@")

  ensure_session

  local window_name
  window_name=$(make_window_name "$agent_type")

  local log_file="${AGENTS_LOG_DIR}/${window_name}.log"
  mkdir -p "$AGENTS_LOG_DIR"

  # Create a wrapper script that:
  # 1. Runs claude with the prompt
  # 2. Captures the session ID
  # 3. Shows completion status
  # 4. Marks window as done
  # 5. Waits before closing (or stays open)

  local wrapper_script
  wrapper_script=$(cat <<WRAPPER_EOF
#!/usr/bin/env bash
set -e

PROMPT=\$(cat <<'PROMPT_EOF'
$prompt
PROMPT_EOF
)

LOG_FILE="$log_file"
WINDOW_NAME="$window_name"
SESSION="$TMUX_SESSION"

echo "═══════════════════════════════════════════════════════════════"
echo "Agent: $agent_type"
echo "Window: \$WINDOW_NAME"
echo "Log: \$LOG_FILE"
echo "Started: \$(date)"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Run claude interactively, tee to log
echo "\$PROMPT" | tee -a "\$LOG_FILE" | claude \\
  --dangerously-skip-permissions \\
  --max-turns 75 \\
  ${extra_args[*]} \\
  2>&1 | tee -a "\$LOG_FILE"

EXIT_CODE=\$?

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Agent finished at \$(date) with exit code \$EXIT_CODE"
echo "Session can be resumed from: \$LOG_FILE"
echo "═══════════════════════════════════════════════════════════════"

# Mark window as done by renaming
tmux rename-window -t "\$SESSION:\$WINDOW_NAME" "[done] \$WINDOW_NAME" 2>/dev/null || true

# Keep window open for inspection (user can close manually)
echo ""
echo "Press Enter to close this window, or leave it for inspection..."
read -r
WRAPPER_EOF
)

  # Create the window and run the wrapper
  tmux new-window -t "$TMUX_SESSION" -n "$window_name" "bash -c '$wrapper_script'"

  echo "$window_name"
}

# Check status of an agent window
# Args: $1 = window name
agent_status() {
  local window_name="$1"

  if tmux list-windows -t "$TMUX_SESSION" -F '#{window_name}' 2>/dev/null | grep -q "^\[done\] ${window_name}$"; then
    echo "done"
  elif tmux list-windows -t "$TMUX_SESSION" -F '#{window_name}' 2>/dev/null | grep -q "^${window_name}$"; then
    echo "running"
  else
    echo "not_found"
  fi
}

# List all agent windows
agent_list() {
  ensure_session
  tmux list-windows -t "$TMUX_SESSION" -F '#{window_name} #{window_activity}' 2>/dev/null
}

# Get recent output from an agent window
# Args: $1 = window name, $2 = lines (default 20)
agent_peek() {
  local window_name="$1"
  local lines="${2:-20}"

  # Try with [done] prefix first, then without
  tmux capture-pane -t "$TMUX_SESSION:[done] $window_name" -p -S -"$lines" 2>/dev/null || \
  tmux capture-pane -t "$TMUX_SESSION:$window_name" -p -S -"$lines" 2>/dev/null
}

# Send input to an agent window (for intervention)
# Args: $1 = window name, $2 = text to send
agent_send() {
  local window_name="$1"
  local text="$2"

  tmux send-keys -t "$TMUX_SESSION:$window_name" "$text" Enter 2>/dev/null || \
  tmux send-keys -t "$TMUX_SESSION:[done] $window_name" "$text" Enter 2>/dev/null
}

# Cleanup old done windows
# Args: $1 = max age in hours (default 24)
agent_cleanup() {
  local max_age_hours="${1:-24}"
  local max_age_seconds=$((max_age_hours * 3600))
  local now
  now=$(date +%s)

  ensure_session

  local cleaned=0

  # Get all [done] windows with their last activity time
  while IFS=' ' read -r window_name activity; do
    if [[ "$window_name" == "[done]"* ]]; then
      local age=$((now - activity))
      if [[ $age -gt $max_age_seconds ]]; then
        tmux kill-window -t "$TMUX_SESSION:$window_name" 2>/dev/null && ((cleaned++))
      fi
    fi
  done < <(tmux list-windows -t "$TMUX_SESSION" -F '#{window_name} #{window_activity}' 2>/dev/null)

  echo "Cleaned up $cleaned old windows"
}

# Kill an agent window immediately
# Args: $1 = window name
agent_kill() {
  local window_name="$1"

  tmux kill-window -t "$TMUX_SESSION:$window_name" 2>/dev/null || \
  tmux kill-window -t "$TMUX_SESSION:[done] $window_name" 2>/dev/null
}

# =============================================================================
# Convenience Functions
# =============================================================================

# Attach to the agents session
agent_attach() {
  ensure_session
  tmux attach -t "$TMUX_SESSION"
}

# Show help
agent_help() {
  cat <<EOF
Tmux Agent Runtime Commands:

  agent_start TYPE PROMPT [ARGS]  - Start agent in new window
  agent_status WINDOW            - Check if running/done/not_found
  agent_list                     - List all agent windows
  agent_peek WINDOW [LINES]      - See recent output
  agent_send WINDOW TEXT         - Send input to agent
  agent_cleanup [HOURS]          - Remove old done windows (default 24h)
  agent_kill WINDOW              - Force kill an agent window
  agent_attach                   - Attach to agents session

Session name: $TMUX_SESSION
Attach with: tmux attach -t $TMUX_SESSION
EOF
}
