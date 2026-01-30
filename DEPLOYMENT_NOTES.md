# AgroBridge Production Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
4. [Staging Deployment](#staging-deployment)
5. [Production Deployment](#production-deployment)
6. [Monitoring & Alerting](#monitoring--alerting)
7. [Post-Deployment Verification](#post-deployment-verification)

---

## Prerequisites

### Required Accounts
- [GitHub](https://github.com) (already have)
- [Netlify](https://netlify.com) - Frontend hosting
- [Render](https://render.com) - Backend hosting
- [MongoDB Atlas](https://www.mongodb.com/atlas) - Database
- [Google reCAPTCHA](https://www.google.com/recaptcha/admin) - Bot protection
- [Sentry](https://sentry.io) - Error tracking
- [New Relic](https://newrelic.com) - APM monitoring
- [Resend](https://resend.com) - Email service

### Required Tools
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Docker (optional, for local testing)

---

## Environment Configuration

### Backend Environment Variables (.env.production)

Create `/Users/mac/Documents/agrobridge-global-backend/.env.production`:

```bash
NODE_ENV=production
PORT=3000

# MongoDB Atlas Production Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/agrobridge-production?retryWrites=true&w=majority

# Resend API Key for Email Notifications
RESEND_API_KEY=re_prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Owner Contact Information
OWNER_EMAIL=ceo@agrobridge.global
OWNER_PHONE=+523511689122

# Google reCAPTCHA v3 Configuration
RECAPTCHA_SECRET_KEY=6LfxXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RECAPTCHA_MIN_SCORE=0.5

# JWT Secret (64-character random string)
JWT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# CORS Origin (Production Frontend URL)
CORS_ORIGIN=https://agrobridge.global

# Sentry Error Tracking
SENTRY_DSN=https://xxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ENVIRONMENT=production

# New Relic APM
NEW_RELIC_LICENSE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEW_RELIC_AGENT_ENABLED=true

# Redis (Optional, for caching)
REDIS_URL=redis://default:xxxxxxxxxxxxxxxxxxxxxx@xxxxxxxx.redis.cloud.com:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Admin Credentials (hashed using bcryptjs)
ADMIN_PASSWORD_HASH=$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Admin Email (for admin dashboard access)
ADMIN_EMAIL=admin@agrobridge.global

# Session Secret for Admin Dashboard
SESSION_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**IMPORTANT**: Never commit `.env.production` to the repository!

### Frontend Configuration

Update `/Users/mac/Documents/agrobridge-global-web/public_html/index.html`:

```javascript
window.AGROBRIDGE_API_BASE = 'https://api.agrobridge.global/v2';
window.AGROBRIDGE_USE_DEMO = false;
window.AGROBRIDGE_RECAPTCHA_SITE_KEY = '6LfxXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

And update the Sentry configuration in the same file:

```javascript
window.AGROBRIDGE_CONFIG = {
    apiBase: 'https://api.agrobridge.global/v2',
    useDemo: false,
    recaptchaSiteKey: '6LfxXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    sentryDsn: 'https://xxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxx',
    sentryEnvironment: 'production',
    release: '2.0.0',
    gitCommit: 'INSERT_GIT_SHA_HERE'
};
```

---

## CI/CD Pipeline Setup

### GitHub Secrets Configuration

Add the following secrets to both GitHub repositories:

#### Frontend (agrobridge-global-web)
- `NETLIFY_AUTH_TOKEN`: Netlify authentication token
- `NETLIFY_SITE_ID`: Netlify site ID for production
- `NETLIFY_SITE_ID_STAGING`: Netlify site ID for staging
- `SLACK_WEBHOOK`: Slack webhook for deployment notifications

#### Backend (agrobridge-global-backend)
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password
- `RENDER_API_KEY`: Render API key
- `RENDER_DEPLOY_HOOK_STAGING`: Render deployment hook for staging
- `RENDER_DEPLOY_HOOK_PRODUCTION`: Render deployment hook for production
- `STAGING_MONGODB_URI`: MongoDB connection string for staging
- `PRODUCTION_MONGODB_URI`: MongoDB connection string for production (set manually in Render)
- `SNYK_TOKEN`: Snyk security scanning token
- `SLACK_WEBHOOK`: Slack webhook for deployment notifications

### CI/CD Pipeline Files

**Frontend**: `.github/workflows/ci-cd.yml`
- Lint → Test → Deploy to Staging (develop branch)
- Lint → Test → Run Staging E2E → Deploy to Production (main branch)

**Backend**: `.github/workflows/ci-cd.yml`
- Lint → Test → Build → Deploy to Staging (develop branch)
- Lint → Test → Build → Manual Approval → Deploy to Production (main branch)

---

## Staging Deployment

### Step 1: Deploy Backend to Staging

1. Create Render account and new project
2. Create a Web Service with:
   - Build Command: `npm ci`
   - Start Command: `npm start`
   - Environment Variables: Set all variables from `.env.production.example` (use staging-specific values)
3. Get the Render deployment hook URL
4. Add to GitHub secrets as `RENDER_DEPLOY_HOOK_STAGING`
5. Push to `develop` branch

### Step 2: Deploy Frontend to Staging

1. Create Netlify account and new site
2. Connect GitHub repository
3. Configure:
   - Build directory: `public_html`
   - Build command: (leave empty - no build needed)
4. Create a separate site for staging or use branch deploy
5. Get the site ID and add to GitHub secrets
6. Push to `develop` branch

### Step 3: Run E2E Tests Against Staging

```bash
cd /Users/mac/Documents/agrobridge-global-web
npx playwright test tests/e2e/integration.spec.js
```

Update Playwright config to use staging URLs:

```javascript
export const config = defineConfig({
  use: {
    baseURL: 'https://staging-agrobridge.netlify.app',
    extraHTTPHeaders: {
      'x-backend-url': 'https://staging-api.agrobridge.global'
    }
  }
});
```

---

## Production Deployment

### Step 1: Deploy Backend to Production

1. Create a new Web Service on Render for production
2. Set environment variables from `.env.production`
3. **CRITICAL**: Set real production values for:
   - `MONGODB_URI` (production MongoDB cluster)
   - `JWT_SECRET` (generate 64-char random string)
   - `RECAPTCHA_SECRET_KEY` (from Google reCAPTCHA console)
   - `RESEND_API_KEY` (from Resend console)
   - `SENTRY_DSN` (from Sentry console)
   - `NEW_RELIC_LICENSE_KEY` (from New Relic console)
4. Get the deployment hook URL
5. Add to GitHub secrets as `RENDER_DEPLOY_HOOK_PRODUCTION`
6. Push to `main` branch
7. **Manual approval** will be required in GitHub Actions

### Step 2: Deploy Frontend to Production

1. Update `index.html` with production configuration
2. Commit and push to `main` branch
3. Netlify will auto-deploy on push to main
4. Verify deployment at https://agrobridge.global

### Step 3: DNS Configuration

Ensure DNS records are properly configured:

```
# Frontend
agrobridge.global → Netlify servers

# Backend API
api.agrobridge.global → Render servers
```

---

## Monitoring & Alerting

### Sentry Error Tracking

**Setup:**
1. Create Sentry account
2. Create new project for Frontend (JavaScript/Browser)
3. Create new project for Backend (Node.js)
4. Get DSNs and add to environment variables

**Alerting Rules:**
- Alert on any error with tag `production`
- Alert on error rate > 5 errors/minute
- Alert on unhandled promise rejections

### New Relic APM

**Setup:**
1. Create New Relic account
2. Get license key
3. Add `NEW_RELIC_LICENSE_KEY` to environment variables
4. Enable agent in backend code

**Alerting Rules:**
- Alert on API error rate > 1%
- Alert on response time p95 > 1000ms
- Alert on database query time p95 > 500ms
- Alert on memory usage > 80%
- Alert on CPU usage > 80%

### Core Web Vitals (Frontend)

**Metrics to Monitor:**
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1

These are automatically tracked by the frontend monitoring script.

---

## Post-Deployment Verification

### Smoke Tests

```bash
# Backend health check
curl https://api.agrobridge.global/health

# Test verification endpoint
curl https://api.agrobridge.global/v2/verify/AGR-2024-001

# Frontend accessibility
curl https://agrobridge.global
```

### E2E Tests

```bash
cd /Users/mac/Documents/agrobridge-global-web
npx playwright test tests/e2e/integration.spec.js
```

### Manual Verification Checklist

- [ ] Frontend loads without console errors
- [ ] Enter lot code AGR-2024-001 and verify
- [ ] All traceability fields display correctly
- [ ] Certifications show properly
- [ ] Quality metrics display
- [ ] Contact form submits successfully
- [ ] Email notifications are received
- [ ] Sentry dashboard shows no errors
- [ ] New Relic dashboard shows healthy metrics
- [ ] No warnings in browser console

### Performance Verification

```bash
# Lighthouse audit
npx lighthouse https://agrobridge.global --view
```

Target scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: 100

---

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Verify `CORS_ORIGIN` matches frontend URL exactly
- Check backend CORS middleware configuration

**2. reCAPTCHA Failures**
- Verify domain is registered in Google reCAPTCHA console
- Check site key matches environment
- Ensure secret key is correct

**3. Email Not Sending**
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for email logs
- Verify `OWNER_EMAIL` is valid

**4. Database Connection Issues**
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure network allows outbound connections

**5. Sentry Not Capturing Errors**
- Verify `SENTRY_DSN` is correct
- Check Sentry project settings
- Ensure environment matches

**6. New Relic Not Showing Data**
- Verify `NEW_RELIC_LICENSE_KEY` is correct
- Check New Relic application name matches
- Ensure agent is enabled

---

## Rollback Plan

If production deployment fails:

### Frontend Rollback
1. Go to Netlify dashboard
2. Select previous successful deploy
3. Click "Publish deploy"
4. Verify rollback completed

### Backend Rollback
1. Go to Render dashboard
2. Redeploy previous successful commit
3. Or use rollback to previous Docker image
4. Verify health endpoint responds

### Emergency Rollback
If immediate action required:
```bash
# Force previous commit
git revert HEAD
git push origin main
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Check Sentry for new errors
- Review New Relic performance metrics

**Weekly:**
- Review error logs
- Check database performance
- Verify backup completion

**Monthly:**
- Review and rotate secrets
- Update dependencies
- Review alert thresholds
- Backup MongoDB data

### Dependency Updates

```bash
# Backend
cd /Users/mac/Documents/agrobridge-global-backend
npm audit fix
npm update

# Frontend
cd /Users/mac/Documents/agrobridge-global-web
npm audit fix
npm update
```

---

## Success Criteria

You are done when:
1. ✅ CI/CD Pipeline: Green, automatic on main push, blocks broken builds
2. ✅ Staging: Accessible, all tests pass, team can test before production
3. ✅ Production: Live at https://agrobridge.global, all features work
4. ✅ Monitoring: APM receiving metrics, errors tracked, alerts configured
5. ✅ Data: At least 1 real product seeded with correct traceability
6. ✅ Performance: LCP < 2.5s, API p95 latency < 500ms
7. ✅ Reliability: Uptime > 99%, error rate < 0.1%

---

## Contact

For deployment issues:
- Tech Lead: [email]
- DevOps Lead: [email]
- Backend Team: [email]
- Frontend Team: [email]
