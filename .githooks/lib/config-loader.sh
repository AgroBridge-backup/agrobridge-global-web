#!/bin/bash
#
# Git Hooks Config Loader
# Location: .githooks/lib/config-loader.sh
#
# Loads configuration from .githooks-config file
# Provides defaults and handles environment variable overrides
#

# Default configuration
load_default_config() {
  # General settings
  ENABLE_PRE_COMMIT="${ENABLE_PRE_COMMIT:-true}"
  ENABLE_COMMIT_MSG="${ENABLE_COMMIT_MSG:-true}"
  ENABLE_PRE_PUSH="${ENABLE_PRE_PUSH:-true}"
  ENABLE_POST_MERGE="${ENABLE_POST_MERGE:-true}"
  ENABLE_PRE_REBASE="${ENABLE_PRE_REBASE:-true}"
  ENABLE_POST_CHECKOUT="${ENABLE_POST_CHECKOUT:-true}"
  ENABLE_PREPARE_COMMIT_MSG="${ENABLE_PREPARE_COMMIT_MSG:-true}"
  
  # Pre-commit settings
  PRECOMMIT_RUN_LINT="${PRECOMMIT_RUN_LINT:-true}"
  PRECOMMIT_RUN_TESTS="${PRECOMMIT_RUN_TESTS:-true}"
  PRECOMMIT_RUN_CONFIG_VALIDATION="${PRECOMMIT_RUN_CONFIG_VALIDATION:-true}"
  PRECOMMIT_RUN_SKILL_AUDIT="${PRECOMMIT_RUN_SKILL_AUDIT:-true}"
  PRECOMMIT_RUN_SECRETS_SCAN="${PRECOMMIT_RUN_SECRETS_SCAN:-true}"
  PRECOMMIT_TEST_PATTERNS="${PRECOMMIT_TEST_PATTERNS:-*.test.js *.test.mjs *.spec.js *.spec.mjs}"
  
  # Commit-msg settings
  COMMIT_TYPES="${COMMIT_TYPES:-feat fix docs style refactor test chore security db build ci perf revert}"
  COMMIT_MAX_LENGTH="${COMMIT_MAX_LENGTH:-72}"
  COMMIT_REQUIRE_SCOPE_FOR="${COMMIT_REQUIRE_SCOPE_FOR:-feat fix security}"
  
  # Pre-push settings
  PREPUSH_RUN_UNIT_TESTS="${PREPUSH_RUN_UNIT_TESTS:-true}"
  PREPUSH_RUN_INTEGRATION_TESTS="${PREPUSH_RUN_INTEGRATION_TESTS:-true}"
  PREPUSH_RUN_SECURITY_TESTS="${PREPUSH_RUN_SECURITY_TESTS:-true}"
  PREPUSH_RUN_ACCESSIBILITY_TESTS="${PREPUSH_RUN_ACCESSIBILITY_TESTS:-true}"
  PREPUSH_RUN_SMOKE_TESTS="${PREPUSH_RUN_SMOKE_TESTS:-true}"
  PREPUSH_RUN_SKILL_AUDITS="${PREPUSH_RUN_SKILL_AUDITS:-true}"
  PREPUSH_FULL_TEST_BRANCHES="${PREPUSH_FULL_TEST_BRANCHES:-main develop}"
  PREPUSH_WIP_BRANCH_PREFIXES="${PREPUSH_WIP_BRANCH_PREFIXES:-wip draft tmp experiment}"
  PREPUSH_MAX_FILE_SIZE="${PREPUSH_MAX_FILE_SIZE:-10}"
  
  # Pre-rebase settings
  PROTECTED_BRANCHES="${PROTECTED_BRANCHES:-main master develop}"
  REBASE_WARN_COMMIT_COUNT="${REBASE_WARN_COMMIT_COUNT:-50}"
  REBASE_WARN_CONFLICT_FILES="${REBASE_WARN_CONFLICT_FILES:-10}"
  REBASE_AUTO_STASH="${REBASE_AUTO_STASH:-true}"
  
  # Post-merge settings
  POSTMERGE_AUTO_MIGRATE="${POSTMERGE_AUTO_MIGRATE:-false}"
  POSTMERGE_AUTO_INSTALL="${POSTMERGE_AUTO_INSTALL:-true}"
  POSTMERGE_AUTO_BUILD="${POSTMERGE_AUTO_BUILD:-true}"
  POSTMERGE_AUTO_CLEAR_CACHE="${POSTMERGE_AUTO_CLEAR_CACHE:-true}"
}

# Load config from file
load_config_file() {
  local config_file="${1:-.githooks-config}"
  
  if [ ! -f "$config_file" ]; then
    debug "Config file not found: $config_file"
    return 0
  fi
  
  debug "Loading config from: $config_file"
  
  while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip comments and empty lines
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue
    [[ "$line" =~ ^\[.*\]$ ]] && continue  # Skip section headers
    
    # Parse key=value pairs
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      local key="${BASH_REMATCH[1]}"
      local value="${BASH_REMATCH[2]}"
      
      # Remove surrounding quotes if present
      value="${value%\"}"
      value="${value#\"}"
      value="${value%\'}"
      value="${value#\'}"
      
      # Only set if not already set by environment
      if [ -z "${!key:-}" ]; then
        eval "$key='$value'"
        debug "Set $key=$value"
      fi
    fi
  done < "$config_file"
}

# Get config value with default
get_config() {
  local key=$1
  local default_value=${2:-}
  
  # Check environment variable first
  local env_value="${!key:-}"
  if [ -n "$env_value" ]; then
    echo "$env_value"
    return 0
  fi
  
  # Return default
  echo "$default_value"
}

# Check if feature is enabled
is_enabled() {
  local key=$1
  local value=$(get_config "$key" "true")
  
  case "$value" in
    [Tt][Rr][Uu][Ee]|1|[Yy][Ee][Ss])
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

# Initialize config
init_config() {
  load_default_config
  load_config_file "${1:-.githooks-config}"
}

# Export functions for use in other scripts
export -f load_default_config
export -f load_config_file
export -f get_config
export -f is_enabled
export -f init_config
