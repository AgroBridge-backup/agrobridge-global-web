#!/usr/bin/env bash
# =============================================================================
# deploy-siteground.sh -- Deploy AgroBridge Global frontend to SiteGround
#
# Builds minified assets, rsyncs public_html/ to SiteGround via SSH,
# and verifies the deployment with an HTTP smoke test.
#
# Usage:
#   ./scripts/deploy-siteground.sh              # uses defaults / env vars
#   SSH_HOST=sg123.siteground.biz ./scripts/deploy-siteground.sh
#   ./scripts/deploy-siteground.sh --dry-run    # rsync dry-run (no changes)
#
# Environment variables (override defaults below):
#   SSH_HOST        SiteGround server hostname
#   SSH_USER        SSH username
#   SSH_PORT        SSH port (SiteGround uses 18765)
#   SSH_KEY         Path to private SSH key
#   REMOTE_PATH     Remote document root on SiteGround
#   SITE_URL        Production URL for smoke test
#   DRY_RUN         Set to "1" for rsync dry-run
#
# @author Alejandro Navarro Ayala - CEO & Founder, AgroBridge
# @version 4.0.0
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration -- override with environment variables
# ---------------------------------------------------------------------------
SSH_HOST="${SSH_HOST:-sg123.siteground.biz}"
SSH_USER="${SSH_USER:-your-siteground-username}"
SSH_PORT="${SSH_PORT:-18765}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
REMOTE_PATH="${REMOTE_PATH:-/home/$SSH_USER/public_html}"
SITE_URL="${SITE_URL:-https://agrobridge.global}"
DRY_RUN="${DRY_RUN:-0}"

# ---------------------------------------------------------------------------
# Colors
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
info()    { printf "${BLUE}[INFO]${NC}  %s\n" "$*"; }
success() { printf "${GREEN}[OK]${NC}    %s\n" "$*"; }
warn()    { printf "${YELLOW}[WARN]${NC}  %s\n" "$*"; }
fail()    { printf "${RED}[FAIL]${NC}  %s\n" "$*"; exit 1; }
step()    { printf "\n${CYAN}==> %s${NC}\n" "$*"; }

# ---------------------------------------------------------------------------
# Parse flags
# ---------------------------------------------------------------------------
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --help|-h)
      printf "Usage: %s [--dry-run] [--help]\n" "$0"
      printf "\nDeploys public_html/ to SiteGround via SSH/rsync.\n"
      printf "Set SSH_HOST, SSH_USER, SSH_PORT, SSH_KEY, REMOTE_PATH via env vars.\n"
      exit 0
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Resolve project root (one level up from scripts/)
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="$PROJECT_ROOT/public_html"

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------
step "Pre-flight checks"

if [ ! -d "$SOURCE_DIR" ]; then
  fail "Source directory not found: $SOURCE_DIR"
fi

if [ ! -f "$SSH_KEY" ]; then
  fail "SSH key not found: $SSH_KEY (set SSH_KEY env var)"
fi

if ! command -v rsync &>/dev/null; then
  fail "rsync is not installed"
fi

if ! command -v ssh &>/dev/null; then
  fail "ssh is not installed"
fi

if ! command -v curl &>/dev/null; then
  warn "curl not found -- will skip smoke test"
fi

success "All pre-flight checks passed"

info "Host:        $SSH_HOST"
info "User:        $SSH_USER"
info "Port:        $SSH_PORT"
info "Key:         $SSH_KEY"
info "Remote path: $REMOTE_PATH"
info "Site URL:    $SITE_URL"
if [ "$DRY_RUN" = "1" ]; then
  warn "DRY RUN mode -- no files will be transferred"
fi

# ---------------------------------------------------------------------------
# Step 1: Build minified assets
# ---------------------------------------------------------------------------
step "Building production assets"

cd "$PROJECT_ROOT"
if npm run build; then
  success "Build completed"
else
  fail "Build failed -- aborting deployment"
fi

# ---------------------------------------------------------------------------
# Step 2: Verify .htaccess exists
# ---------------------------------------------------------------------------
step "Verifying .htaccess"

if [ -f "$SOURCE_DIR/.htaccess" ]; then
  success ".htaccess found in public_html/"
else
  warn ".htaccess not found in public_html/ -- SiteGround will use server defaults"
fi

# ---------------------------------------------------------------------------
# Step 3: rsync to SiteGround
# ---------------------------------------------------------------------------
step "Deploying to SiteGround via rsync"

RSYNC_OPTS=(
  -azv
  --delete
  --chmod=D755,F644
  -e "ssh -p $SSH_PORT -i $SSH_KEY -o StrictHostKeyChecking=accept-new"
  --exclude='node_modules'
  --exclude='.git'
  --exclude='.gitignore'
  --exclude='.DS_Store'
  --exclude='tests'
  --exclude='*.test.js'
  --exclude='package.json'
  --exclude='package-lock.json'
  --exclude='.env*'
  --exclude='*.log'
  --exclude='*.map'
)

if [ "$DRY_RUN" = "1" ]; then
  RSYNC_OPTS+=(--dry-run)
fi

info "Running rsync..."
if rsync "${RSYNC_OPTS[@]}" "$SOURCE_DIR/" "$SSH_USER@$SSH_HOST:$REMOTE_PATH/"; then
  success "rsync completed"
else
  fail "rsync failed"
fi

# ---------------------------------------------------------------------------
# Step 4: Post-deploy smoke test
# ---------------------------------------------------------------------------
if [ "$DRY_RUN" = "1" ]; then
  warn "Skipping smoke test (dry-run mode)"
else
  step "Post-deployment verification"

  if command -v curl &>/dev/null; then
    info "Waiting 5 seconds for caches to clear..."
    sleep 5

    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$SITE_URL")

    if [ "$HTTP_STATUS" = "200" ]; then
      success "Smoke test passed: $SITE_URL returned HTTP $HTTP_STATUS"
    elif [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
      warn "Smoke test returned HTTP $HTTP_STATUS (redirect) -- verify HTTPS redirect is working"
    else
      fail "Smoke test failed: $SITE_URL returned HTTP $HTTP_STATUS (expected 200)"
    fi

    # Check a legal page too
    LEGAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$SITE_URL/legal/privacidad.html")
    if [ "$LEGAL_STATUS" = "200" ]; then
      success "Legal page check passed: /legal/privacidad.html returned HTTP $LEGAL_STATUS"
    else
      warn "Legal page returned HTTP $LEGAL_STATUS (expected 200)"
    fi
  else
    warn "curl not available -- skipping smoke test"
  fi
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
printf "\n${GREEN}============================================${NC}\n"
printf "${GREEN}  Deployment complete!${NC}\n"
printf "${GREEN}============================================${NC}\n"
printf "  Site:   %s\n" "$SITE_URL"
printf "  Host:   %s\n" "$SSH_HOST"
printf "  Path:   %s\n" "$REMOTE_PATH"
if [ "$DRY_RUN" = "1" ]; then
  printf "  Mode:   ${YELLOW}DRY RUN (no changes made)${NC}\n"
fi
printf "\n"
