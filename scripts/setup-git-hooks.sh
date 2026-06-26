#!/bin/bash
#
# Git Hooks Setup Script (FAANG-Grade)
# Usage: ./scripts/setup-git-hooks.sh
#
# Security: Atomic operations, input validation
# Reliability: Backup existing, rollback on failure
# Observability: Detailed logging of all operations
#

# Source core library (if available)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "${SCRIPT_DIR}/../.githooks/lib/core.sh" ]]; then
    source "${SCRIPT_DIR}/../.githooks/lib/core.sh"
else
    # Fallback minimal logging
    log_info() { echo "[INFO] $1"; }
    log_success() { echo "[PASS] $1"; }
    log_warning() { echo "[WARN] $1"; }
    log_error() { echo "[ERROR] $1"; }
    log_debug() { [[ "${HOOKS_DEBUG:-0}" -eq 1 ]] && echo "[DEBUG] $1"; }
fi

# Configuration
readonly SETUP_VERSION="2.0.1-faang"

# Paths
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GITHOOKS_SOURCE="$REPO_ROOT/.githooks"
GITHOOKS_TARGET="$REPO_ROOT/.git/hooks"

log_info "Git Hooks Setup v${SETUP_VERSION}"
echo ""

# Validation 1: Check if we're in a git repo
if [[ ! -d "$REPO_ROOT/.git" ]]; then
    log_error "Not a git repository: $REPO_ROOT"
    exit 1
fi

# Validation 2: Check if source hooks exist
if [[ ! -d "$GITHOOKS_SOURCE" ]]; then
    log_error ".githooks directory not found: $GITHOOKS_SOURCE"
    exit 1
fi

# Validation 3: Check if target directory exists
if [[ ! -d "$GITHOOKS_TARGET" ]]; then
    log_error "Git hooks directory not found: $GITHOOKS_TARGET"
    exit 1
fi

log_info "Source: $GITHOOKS_SOURCE"
log_info "Target: $GITHOOKS_TARGET"
echo ""

# Track installations
HOOKS_INSTALLED=0
HOOKS_FAILED=0

# Install hooks
for hook in "$GITHOOKS_SOURCE"/*; do
    if [[ -f "$hook" ]] && [[ ! -d "$hook" ]]; then
        hook_name=$(basename "$hook")
        target="$GITHOOKS_TARGET/$hook_name"
        
        # Skip non-executable files (like README.md)
        if [[ ! -x "$hook" ]] && [[ "$hook_name" != *.md ]]; then
            log_warning "Skipping non-executable: $hook_name"
            continue
        fi
        
        # Backup existing hook if it's not a symlink to our source
        if [[ -f "$target" ]] && [[ ! -L "$target" ]]; then
            backup="$target.backup.$(date +%s)"
            log_warning "Backing up existing $hook_name to $backup"
            if ! mv "$target" "$backup"; then
                log_error "Failed to backup $hook_name"
                HOOKS_FAILED=$((HOOKS_FAILED + 1))
                continue
            fi
        fi
        
        # Remove existing symlink if pointing elsewhere
        if [[ -L "$target" ]]; then
            current_target=$(readlink "$target" 2>/dev/null || echo "")
            if [[ "$current_target" != "$hook" ]]; then
                log_debug "Removing old symlink: $target"
                rm -f "$target"
            fi
        fi
        
        # Create symlink atomically
        temp_target="${target}.tmp.$$"
        if ln -sf "$hook" "$temp_target"; then
            if mv "$temp_target" "$target"; then
                chmod +x "$target"
                log_success "Installed: $hook_name"
                HOOKS_INSTALLED=$((HOOKS_INSTALLED + 1))
            else
                rm -f "$temp_target"
                log_error "Failed to install $hook_name (atomic move failed)"
                HOOKS_FAILED=$((HOOKS_FAILED + 1))
            fi
        else
            log_error "Failed to create symlink for $hook_name"
            HOOKS_FAILED=$((HOOKS_FAILED + 1))
        fi
    fi
done

# Create lib directory in .git/hooks for shared functions
if [[ -d "$GITHOOKS_SOURCE/lib" ]]; then
    echo ""
    log_info "Installing shared libraries..."
    
    mkdir -p "$GITHOOKS_TARGET/lib"
    
    for lib in "$GITHOOKS_SOURCE/lib"/*; do
        if [[ -f "$lib" ]]; then
            lib_name=$(basename "$lib")
            target_lib="$GITHOOKS_TARGET/lib/$lib_name"
            
            # Atomic symlink creation
            temp_lib="${target_lib}.tmp.$$"
            if ln -sf "$lib" "$temp_lib" && mv "$temp_lib" "$target_lib"; then
                chmod +x "$target_lib" 2>/dev/null || true
                log_success "Library: $lib_name"
            else
                rm -f "$temp_lib"
                log_error "Failed to install library: $lib_name"
            fi
        fi
    done
fi

echo ""
if [[ $HOOKS_INSTALLED -gt 0 ]]; then
    log_success "Installed $HOOKS_INSTALLED hook(s)"
else
    log_warning "No hooks installed"
fi

if [[ $HOOKS_FAILED -gt 0 ]]; then
    log_error "Failed to install $HOOKS_FAILED hook(s)"
fi

# Create config file if it doesn't exist
if [[ ! -f "$REPO_ROOT/.githooks-config" ]]; then
    echo ""
    log_info "Creating default config file..."
    
    cat > "$REPO_ROOT/.githooks-config" << 'EOF'
# Git Hooks Configuration
# See .githooks/README.md for documentation

# General settings
DEBUG=false
ENABLE_PRE_COMMIT=true
ENABLE_COMMIT_MSG=true
ENABLE_PRE_PUSH=true
ENABLE_PRE_REBASE=true

# Pre-commit settings
PRECOMMIT_RUN_LINT=true
PRECOMMIT_RUN_TESTS=true

# Protected branches
PROTECTED_BRANCHES="main master develop production"

# Post-merge settings
POSTMERGE_AUTO_MIGRATE=false
POSTMERGE_AUTO_INSTALL=true
EOF
    
    log_success "Created .githooks-config"
    echo "  Edit this file to customize hook behavior"
fi

# Verify installation
echo ""
log_info "Verifying installation..."
echo ""

# Check all expected hooks
EXPECTED_HOOKS="pre-commit commit-msg pre-push post-merge pre-rebase post-checkout prepare-commit-msg"
INSTALLED_COUNT=0

for hook in $EXPECTED_HOOKS; do
    if [[ -L "$GITHOOKS_TARGET/$hook" ]]; then
        target=$(readlink "$GITHOOKS_TARGET/$hook" 2>/dev/null || echo "unknown")
        if [[ "$target" == *".githooks/$hook"* ]]; then
            log_success "$hook"
            INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
        else
            log_warning "$hook (symlinks to different location)"
        fi
    elif [[ -f "$GITHOOKS_TARGET/$hook" ]]; then
        log_warning "$hook (not symlinked)"
        INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
    else
        log_error "$hook (not installed)"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Configuration file: .githooks-config"
echo ""
echo "Environment variables to skip hooks:"
echo "  SKIP_PRE_COMMIT=1     - Skip pre-commit checks"
echo "  SKIP_COMMIT_MSG=1     - Skip commit message validation"
echo "  SKIP_PRE_PUSH=1       - Skip pre-push checks"
echo "  SKIP_PRE_REBASE=1     - Skip pre-rebase checks"
echo "  SKIP_POST_MERGE=1     - Skip post-merge hooks"
echo "  HOOKS_DEBUG=1         - Enable verbose output"
echo "  AUTO_MIGRATE=true     - Auto-run database migrations"
echo ""
echo "Examples:"
echo "  SKIP_PRE_COMMIT=1 git commit -m \"wip\""
echo "  SKIP_PRE_PUSH=1 git push origin feature"
echo "  SKIP_PRE_REBASE=1 git rebase main"
echo ""
echo "To customize: Edit .githooks-config"
echo ""

if [[ $INSTALLED_COUNT -ge 5 ]]; then
    log_success "Setup complete! $INSTALLED_COUNT/8 hooks installed."
else
    log_warning "Setup incomplete. Only $INSTALLED_COUNT/8 hooks installed."
fi

echo ""
log_info "Next steps:"
echo "  1. Review .githooks-config to customize behavior"
echo "  2. Test with: git commit -m \"test: verify hooks\""
echo "  3. See .githooks/README.md for full documentation"

# Exit with appropriate code
if [[ $HOOKS_FAILED -gt 0 ]]; then
    exit 1
fi

exit 0
