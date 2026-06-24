# GitHub Secrets Required for CI/CD

This document lists the GitHub Actions secrets needed to enable automated
deployment to SiteGround. The CI pipeline (`/.github/workflows/ci-cd.yml`)
will run lint/test/security without these secrets, but **deploy jobs will
fail at the "Validate deployment secrets" step** until all required secrets
are configured.

## Why this matters

As of 2026-06-24, the CI runs **4 of 5 jobs green** on push to `main`:
Lint, Release Gates, Security Audit, Test. The Deploy to Production job
fails because SiteGround SSH credentials are not yet in GitHub secrets.

## Required Secrets

Configure these via `gh secret set <NAME> --body "<value>"` or the GitHub UI
at https://github.com/AgroBridge-backup/agrobridge-global-web/settings/secrets/actions

| Secret | Required | Description |
|---|---|---|
| `SITEGROUND_SSH_HOST` | ✅ | SiteGround server hostname (e.g. `sgXXX.siteground.biz`) |
| `SITEGROUND_SSH_USER` | ✅ | SSH username on SiteGround |
| `SITEGROUND_SSH_KEY` | ✅ | Private SSH key (Ed25519 recommended). **Multi-line** — paste entire file contents including `-----BEGIN/END...-----` markers. |
| `SITEGROUND_REMOTE_PATH` | ✅ | Production doc root (e.g. `/home/USER/public_html`) |
| `SITEGROUND_STAGING_PATH` | ✅ | Staging doc root (e.g. `/home/USER/staging.agrobridge.global`) |

## Optional Secrets

| Secret | Default | Description |
|---|---|---|
| `SITEGROUND_SSH_PORT` | `18765` | SiteGround uses non-standard SSH port |
| `SLACK_WEBHOOK` | (none) | Slack incoming webhook URL for deploy notifications |
| `CODECOV_TOKEN` | (none) | Codecov upload token for coverage tracking |

## Setup Steps

### 1. Generate a dedicated SSH key on SiteGround
Do **not** reuse your personal SSH key. Create a deploy-only key:
```bash
ssh-keygen -t ed25519 -C "github-actions@agrobridge-global-web" -f ~/.ssh/siteground_agrobridge_deploy
```

### 2. Add the public key to SiteGround
- Login to SiteGround → Site Tools → SSH Keys
- Import `~/.ssh/siteground_agrobridge_deploy.pub`

### 3. Verify SSH access manually
```bash
ssh -i ~/.ssh/siteground_agrobridge_deploy -p 18765 USER@sgXXX.siteground.biz
```

### 4. Upload the private key to GitHub
```bash
gh secret set SITEGROUND_SSH_KEY < ~/.ssh/siteground_agrobridge_deploy
```

### 5. Set the rest of the secrets
```bash
gh secret set SITEGROUND_SSH_HOST --body "sgXXX.siteground.biz"
gh secret set SITEGROUND_SSH_USER --body "your-username"
gh secret set SITEGROUND_REMOTE_PATH --body "/home/your-username/public_html"
gh secret set SITEGROUND_STAGING_PATH --body "/home/your-username/staging.agrobridge.global"
# Optional:
gh secret set SITEGROUND_SSH_PORT --body "18765"
```

### 6. Verify
Push any commit to `main` (or re-run the latest workflow):
```bash
gh run rerun <latest-run-id> --failed
gh run watch <latest-run-id>
```
All 5 jobs should report `success`.

## Repository Visibility Note

This repo is **public** as of 2026-06-24 to unlock GitHub Actions free tier
(unlimited minutes for public repos). The free private tier (2000 min/month)
was exhausted, causing all jobs to fail silently at scheduling time.

If the repo must be private again:
- Upgrade to GitHub Pro ($4/mo, 3000 min) or Team ($4/user/mo, 50,000 min)
- Or move CI to GitLab CI / CircleCI / Drone
- Or self-host Woodpecker / Gitea Actions

The codebase was audited before going public (no secrets, no API keys, no
PII in tracked files). See commit `b4c486c` for the audit rationale.
