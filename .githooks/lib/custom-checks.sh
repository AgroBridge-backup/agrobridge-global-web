#!/bin/bash
#
# Custom Checks Runner
# Location: .githooks/lib/custom-checks.sh
#
# Runs project-specific custom checks defined in .githooks-config
# Supports: pattern matching, custom commands, coverage checks, etc.
#

# Colors (assumed to be already defined by caller)
: ${RED:='\033[0;31m'}
: ${GREEN:='\033[0;32m'}
: ${YELLOW:='\033[1;33m'}
: ${BLUE:='\033[0;34m'}
: ${NC:='\033[0m'}

# Run custom checks from config
run_custom_checks() {
  local check_type=$1  # pre-commit, pre-push, etc.
  local config_file="${2:-.githooks-config}"
  
  if [ ! -f "$config_file" ]; then
    return 0
  fi
  
  debug() {
    if [ "${HOOKS_DEBUG:-0}" -eq 1 ]; then
      echo -e "${BLUE}[DEBUG]${NC} $1"
    fi
  }
  
  debug "Running custom checks for: $check_type"
  
  # Track results
  local checks_passed=0
  local checks_failed=0
  local total_checks=0
  
  # Read config and find custom checks
  local in_custom_section=false
  local current_check=""
  local check_enabled=""
  local check_pattern=""
  local check_command=""
  local check_message=""
  local check_severity=""
  
  while IFS= read -r line || [[ -n "$line" ]]; do
    # Check for section headers
    if [[ "$line" =~ ^\[check-(.+)\]$ ]]; then
      # Process previous check if we have one
      if [ -n "$current_check" ] && [ "$check_enabled" = "true" ]; then
        total_checks=$((total_checks + 1))
        
        echo -e "${BLUE}▶️  Custom check: $current_check${NC}"
        
        local check_result=0
        
        # Run pattern check if defined
        if [ -n "$check_pattern" ]; then
          if echo "$STAGED_FILES" | grep -qE "$check_pattern"; then
            echo -e "${YELLOW}$check_message${NC}"
            check_result=1
          fi
        fi
        
        # Run command check if defined
        if [ -n "$check_command" ] && [ $check_result -eq 0 ]; then
          if ! eval "$check_command" > /dev/null 2>&1; then
            check_result=1
          fi
        fi
        
        # Handle result based on severity
        if [ $check_result -eq 0 ]; then
          echo -e "${GREEN}✓ $current_check passed${NC}"
          checks_passed=$((checks_passed + 1))
        else
          case "$check_severity" in
            error)
              echo -e "${RED}✗ $current_check failed${NC}"
              checks_failed=$((checks_failed + 1))
              ;;
            warning)
              echo -e "${YELLOW}⚠️  $current_check warning${NC}"
              checks_passed=$((checks_passed + 1))
              ;;
            *)
              echo -e "${BLUE}ℹ️  $current_check info${NC}"
              checks_passed=$((checks_passed + 1))
              ;;
          esac
        fi
      fi
      
      # Start new check
      current_check="${BASH_REMATCH[1]}"
      check_enabled=""
      check_pattern=""
      check_command=""
      check_message=""
      check_severity="warning"
      in_custom_section=true
      continue
    fi
    
    # Skip if not in a custom check section
    if [ "$in_custom_section" != "true" ]; then
      continue
    fi
    
    # Parse check properties
    if [[ "$line" =~ ^enabled=(.*)$ ]]; then
      check_enabled="${BASH_REMATCH[1]}"
    elif [[ "$line" =~ ^pattern=(.*)$ ]]; then
      check_pattern="${BASH_REMATCH[1]}"
    elif [[ "$line" =~ ^command=(.*)$ ]]; then
      check_command="${BASH_REMATCH[1]}"
    elif [[ "$line" =~ ^message=(.*)$ ]]; then
      check_message="${BASH_REMATCH[1]}"
    elif [[ "$line" =~ ^severity=(.*)$ ]]; then
      check_severity="${BASH_REMATCH[1]}"
    fi
  done < "$config_file"
  
  # Process final check
  if [ -n "$current_check" ] && [ "$check_enabled" = "true" ]; then
    total_checks=$((total_checks + 1))
    
    echo -e "${BLUE}▶️  Custom check: $current_check${NC}"
    
    local check_result=0
    
    if [ -n "$check_pattern" ]; then
      if echo "$STAGED_FILES" | grep -qE "$check_pattern"; then
        echo -e "${YELLOW}$check_message${NC}"
        check_result=1
      fi
    fi
    
    if [ -n "$check_command" ] && [ $check_result -eq 0 ]; then
      if ! eval "$check_command" > /dev/null 2>&1; then
        check_result=1
      fi
    fi
    
    if [ $check_result -eq 0 ]; then
      echo -e "${GREEN}✓ $current_check passed${NC}"
      checks_passed=$((checks_passed + 1))
    else
      case "$check_severity" in
        error)
          echo -e "${RED}✗ $current_check failed${NC}"
          checks_failed=$((checks_failed + 1))
          ;;
        warning)
          echo -e "${YELLOW}⚠️  $current_check warning${NC}"
          checks_passed=$((checks_passed + 1))
          ;;
        *)
          echo -e "${BLUE}ℹ️  $current_check info${NC}"
          checks_passed=$((checks_passed + 1))
          ;;
      esac
    fi
  fi
  
  # Return results
  if [ $total_checks -gt 0 ]; then
    echo ""
    echo -e "${BLUE}Custom checks: $checks_passed/$total_checks passed${NC}"
  fi
  
  return $checks_failed
}

# Example built-in custom checks for AgroBridge
run_agrobridge_checks() {
  local errors=0
  
  # Check 1: Blockchain code must have security review
  if echo "$STAGED_FILES" | grep -qE "(blockchain|contracts)/.*\.sol$"; then
    echo -e "${BLUE}▶️  Blockchain code detected${NC}"
    
    # Check for security comments
    if ! git diff --cached | grep -qE "(Security|@audit|@security)"; then
      echo -e "${YELLOW}⚠️  Consider adding security comments to blockchain code${NC}"
    fi
  fi
  
  # Check 2: i18n files must have both Spanish and English
  if echo "$STAGED_FILES" | grep -qE "messages/.*\.json$"; then
    echo -e "${BLUE}▶️  i18n changes detected${NC}"
    
    for file in $(echo "$STAGED_FILES" | grep "messages/" | grep "es.json$"); do
      en_file="${file/es.json/en.json}"
      if [ ! -f "$en_file" ]; then
        echo -e "${RED}✗ Missing English translation for $file${NC}"
        errors=$((errors + 1))
      fi
    done
  fi
  
  return $errors
}

# Export functions
export -f run_custom_checks
export -f run_agrobridge_checks
