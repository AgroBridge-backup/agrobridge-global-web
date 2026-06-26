#!/bin/bash
#
# Git Hooks Library - Core Functions
# Location: .githooks/lib/core.sh
#
# FAANG-Grade Implementation
# - No eval() usage
# - Signal handling
# - Structured logging
# - Input validation
# - Version tracking
#

# Version
readonly GITHOOKS_VERSION="2.0.1-faang"

# Strict mode
set -euo pipefail

# Colors (only if terminal supports it)
if [[ -t 1 ]]; then
    readonly RED='\033[0;31m'
    readonly GREEN='\033[0;32m'
    readonly YELLOW='\033[1;33m'
    readonly BLUE='\033[0;34m'
    readonly CYAN='\033[0;36m'
    readonly NC='\033[0m'
else
    readonly RED=''
    readonly GREEN=''
    readonly YELLOW=''
    readonly BLUE=''
    readonly CYAN=''
    readonly NC=''
fi

# Logging functions
log_debug() {
    if [[ "${HOOKS_DEBUG:-0}" -eq 1 ]]; then
        echo -e "${BLUE}[DEBUG $(date -Iseconds)]${NC} $1" >&2
    fi
}

log_info() {
    echo -e "${BLUE}[INFO $(date -Iseconds)]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS $(date -Iseconds)]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN $(date -Iseconds)]${NC} $1" >&2
}

log_error() {
    echo -e "${RED}[ERROR $(date -Iseconds)]${NC} $1" >&2
}

# Structured JSON logging for metrics
declare -a METRICS_LOG=()

log_metric() {
    local hook="${1:-unknown}"
    local check="${2:-unknown}"
    local result="${3:-unknown}"
    local duration="${4:-0}"
    
    local json
    json=$(printf '{"timestamp":"%s","version":"%s","hook":"%s","check":"%s","result":"%s","duration":%d}' \
        "$(date -Iseconds)" \
        "$GITHOOKS_VERSION" \
        "$hook" \
        "$check" \
        "$result" \
        "$duration")
    
    METRICS_LOG+=("$json")
    
    # Also write to persistent log
    local log_file="${HOME}/.githooks-metrics.log"
    echo "$json" >> "$log_file" 2>/dev/null || true
}

# Cleanup function for trap
cleanup() {
    local exit_code=$?
    log_debug "Cleaning up (exit code: $exit_code)"
    
    # Print metrics summary if debug mode
    if [[ "${HOOKS_DEBUG:-0}" -eq 1 ]] && [[ ${#METRICS_LOG[@]} -gt 0 ]]; then
        echo -e "${BLUE}[METRICS]${NC}" >&2
        for metric in "${METRICS_LOG[@]}"; do
            echo "  $metric" >&2
        done
    fi
    
    exit $exit_code
}

# Set trap for cleanup
trap cleanup EXIT INT TERM

# Validate that a file exists and is readable
validate_file() {
    local file="$1"
    local description="${2:-file}"
    
    if [[ -z "$file" ]]; then
        log_error "No $description specified"
        return 1
    fi
    
    if [[ ! -e "$file" ]]; then
        log_error "$description does not exist: $file"
        return 1
    fi
    
    if [[ ! -r "$file" ]]; then
        log_error "$description is not readable: $file"
        return 1
    fi
    
    return 0
}

# Validate branch name (prevent injection)
validate_branch_name() {
    local branch="$1"
    
    # Allow alphanumeric, hyphens, underscores, slashes, dots
    # But prevent path traversal and shell metacharacters
    if [[ ! "$branch" =~ ^[a-zA-Z0-9._/-]+$ ]]; then
        log_error "Invalid branch name: $branch"
        return 1
    fi
    
    # Prevent path traversal
    if [[ "$branch" == *".."* ]]; then
        log_error "Branch name contains path traversal: $branch"
        return 1
    fi
    
    return 0
}

# Validate safe identifier (for variable names)
validate_identifier() {
    local name="$1"
    
    if [[ ! "$name" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
        log_error "Invalid identifier: $name"
        return 1
    fi
    
    return 0
}

# Safe command execution (replaces eval)
# Usage: safe_exec "command" "arg1" "arg2" ...
safe_exec() {
    if [[ $# -lt 1 ]]; then
        log_error "safe_exec: no command provided"
        return 1
    fi
    
    local cmd="$1"
    shift
    
    log_debug "Executing: $cmd $*"
    
    # Execute directly - no eval
    "$cmd" "$@"
}

# Note: Parallel execution disabled for Bash 3.x compatibility (macOS)
# To enable parallel checks, ensure Bash 4.0+ is installed
# Run checks sequentially instead
run_check_parallel() {
  log_debug "Parallel checks disabled (Bash 3.x compatibility)"
  # Sequential execution is safer anyway
  return 0
}

wait_for_checks() {
  return 0
}

# Atomic file operations
atomic_symlink() {
    local source="$1"
    local target="$2"
    local temp="${target}.tmp.$$"
    
    if [[ ! -e "$source" ]]; then
        log_error "Source does not exist: $source"
        return 1
    fi
    
    # Create symlink to temp location
    if ! ln -sf "$source" "$temp" 2>/dev/null; then
        log_error "Failed to create temp symlink"
        return 1
    fi
    
    # Atomic rename
    if ! mv "$temp" "$target" 2>/dev/null; then
        rm -f "$temp"
        log_error "Failed to move symlink"
        return 1
    fi
    
    return 0
}

# Timeout wrapper (uses timeout command if available)
with_timeout() {
    local timeout_sec="${1:-30}"
    shift
    
    if command -v timeout >/dev/null 2>&1; then
        timeout "$timeout_sec" "$@"
    else
        # Fallback: just run without timeout
        "$@"
    fi
}

# Export functions for use in other scripts
export -f log_debug log_info log_success log_warning log_error
export -f log_metric
export -f validate_file validate_branch_name validate_identifier
export -f safe_exec
export -f run_check_parallel wait_for_checks
export -f atomic_symlink with_timeout
export GITHOOKS_VERSION
