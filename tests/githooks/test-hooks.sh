#!/bin/bash
#
# Git Hooks Test Suite
# Location: tests/githooks/test-hooks.sh
#
# Tests all critical functionality of git hooks
#

set -euo pipefail

# Test configuration
readonly TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "$TEST_DIR/../.." && pwd)"
readonly HOOKS_DIR="$REPO_ROOT/.githooks"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
declare -i TESTS_PASSED=0
declare -i TESTS_FAILED=0
declare -i TOTAL_TESTS=0

# Test runner
run_test() {
    local name="$1"
    local cmd="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}TEST:${NC} $name"
    
    if eval "$cmd" > /tmp/test_output_$$.log 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        cat /tmp/test_output_$$.log
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Setup
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Git Hooks Test Suite${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 1: Core library exists
run_test "Core library exists" "[[ -f $HOOKS_DIR/lib/core.sh ]]"

# Test 2: Core library is valid bash
run_test "Core library syntax is valid" "bash -n $HOOKS_DIR/lib/core.sh"

# Test 3: All hooks exist
run_test "pre-commit hook exists" "[[ -f $HOOKS_DIR/pre-commit ]]"
run_test "commit-msg hook exists" "[[ -f $HOOKS_DIR/commit-msg ]]"
run_test "pre-push hook exists" "[[ -f $HOOKS_DIR/pre-push ]]"
run_test "pre-rebase hook exists" "[[ -f $HOOKS_DIR/pre-rebase ]]"
run_test "post-merge hook exists" "[[ -f $HOOKS_DIR/post-merge ]]"

# Test 4: All hooks are valid bash
run_test "pre-commit syntax valid" "bash -n $HOOKS_DIR/pre-commit"
run_test "commit-msg syntax valid" "bash -n $HOOKS_DIR/commit-msg"
run_test "pre-push syntax valid" "bash -n $HOOKS_DIR/pre-push"
run_test "pre-rebase syntax valid" "bash -n $HOOKS_DIR/pre-rebase"
run_test "post-merge syntax valid" "bash -n $HOOKS_DIR/post-merge"

# Test 5: No eval usage
run_test "pre-commit has no eval" "! grep -q 'eval ' $HOOKS_DIR/pre-commit"
run_test "pre-push has no eval" "! grep -q 'eval ' $HOOKS_DIR/pre-push"
run_test "post-merge has no eval" "! grep -q 'eval ' $HOOKS_DIR/post-merge"
run_test "commit-msg has no eval" "! grep -q 'eval ' $HOOKS_DIR/commit-msg"

# Test 6: Strict mode enabled (in core library)
run_test "Core library has strict mode" "grep -q 'set -euo pipefail' $HOOKS_DIR/lib/core.sh"
run_test "Pre-commit sources core library" "grep -q 'source.*core.sh' $HOOKS_DIR/pre-commit"

# Test 7: Trap/cleanup exists
run_test "pre-rebase has trap" "grep -q 'trap' $HOOKS_DIR/pre-rebase"

# Test 8: Skip flags documented
run_test "pre-commit documents SKIP_PRE_COMMIT" "grep -q 'SKIP_PRE_COMMIT' $HOOKS_DIR/pre-commit"
run_test "pre-push documents SKIP_PRE_PUSH" "grep -q 'SKIP_PRE_PUSH' $HOOKS_DIR/pre-push"

# Test 9: Input validation
run_test "commit-msg validates input" "grep -q 'if \[\[ \$# -lt 1 \]\]' $HOOKS_DIR/commit-msg"

# Test 10: Atomic operations
run_test "Setup script uses atomic symlinks" "grep -q 'temp_target' $REPO_ROOT/scripts/setup-git-hooks.sh"

# Test 11: Version tracking
run_test "Core library has version" "grep -q 'GITHOOKS_VERSION' $HOOKS_DIR/lib/core.sh"

# Test 12: Config loader exists and is valid
run_test "Config loader exists" "[[ -f $HOOKS_DIR/lib/config-loader.sh ]]"
run_test "Config loader syntax valid" "bash -n $HOOKS_DIR/lib/config-loader.sh"

# Test 13: Custom checks library
run_test "Custom checks library exists" "[[ -f $HOOKS_DIR/lib/custom-checks.sh ]]"

# Test 14: README exists
run_test "README exists" "[[ -f $HOOKS_DIR/README.md ]]"

# Test 15: Setup script exists and is executable
run_test "Setup script exists" "[[ -f $REPO_ROOT/scripts/setup-git-hooks.sh ]]"
run_test "Setup script is executable" "[[ -x $REPO_ROOT/scripts/setup-git-hooks.sh ]]"

# Test 16: Config file template exists
run_test "Config template exists" "[[ -f $REPO_ROOT/.githooks-config ]]"

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Total tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
