# Git Hooks - Quality Gates

This directory contains custom git hooks that enforce code quality standards before commits and pushes.

## Installed Hooks

### 1. pre-commit
**Runs:** Before every commit  
**Purpose:** Fast checks (< 30 seconds)

**Checks performed:**
- ✅ ESLint on staged JavaScript files
- ✅ Config validation
- ✅ Unit tests for changed test files
- ✅ Skill audit (if skills changed)
- ✅ Secrets scan (if TruffleHog installed)
- ✅ Commit message format preview

**Exit behavior:**
- All checks pass → Commit allowed
- Any check fails → Commit blocked

**Skip:** `SKIP_PRE_COMMIT=1 git commit -m "message"`

### 2. commit-msg
**Runs:** After commit message is entered  
**Purpose:** Validate conventional commit format

**Validates:**
- Format: `type(scope): subject`
- Types: feat, fix, docs, style, refactor, test, chore, security, db, build, ci, perf
- Subject: < 72 chars, lowercase start, no period

**Examples:**
```bash
✓ feat(blockchain): add Solana escrow integration
✓ fix(auth): resolve token refresh race condition
✓ docs(api): update GraphQL schema
✓ security: patch vulnerability in dependencies
```

**Skip:** `SKIP_COMMIT_MSG=1 git commit -m "message"`

### 3. pre-push
**Runs:** Before pushing to remote  
**Purpose:** Full quality pipeline (1-3 minutes)

**Checks performed:**
- ✅ Full linting
- ✅ Config validation
- ✅ Unit tests with coverage
- ✅ Integration tests (main/develop branches)
- ✅ Security tests
- ✅ Accessibility tests (main/develop)
- ✅ Server smoke test
- ✅ Skill audits (all skills)
- ✅ Large file detection (>10MB)
- ✅ Branch protection checks

**Skip:** `SKIP_PRE_PUSH=1 git push`

### 4. post-checkout
**Runs:** After `git checkout`  
**Purpose:** Environment synchronization

**Notifications:**
- package.json changes → suggest `npm install`
- .env.example changes → suggest reviewing .env
- Skill changes → suggest auditing

### 5. prepare-commit-msg
**Runs:** Before commit message editor opens  
**Purpose:** Auto-suggest commit prefix

**Suggests based on changed files:**
- .md files → `docs: `
- test files → `test: `
- blockchain files → `feat(blockchain): `
- security files → `security: `

### 6. pre-rebase ⛔ Branch Protection
**Runs:** Before `git rebase`  
**Purpose:** Prevent dangerous rebases

**Protects against:**
- ❌ Rebasing protected branches (main, master, develop)
- ❌ Rebasing with uncommitted changes (auto-stashes)
- ❌ Rebasing pushed branches (rewrites shared history)
- ⚠️ Large rebases (>50 commits)
- ⚠️ High conflict risk (>10 overlapping files)

**Interactive prompts:**
- Asks to stash uncommitted changes
- Warns about pushed branches
- Confirms large/complex rebases

**Skip:** `SKIP_PRE_REBASE=1 git rebase main`

**Recovery commands:**
```bash
git rebase --abort          # Cancel rebase
git reflog                  # Find previous HEAD
git reset --hard HEAD@{1}   # Restore pre-rebase state
```

### 7. post-merge 🔄 Auto-Migrations
**Runs:** After `git merge` or `git pull`  
**Purpose:** Sync environment automatically

**Auto-detects and handles:**
- 📦 `package.json` changes → runs `npm install`
- 🗄️ Prisma schema changes → warns about migrations
- 🔧 TypeScript config changes → runs type check
- 🎨 Frontend asset changes → runs `npm run build`
- 🔐 `.env.example` changes → warns about new env vars
- 🎯 Skill changes → audits modified skills
- 📝 Git hooks changes → updates hooks
- 🗑️ Cache config changes → clears build caches

**Configuration:**
```bash
AUTO_MIGRATE=true    # Auto-run DB migrations (use with caution!)
SKIP_POST_MERGE=1    # Skip all post-merge actions
```

**Manual actions when auto is disabled:**
```bash
npm install                           # After package.json changes
npm run prisma:migrate:prod          # After schema changes
npm run build                        # After asset changes
```

## Installation

### Automatic (Recommended)

The hooks are automatically installed when you run:

```bash
npm install
```

### Manual

```bash
./scripts/setup-git-hooks.sh
```

### Verify Installation

```bash
ls -la .git/hooks/
```

You should see symlinks pointing to `.githooks/`

## Configuration

### Skip Hooks

Use environment variables to bypass hooks (not recommended):

```bash
# Skip specific hooks
SKIP_PRE_COMMIT=1 git commit -m "quick fix"
SKIP_COMMIT_MSG=1 git commit -m "WIP"
SKIP_PRE_PUSH=1 git push origin feature
SKIP_PRE_REBASE=1 git rebase main
SKIP_POST_MERGE=1 git pull origin main

# Skip all hooks
SKIP_PRE_COMMIT=1 SKIP_COMMIT_MSG=1 SKIP_PRE_PUSH=1 git commit -m "emergency" && git push
```

### Hook-Specific Variables

```bash
# Pre-rebase
PROTECTED_BRANCHES="main master develop"  # Customize protected branches
REBASE_AUTO_STASH=true                     # Auto-stash uncommitted changes

# Post-merge
AUTO_MIGRATE=true                          # Enable auto database migrations (dangerous!)
POSTMERGE_AUTO_INSTALL=true                # Auto-run npm install
POSTMERGE_AUTO_BUILD=true                  # Auto-build frontend assets

# Custom behavior
HOOKS_DEBUG=1                              # Verbose output for all hooks
```

### Debug Mode

Enable verbose output:

```bash
HOOKS_DEBUG=1 git commit -m "test"
```

### Permanent Configuration

Add to your shell config (`.zshrc` or `.bashrc`):

```bash
# Always skip hooks (not recommended for production)
export SKIP_PRE_COMMIT=0
export SKIP_COMMIT_MSG=0
export SKIP_PRE_PUSH=0

# Enable debug
export HOOKS_DEBUG=0
```

## Troubleshooting

### Hook not running

1. Check if hook is executable:
   ```bash
   ls -la .git/hooks/pre-commit
   ```

2. Reinstall hooks:
   ```bash
   ./scripts/setup-git-hooks.sh
   ```

### Hook failing unexpectedly

1. Run with debug mode:
   ```bash
   HOOKS_DEBUG=1 git commit -m "test"
   ```

2. Check individual commands:
   ```bash
   npm run lint
   npm run test:unit
   ```

### Want to bypass temporarily

```bash
# For one commit
SKIP_PRE_COMMIT=1 git commit -m "wip"

# For entire session
export SKIP_PRE_COMMIT=1
# ... do work ...
unset SKIP_PRE_COMMIT
```

## CI/CD Integration

These hooks complement your CI/CD pipeline:

- **Local (hooks):** Fast feedback, catches issues early
- **CI/CD (GitHub Actions):** Full validation, deployment gates

The hooks ensure you never push broken code, while CI/CD ensures the final product meets all standards.

## Updating Hooks

When hooks are modified in the repo:

```bash
./scripts/setup-git-hooks.sh
```

Or simply pull the latest changes and run `npm install`.

## Customization

### Add a new check

Edit `.githooks/pre-commit`:

```bash
# Add your check
run_check "My Custom Check" "my-command" "$MY_FILES" || true
```

### Modify existing checks

All hooks are shell scripts. Edit the files in `.githooks/` and reinstall.

### Project-specific rules

Add a `.githooks-config` file to customize behavior per project.

## Configuration File (.githooks-config)

Create `.githooks-config` in your project root to customize hook behavior:

```bash
# Example: .githooks-config

# General settings
DEBUG=false
ENABLE_PRE_COMMIT=true
ENABLE_PRE_PUSH=true

# Pre-commit settings
PRECOMMIT_RUN_LINT=true
PRECOMMIT_RUN_TESTS=true
PRECOMMIT_TEST_PATTERNS="*.test.js *.spec.js"

# Commit message settings
COMMIT_TYPES="feat fix docs style refactor test chore security db"
COMMIT_MAX_LENGTH=72

# Pre-push settings
PREPUSH_RUN_UNIT_TESTS=true
PREPUSH_RUN_INTEGRATION_TESTS=true
PREPUSH_MAX_FILE_SIZE=10

# Pre-rebase settings
PROTECTED_BRANCHES="main master develop production"
REBASE_WARN_COMMIT_COUNT=50
REBASE_AUTO_STASH=true

# Post-merge settings
POSTMERGE_AUTO_MIGRATE=false
POSTMERGE_AUTO_INSTALL=true
POSTMERGE_AUTO_BUILD=true

# Custom checks
[check-todos]
enabled=true
pattern="TODO|FIXME|XXX"
message="Found TODO/FIXME comments. Consider resolving before commit."
severity=warning

[check-coverage]
enabled=true
command="npm run test:coverage"
min_coverage=80
severity=error
```

### Custom Checks

Add project-specific validations in `.githooks-config`:

**Pattern matching check:**
```ini
[check-todos]
enabled=true
pattern="TODO|FIXME|XXX"
message="Found TODO comments in staged files"
severity=warning  # warning, error, or info
```

**Command-based check:**
```ini
[check-coverage]
enabled=true
command="npm run test:coverage"
severity=error
```

**Branch naming convention:**
```ini
[check-branch-name]
enabled=true
pattern="^(feature|fix|hotfix|release)/.+"
message="Branch name should follow: feature/*, fix/*, hotfix/*, release/*"
severity=error
```

### AgroBridge-Specific Checks

Built-in checks for AgroBridge projects:

**Blockchain security:**
- Warns if Solidity files lack security comments
- Flags missing `@audit` annotations

**i18n validation:**
- Ensures Spanish translations have English counterparts
- Validates message file completeness

**Domain terminology:**
- Checks for proper agricultural/blockchain terminology
- Flags inconsistent naming

Enable in `.githooks-config`:
```ini
[agrobridge]
blockchain_security_check=true
i18n_validation=true
```

## Best Practices

1. **Don't skip hooks routinely** — Only use bypass for emergencies
2. **Fix issues immediately** — Don't accumulate technical debt
3. **Keep hooks fast** — Pre-commit should complete in < 30s
4. **Use WIP branches** — For experimental work that might fail checks
5. **Review hook output** — Don't ignore warnings

## Support

If hooks are blocking valid commits:

1. Check the error message — it tells you what's wrong
2. Run the failing command manually to debug
3. Use bypass environment variables temporarily
4. Ask for help if the error is unclear

## Related

- [Conventional Commits](https://www.conventionalcommits.org/)
- [ESLint Configuration](../.eslintrc.json)
- [Testing Guide](../docs/testing.md)
- [Skill Audit](../.codex/skills/ultimate-skill-creator/)
