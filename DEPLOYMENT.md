# AgroBridge Global -- Deployment Guide

Complete guide for deploying the AgroBridge Global platform:
- **Frontend** (`public_html/`) on SiteGround shared hosting (Apache/LiteSpeed)
- **Backend** (Node.js/Express API) on Render.com (free tier) with Docker

Domain: `agrobridge.global` (frontend) | `api.agrobridge.global` (backend)

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Frontend Deployment (SiteGround)](#2-frontend-deployment-siteground)
3. [Backend Deployment (Render.com)](#3-backend-deployment-rendercom)
4. [DNS Configuration](#4-dns-configuration)
5. [SSL/TLS Certificates](#5-ssltls-certificates)
6. [Environment Variables Reference](#6-environment-variables-reference)
7. [Automated Deployment (CI/CD)](#7-automated-deployment-cicd)
8. [Manual Deployment Script](#8-manual-deployment-script)
9. [Post-Deployment Checklist](#9-post-deployment-checklist)
10. [Monitoring and Maintenance](#10-monitoring-and-maintenance)
11. [Rollback Procedures](#11-rollback-procedures)
12. [Cost Summary](#12-cost-summary)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Prerequisites

### Accounts Required

| Service | Purpose | Tier | URL |
|---------|---------|------|-----|
| SiteGround | Frontend hosting (Apache/LiteSpeed) | StartUp or higher | https://siteground.com |
| Render.com | Backend API hosting (Docker) | Free | https://render.com |
| MongoDB Atlas | Database | Free M0 | https://cloud.mongodb.com |
| Upstash | Redis (rate limiting) | Free | https://console.upstash.com |
| Domain registrar | DNS management | -- | (wherever agrobridge.global is registered) |
| Google reCAPTCHA | Bot protection (v3) | Free | https://www.google.com/recaptcha/admin |
| Resend | Transactional email | Free (100/day) | https://resend.com |
| Sentry | Error tracking (optional) | Free | https://sentry.io |
| GitHub | Source control + CI/CD | Free | https://github.com |

### Local Tools Required

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- rsync (for deployment script; pre-installed on macOS and Linux)
- ssh (for SiteGround access)
- curl (for smoke tests)

---

## 2. Frontend Deployment (SiteGround)

The frontend is a static site served from `public_html/`. No server-side runtime is needed on SiteGround -- Apache/LiteSpeed serves the HTML, CSS, JS, and assets directly.

### 2.1 SiteGround Account Setup

1. Purchase a SiteGround hosting plan (StartUp plan is sufficient).
2. During setup, register or transfer the domain `agrobridge.global`.
3. Wait for domain propagation (can take up to 48 hours for new domains).

### 2.2 SSH Access Configuration

SiteGround uses a non-standard SSH port (`18765`). You must enable SSH access in the control panel.

1. Log in to SiteGround **Site Tools** (https://tools.siteground.com).
2. Navigate to **Devs > SSH Keys Manager**.
3. Generate a new SSH key pair, or import your existing public key:
   ```bash
   # Generate a new Ed25519 key pair (recommended)
   ssh-keygen -t ed25519 -C "deploy@agrobridge.global" -f ~/.ssh/siteground_deploy

   # Copy the public key to clipboard
   cat ~/.ssh/siteground_deploy.pub | pbcopy   # macOS
   ```
4. Paste the public key in the SiteGround SSH Keys Manager.
5. Note your SSH credentials from the Site Tools dashboard:
   - **Host**: your SiteGround server (e.g., `sg123.siteground.biz`)
   - **Port**: `18765`
   - **Username**: displayed in Site Tools (e.g., `u123-abc456`)
6. Test the connection:
   ```bash
   ssh -p 18765 -i ~/.ssh/siteground_deploy u123-abc456@sg123.siteground.biz
   ```

### 2.3 File Upload Methods

#### Option A: SSH/rsync (recommended)

Use the provided deployment script (see [Section 8](#8-manual-deployment-script)):

```bash
SSH_HOST=sg123.siteground.biz \
SSH_USER=u123-abc456 \
SSH_PORT=18765 \
SSH_KEY=~/.ssh/siteground_deploy \
REMOTE_PATH=/home/u123-abc456/public_html \
./scripts/deploy-siteground.sh
```

Or manually with rsync:

```bash
# Build first
npm run build

# Deploy
rsync -azv --delete \
  -e "ssh -p 18765 -i ~/.ssh/siteground_deploy" \
  --exclude='node_modules' --exclude='.git' --exclude='tests' \
  ./public_html/ \
  u123-abc456@sg123.siteground.biz:/home/u123-abc456/public_html/
```

#### Option B: SiteGround File Manager

1. Log in to SiteGround Site Tools.
2. Navigate to **Site > File Manager**.
3. Open the `public_html/` directory.
4. Upload all files from your local `public_html/` directory.
5. Verify `.htaccess` was uploaded (it may be hidden by default -- enable "Show hidden files").

#### Option C: SFTP Client

Use any SFTP client (FileZilla, Cyberduck, Transmit):
- **Protocol**: SFTP
- **Host**: your SiteGround server
- **Port**: `18765`
- **Username**: your SiteGround SSH username
- **Authentication**: SSH key

### 2.4 .htaccess Verification

The `.htaccess` file in `public_html/` provides:
- HTTPS redirect (force all traffic to HTTPS)
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Cache control (HTML: no-cache; assets: 1 day; dist/: 1 year immutable)
- Gzip/Deflate compression
- Directory listing disabled
- Sensitive file blocking (.env, .git, package.json)
- Custom error pages
- MIME type configuration

After deploying, verify it is active:

```bash
# Should return 301 redirect from HTTP to HTTPS
curl -I http://agrobridge.global

# Should include security headers
curl -I https://agrobridge.global | grep -E "(Strict-Transport|Content-Security|X-Frame)"
```

If SiteGround does not honor .htaccess rules, check:
1. Site Tools > **Apache Configuration** -- ensure `.htaccess` is enabled.
2. File permissions: `.htaccess` should be `644`.

### 2.5 SiteGround SSL/TLS

SiteGround provides free Let's Encrypt SSL certificates, auto-renewed.

1. Go to Site Tools > **Security > SSL Manager**.
2. Select the domain `agrobridge.global`.
3. Choose **Let's Encrypt** and install.
4. Enable **HTTPS Enforce** in Site Tools (belt-and-suspenders with `.htaccess`).
5. Verify: `https://agrobridge.global` should show a valid certificate.

### 2.6 SiteGround Performance (Optional)

SiteGround Site Tools offers built-in caching:

1. **Speed > Caching > Memcached**: Enable for dynamic content caching.
2. **Speed > Caching > NGINX Direct Delivery**: Enable for static file caching.
3. **Speed > CDN**: Enable Cloudflare CDN integration (free on SiteGround).

These are complementary to the `.htaccess` cache rules and provide an additional layer.

---

## 3. Backend Deployment (Render.com)

The backend API lives in a separate repository (`agrobridge-global-backend`) and deploys to Render.com using Docker.

### 3.1 Connect GitHub Repository

1. Sign up at https://render.com (free tier).
2. Click **New > Blueprint**.
3. Connect your GitHub account and select the `agrobridge-global-backend` repository.
4. Render will detect the `render.yaml` file and configure the service automatically.

### 3.2 render.yaml Blueprint

The backend repository contains a `render.yaml` that defines:

- **Service**: `agrobridge-global-api`
- **Runtime**: Docker (uses the repo's Dockerfile)
- **Region**: Oregon (us-west-2, close to MongoDB Atlas and Upstash)
- **Plan**: Free
- **Health check**: `GET /health`
- **Auto-deploy**: On push to `main`

### 3.3 Environment Variables

After Render creates the service from the Blueprint, set the following secrets in the Render dashboard (**Service > Environment**):

| Variable | Where to Get It | Notes |
|----------|----------------|-------|
| `MONGODB_URI` | MongoDB Atlas connection string | See Section 3.4 |
| `REDIS_URL` | Upstash Redis URL | See Section 3.5; optional |
| `JWT_ACCESS_SECRET` | `openssl rand -base64 64` | Auto-generated by Render Blueprint |
| `JWT_REFRESH_SECRET` | `openssl rand -base64 64` | Auto-generated; must differ from access |
| `CSRF_SECRET` | `openssl rand -base64 32` | Auto-generated by Render Blueprint |
| `RESEND_API_KEY` | Resend dashboard | For contact form email notifications |
| `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA admin | v3 secret key |
| `ADMIN_PASSWORD` | Choose a strong password (12+ chars) | Initial admin account seed |

The Blueprint pre-populates these with sensible defaults:

| Variable | Default | Notes |
|----------|---------|-------|
| `NODE_ENV` | `production` | Do not change |
| `PORT` | `3000` | Render maps this to port 443 externally |
| `CORS_ORIGIN` | `https://agrobridge.global` | Must match frontend URL exactly |
| `OWNER_EMAIL` | `ceo@agrobridge.global` | Contact form recipient |
| `OWNER_PHONE` | `+523511689122` | WhatsApp notifications |
| `RECAPTCHA_MIN_SCORE` | `0.5` | Threshold for bot detection |
| `RATE_LIMIT_MAX` | `100` | Requests per 15-minute window |
| `EMAIL_FROM` | `AgroBridge Global <noreply@agrobridge.global>` | Sender address |

### 3.4 MongoDB Atlas Setup

1. Create a free account at https://cloud.mongodb.com.
2. Create a **Free M0 cluster** in **AWS us-west-2 (Oregon)** (same region as Render).
3. Create a database user with **readWrite** permissions.
4. Under **Network Access**, add `0.0.0.0/0` to the IP whitelist. This is required because Render free tier uses dynamic IPs.
5. Copy the connection string and paste it as the `MONGODB_URI` environment variable in Render:
   ```
   mongodb+srv://agrobridge-user:<password>@cluster0.abc123.mongodb.net/agrobridge-global?retryWrites=true&w=majority
   ```

### 3.5 Upstash Redis Setup (Optional)

Redis is used for distributed rate limiting. If omitted, the backend falls back to in-memory rate limiting (sufficient for low traffic).

1. Create a free account at https://console.upstash.com.
2. Create a Redis database in **us-west-2 (Oregon)**.
3. Copy the Redis URL (TLS enabled):
   ```
   rediss://default:<password>@us1-xxxxx-xxxxx.upstash.io:6379
   ```
4. Paste it as the `REDIS_URL` environment variable in Render.

### 3.6 Render Free Tier Limitations

| Limitation | Impact | Mitigation |
|-----------|--------|------------|
| Service sleeps after 15 min of inactivity | First request after sleep takes 30-60 seconds (cold start) | Use an uptime monitor (UptimeRobot free tier) to ping `/health` every 14 minutes |
| 750 hours/month of runtime | Sufficient for one service running 24/7 | Only counts when the service is awake |
| No custom domains on free tier without payment info | `api.agrobridge.global` requires adding a payment method (no charge for free tier) | Add a credit card to Render to enable custom domains |
| Shared CPU, 512 MB RAM | Adequate for the current API traffic | Monitor memory usage; upgrade to Starter ($7/mo) if needed |
| Deploys can be slow (2-5 min) | Short downtime during deploy | Health check ensures traffic only routes after the new instance is ready |

### 3.7 Alternative: Railway Deployment

If Render does not meet your needs, Railway is a compatible alternative:

1. Sign up at https://railway.app (free $5/month credit).
2. Click **New Project > Deploy from GitHub Repo**.
3. Select `agrobridge-global-backend`.
4. Railway will auto-detect the Dockerfile.
5. Set environment variables in the Railway dashboard (same as Section 3.3).
6. Add a custom domain: `api.agrobridge.global`.
7. Railway provides automatic SSL and does not sleep on the free tier (within credit limits).

---

## 4. DNS Configuration

Configure these DNS records at your domain registrar (or SiteGround if it manages DNS):

| Type | Name | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| A | `agrobridge.global` | SiteGround server IP | 3600 | Frontend to SiteGround |
| CNAME | `www` | `agrobridge.global` | 3600 | www redirect |
| CNAME | `api` | `agrobridge-global-api.onrender.com` | 3600 | Backend API on Render |
| CNAME | `staging` | SiteGround staging IP or subdomain | 3600 | Staging frontend (optional) |

### How to Find the Values

- **SiteGround IP**: Site Tools > Dashboard > Site Information > Server IP Address.
- **Render hostname**: Render Dashboard > Service > Settings > Custom Domains. Render will show the target CNAME (e.g., `agrobridge-global-api.onrender.com`).

### TTL Recommendations

- During initial setup: Set TTL to `300` (5 minutes) for fast propagation.
- After verification: Increase TTL to `3600` (1 hour) or `86400` (24 hours) for caching.

### DNS Propagation

DNS changes can take up to 48 hours to propagate globally. Use these tools to verify:

```bash
# Check A record
dig agrobridge.global +short

# Check CNAME for API
dig api.agrobridge.global CNAME +short

# Or use a web tool
# https://dnschecker.org/#A/agrobridge.global
```

---

## 5. SSL/TLS Certificates

### Frontend (SiteGround)

SiteGround provides free Let's Encrypt certificates with automatic renewal. See [Section 2.5](#25-siteground-ssltls).

### Backend (Render)

Render provides free automatic SSL for custom domains. After adding `api.agrobridge.global` as a custom domain in the Render dashboard, SSL is provisioned automatically. No manual setup is required.

### Verification

```bash
# Check frontend SSL
openssl s_client -connect agrobridge.global:443 -servername agrobridge.global </dev/null 2>/dev/null | openssl x509 -noout -dates

# Check backend SSL
openssl s_client -connect api.agrobridge.global:443 -servername api.agrobridge.global </dev/null 2>/dev/null | openssl x509 -noout -dates
```

---

## 6. Environment Variables Reference

### Frontend (set in `public_html/config-production.js` or `index.html`)

| Variable | Production Value | Description |
|----------|-----------------|-------------|
| `window.AGROBRIDGE_API_BASE` | `https://api.agrobridge.global/v2` | Backend API base URL |
| `window.AGROBRIDGE_USE_DEMO` | `false` | Must be `false` in production |
| `window.AGROBRIDGE_RECAPTCHA_SITE_KEY` | *(from Google reCAPTCHA admin)* | reCAPTCHA v3 site key |
| `window.AGROBRIDGE_SENTRY_DSN` | *(from Sentry)* | Error tracking (optional) |
| `window.AGROBRIDGE_WHATSAPP_NUMBER` | `+523511689122` | WhatsApp contact number |

These are set in `public_html/config-production.js` which is loaded by `index.html`. The file is committed to the repository but secrets (reCAPTCHA key, Sentry DSN) should be set via the CI/CD pipeline or manually before deployment.

### Backend (set in Render dashboard)

See [Section 3.3](#33-environment-variables) for the full list.

For local development, copy `.env.example` to `.env` and fill in the values. The backend requires at minimum:
- `JWT_ACCESS_SECRET` (64+ chars)
- `JWT_REFRESH_SECRET` (64+ chars, different from access)
- `CSRF_SECRET` (32+ chars)

---

## 7. Automated Deployment (CI/CD)

The CI/CD pipeline is defined in `.github/workflows/ci-cd.yml`.

### Pipeline Overview

```
Push to develop -> Lint -> Release Gates -> Security Audit -> Test -> Deploy to Staging (SiteGround)
Push to main    -> Lint -> Release Gates -> Security Audit -> Test -> Deploy to Production (SiteGround) -> E2E Tests
```

The backend deploys automatically from Render when code is pushed to `main` (configured in `render.yaml` with `autoDeploy: true`). No CI/CD pipeline is needed for the backend.

### Required GitHub Secrets

| Secret | Description | Example |
|--------|-------------|---------|
| `SITEGROUND_SSH_HOST` | SiteGround server hostname | `sg123.siteground.biz` |
| `SITEGROUND_SSH_USER` | SiteGround SSH username | `u123-abc456` |
| `SITEGROUND_SSH_KEY` | Full private SSH key (Ed25519 or RSA) | *(paste entire key including BEGIN/END lines)* |
| `SITEGROUND_REMOTE_PATH` | Production document root | `/home/u123-abc456/public_html` |
| `SITEGROUND_STAGING_PATH` | Staging document root | `/home/u123-abc456/staging.agrobridge.global` |
| `SITEGROUND_SSH_PORT` | SSH port (optional, defaults to 18765) | `18765` |
| `SLACK_WEBHOOK` | Slack webhook for notifications (optional) | `https://hooks.slack.com/services/...` |
| `CODECOV_TOKEN` | Codecov upload token (optional) | *(from codecov.io)* |

### Setting Up GitHub Secrets

1. Go to your GitHub repository > **Settings > Secrets and variables > Actions**.
2. Click **New repository secret** for each secret listed above.
3. For `SITEGROUND_SSH_KEY`, paste the entire private key file content including the `-----BEGIN` and `-----END` lines.

### Staging Deployment

Staging deploys automatically when code is pushed to the `develop` branch.

The staging site is served from a separate directory on SiteGround. To set it up:

1. In SiteGround Site Tools, create a subdomain: `staging.agrobridge.global`.
2. Note the document root path (e.g., `/home/u123-abc456/staging.agrobridge.global`).
3. Set this path as the `SITEGROUND_STAGING_PATH` GitHub secret.

---

## 8. Manual Deployment Script

The `scripts/deploy-siteground.sh` script provides a one-command deployment from your local machine.

### Quick Start

```bash
# Set your SiteGround credentials
export SSH_HOST=sg123.siteground.biz
export SSH_USER=u123-abc456
export SSH_PORT=18765
export SSH_KEY=~/.ssh/siteground_deploy
export REMOTE_PATH=/home/u123-abc456/public_html

# Deploy
./scripts/deploy-siteground.sh
```

### What the Script Does

1. Runs pre-flight checks (source directory, SSH key, required tools).
2. Executes `npm run build` to minify JS and CSS into `public_html/dist/`.
3. Verifies `.htaccess` exists in `public_html/`.
4. Rsyncs `public_html/` to SiteGround, excluding `node_modules`, `.git`, `tests`, `.env`, and other non-deployment files.
5. Runs a smoke test: curls the production URL and verifies HTTP 200.
6. Checks a legal page (`/legal/privacidad.html`) as an additional verification.

### Dry Run

Preview what would be transferred without making changes:

```bash
./scripts/deploy-siteground.sh --dry-run
```

---

## 9. Post-Deployment Checklist

Run through this checklist after every production deployment.

### Critical (must pass)

- [ ] **Frontend loads**: `curl -s -o /dev/null -w "%{http_code}" https://agrobridge.global` returns `200`
- [ ] **SSL working**: `https://agrobridge.global` shows a valid certificate (green padlock)
- [ ] **API health**: `curl https://api.agrobridge.global/health` returns `200` with uptime and version
- [ ] **CORS working**: Open browser console on `agrobridge.global`, run `fetch('https://api.agrobridge.global/health')` -- no CORS errors
- [ ] **HTTPS redirect**: `curl -I http://agrobridge.global` returns `301` to `https://`
- [ ] **Security headers present**: `curl -I https://agrobridge.global` shows `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`

### Functional

- [ ] **Lot verification**: Enter a valid lot code (e.g., `AGR-2024-001`) and see traceability data
- [ ] **Contact form**: Submit the contact form and verify the email arrives at `ceo@agrobridge.global`
- [ ] **reCAPTCHA**: Contact form submission includes reCAPTCHA token (check network tab)
- [ ] **Legal pages**: Navigate to `/legal/privacidad.html`, `/legal/terminos.html`, `/legal/cookies.html`, `/legal/datos.html` -- all load correctly
- [ ] **i18n**: Switch language to English and verify translation; switch back to Spanish
- [ ] **WhatsApp link**: Click the WhatsApp button and verify it opens with the correct number

### Performance

- [ ] **Page load**: Main page loads in under 3 seconds on 4G connection
- [ ] **Lighthouse**: Run `npx lighthouse https://agrobridge.global --view` and target 90+ on all categories
- [ ] **Compression**: `curl -H "Accept-Encoding: gzip" -I https://agrobridge.global` shows `Content-Encoding: gzip`

---

## 10. Monitoring and Maintenance

### Uptime Monitoring

Set up a free uptime monitor to prevent Render free tier cold starts:

1. Sign up at https://uptimerobot.com (free, 50 monitors).
2. Add monitors:
   - **Frontend**: `https://agrobridge.global` (HTTP, 5 min interval)
   - **Backend**: `https://api.agrobridge.global/health` (HTTP, 14 min interval -- keeps Render awake)
3. Configure alert contacts (email, Slack, SMS).

### Error Tracking (Sentry)

If Sentry is configured:
1. Check the Sentry dashboard daily for new errors.
2. Set alert rules: alert on any new error, alert on error rate > 5/min.
3. Frontend and backend are separate Sentry projects.

### Regular Maintenance

| Frequency | Task |
|-----------|------|
| Daily | Check Sentry for new errors |
| Weekly | Review `npm audit` output for vulnerabilities |
| Monthly | Update dependencies (`npm update`), rotate secrets, review MongoDB Atlas metrics |
| Quarterly | Review SiteGround plan and resource usage, test rollback procedures |

### Dependency Updates

```bash
# Frontend
cd ~/Documents/agrobridge-global-web
npm audit
npm update
npm test

# Backend
cd ~/Documents/agrobridge-global-backend
npm audit
npm update
npm test
```

---

## 11. Rollback Procedures

### Frontend Rollback (SiteGround)

Since SiteGround serves static files and does not have a built-in rollback mechanism like Netlify, use Git to rollback:

```bash
# Option 1: Revert the last commit and redeploy
git revert HEAD
git push origin main
# CI/CD will auto-deploy the reverted version

# Option 2: Deploy a specific previous commit manually
git checkout <previous-commit-sha> -- public_html/
./scripts/deploy-siteground.sh
git checkout main -- public_html/   # restore working tree
```

If CI/CD is not available, deploy the previous version manually:

```bash
# Check out the last known good commit
git log --oneline -10
git stash
git checkout <good-commit-sha>
./scripts/deploy-siteground.sh
git checkout main
git stash pop
```

### Backend Rollback (Render)

1. Go to the Render dashboard > **Events** tab.
2. Find the last successful deploy.
3. Click the three-dot menu and select **Rollback to this deploy**.
4. Verify the health endpoint: `curl https://api.agrobridge.global/health`

### Emergency: Take Site Offline

If a critical security issue requires immediately taking the site offline:

```bash
# Create a maintenance page
echo '<html><body><h1>Mantenimiento en progreso</h1><p>Volveremos pronto.</p></body></html>' > /tmp/index.html

# Deploy only the maintenance page
rsync -azv -e "ssh -p 18765 -i ~/.ssh/siteground_deploy" \
  /tmp/index.html \
  u123-abc456@sg123.siteground.biz:/home/u123-abc456/public_html/index.html
```

---

## 12. Cost Summary

| Service | Plan | Monthly Cost | Annual Cost | Notes |
|---------|------|-------------|-------------|-------|
| SiteGround | StartUp | $3.99/mo (promo) | ~$48/yr | Renews at ~$18/mo after promo |
| Render.com | Free | $0 | $0 | 750 hrs/mo, sleeps after 15 min |
| MongoDB Atlas | Free M0 | $0 | $0 | 512 MB storage, shared cluster |
| Upstash Redis | Free | $0 | $0 | 10K commands/day |
| UptimeRobot | Free | $0 | $0 | 50 monitors, 5 min interval |
| Resend | Free | $0 | $0 | 100 emails/day |
| Sentry | Free | $0 | $0 | 5K errors/mo |
| Google reCAPTCHA | Free | $0 | $0 | 1M assessments/mo |
| **Total** | | **~$4/mo** | **~$48/yr** | Promo pricing |

**Upgrade path**: If traffic increases, consider:
- Render Starter ($7/mo): No cold starts, custom domains, 512 MB RAM.
- MongoDB Atlas M2 ($9/mo): Dedicated cluster, backups, 2 GB storage.
- SiteGround GrowBig ($7/99/mo promo): Unlimited sites, staging, more storage.

---

## 13. Troubleshooting

### CORS Errors

**Symptom**: Browser console shows `Access-Control-Allow-Origin` errors when the frontend calls the API.

**Fix**:
1. Verify `CORS_ORIGIN` on Render matches the frontend URL exactly: `https://agrobridge.global` (no trailing slash).
2. Check for www vs non-www mismatch. If users can access `www.agrobridge.global`, add it to CORS: `CORS_ORIGIN=https://agrobridge.global,https://www.agrobridge.global`.
3. Verify the backend is actually running: `curl https://api.agrobridge.global/health`.

### .htaccess Not Working

**Symptom**: No HTTPS redirect, no security headers, directory listing visible.

**Fix**:
1. Verify the file uploaded correctly: it must be named exactly `.htaccess` (with the dot prefix).
2. Check file permissions: `644` (`rw-r--r--`).
3. In SiteGround Site Tools, verify Apache `AllowOverride All` is enabled (default on SiteGround).
4. If using LiteSpeed, verify `.htaccess` compatibility is enabled (it is by default).

### Render Cold Start (Slow First Request)

**Symptom**: First API request after inactivity takes 30-60 seconds.

**Fix**:
1. Set up UptimeRobot to ping `https://api.agrobridge.global/health` every 14 minutes.
2. Or upgrade to Render Starter plan ($7/mo) which does not sleep.

### reCAPTCHA Failures

**Symptom**: Contact form submission returns a reCAPTCHA error.

**Fix**:
1. Verify the domain `agrobridge.global` is registered in the Google reCAPTCHA admin console.
2. Verify the **site key** in `config-production.js` matches the Google console.
3. Verify the **secret key** in Render environment matches the Google console.
4. Check that `RECAPTCHA_MIN_SCORE` is not set too high (default `0.5` is recommended).

### MongoDB Connection Failures

**Symptom**: Backend returns 500 errors, health check shows database disconnected.

**Fix**:
1. Verify `MONGODB_URI` in Render is correct (check for typos in password).
2. In MongoDB Atlas > **Network Access**, verify `0.0.0.0/0` is whitelisted.
3. Verify the database user has `readWrite` permissions.
4. Check MongoDB Atlas > **Monitoring** for connection count limits (M0 allows 500 connections).

### Email Not Sending (Contact Form)

**Symptom**: Contact form submits successfully but no email arrives.

**Fix**:
1. Verify `RESEND_API_KEY` is set correctly in Render.
2. Verify the domain `agrobridge.global` is verified in the Resend dashboard.
3. Check the Resend dashboard > **Logs** for delivery status.
4. Verify `OWNER_EMAIL` is a valid, deliverable address.

### Build Failures

**Symptom**: `npm run build` fails during deployment.

**Fix**:
1. Run `npm run build` locally to reproduce the error.
2. Common causes: missing esbuild binary (run `npm ci` to reinstall).
3. Verify all source files exist in `public_html/scripts/` and `public_html/assets/`.

---

## Contact

For deployment issues:
- Alejandro Navarro Ayala - CEO & Founder: ceo@agrobridge.global
