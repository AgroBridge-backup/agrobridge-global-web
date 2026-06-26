# AGENTS.md

## Project Overview

AgroBridge Global (`agrobridge.global`) is the exports division website for AgroBridge, a traceability platform for Mexican agricultural exports (avocados, berries from Michoacan). It provides:

- **Lot verification**: Users enter a lot code and get full traceability data (origin, certifications, quality metrics, blockchain hash)
- **Contact form**: Enterprise lead capture with reCAPTCHA v3
- **Legal pages**: Privacy, terms, cookies, data rights (Spanish)
- **i18n**: Spanish (default) and English

This repo contains both the **static frontend** (served via SiteGround CDN/rsync from `public_html/`) and an **Express backend scaffold** (`src/`) that provides API endpoints, authentication, and security middleware. The main backend API lives in a separate repo at `~/Documents/agrobridge-global-backend`.

## Tech Stack

**Runtime:** Node.js >= 18.0.0 | npm >= 9.0.0 | ESM (`"type": "module"` in package.json)

**Backend (src/):**
| Package | Version | Purpose |
|---|---|---|
| express | ^5.2.1 | Web framework |
| helmet | ^7.1.0 | HTTP security headers (CSP, HSTS, XSS) |
| cors | ^2.8.5 | Whitelist-based CORS |
| csrf-csrf | ^3.0.6 | Double-submit CSRF protection |
| jsonwebtoken | ^9.0.2 | Dual JWT (access + refresh) |
| express-rate-limit | ^7.1.5 | Rate limiting |
| ioredis | ^5.9.2 | Redis client for rate limiting |
| rate-limit-redis | ^4.3.1 | Redis store for rate limiter |
| mongoose | ^8.0.0 | MongoDB ODM |
| express-mongo-sanitize | ^2.2.0 | NoSQL injection prevention |
| express-validator | ^7.0.1 | Request validation |
| bcryptjs | ^2.4.3 | Password hashing |
| winston | ^3.11.0 | Logging |
| compression | ^1.7.4 | Response compression |
| cookie-parser | ^1.4.7 | Cookie parsing |
| dotenv | ^16.3.1 | Environment variable loading |
| validator | ^13.11.0 | String validation |

**Dev:**
| Package | Version | Purpose |
|---|---|---|
| jest | ^29.7.0 | Unit/integration testing |
| jest-environment-jsdom | ^29.7.0 | Browser DOM simulation |
| @playwright/test | ^1.40.0 | E2E testing |
| eslint | ^8.52.0 | Linting |
| nodemon | ^3.0.1 | Dev server auto-restart |
| supertest | ^6.3.3 | HTTP assertion testing |

**Frontend:** No bundler. Plain JS with window globals and IIFE module pattern loaded via `<script defer>`.

## Directory Structure

```
├── public_html/                  # Frontend (deployed to SiteGround)
│   ├── index.html                # Main page (loads all scripts/styles)
│   ├── config-production.js      # Production config overrides
│   ├── scripts/                  # 18 browser JS modules (IIFE pattern); see Frontend Architecture
│   │   ├── utils.js              # Shared utilities (escapeHtml, debounce/throttle, DOM helpers, fetchWithTimeout)
│   │   ├── demo-data.js          # Demo lot data for offline/testing
│   │   ├── i18n.js               # Translations (es/en) for main site
│   │   ├── ui.js                 # Mobile menu, slideshow, notifications, animations
│   │   ├── validation.js         # Lot code verification logic
│   │   ├── contact.js            # Contact form + reCAPTCHA integration
│   │   ├── app.js                # AgroBridgeApp class (delegates to above modules)
│   │   ├── main.js               # Overrides _construct, bootstraps on DOMContentLoaded
│   │   ├── page-ready.js         # Marks body.ready + IntersectionObserver fade-in
│   │   ├── whatsapp-config.js    # Floating WhatsApp link href from AGROBRIDGE_WHATSAPP_NUMBER
│   │   ├── runtime-bootstrap.js  # Head-loaded (no defer): brand-route selection + config
│   │   ├── web-vitals.js         # LCP/CLS/FID collection via PerformanceObserver -> sendBeacon
│   │   ├── legal-core.js         # Legal page rendering engine
│   │   ├── legal-utils.js        # Legal page utilities
│   │   ├── legal-animations.js   # Legal page animations
│   │   ├── legal-i18n.js         # Legal page chrome/hero i18n (es/en)
│   │   ├── legal-consent.js      # Cookie/data consent manager (shared by main + legal)
│   │   └── legal-cookies-preferences.js  # Cookies-preferences page controller (save/reject/toggles)
│   ├── styles/                   # Legal page CSS only
│   │   ├── legal-base.css
│   │   ├── legal-components.css
│   │   ├── legal-layouts.css
│   │   ├── legal-animations.css
│   │   ├── legal-print.css
│   │   └── legal-utilities.css
│   ├── assets/                   # Main CSS + static resources
│   │   ├── main.css              # Primary stylesheet
│   │   ├── critical.css          # Above-the-fold critical CSS
│   │   ├── utilities.css         # Utility classes
│   │   ├── accesibility.css      # Accessibility styles
│   │   └── compatibility.css     # Cross-browser compatibility
│   ├── legal/                    # Legal HTML pages
│   │   ├── privacidad.html       # Privacy policy
│   │   ├── terminos.html         # Terms of service
│   │   ├── cookies.html          # Cookie policy
│   │   ├── datos.html            # Data rights
│   │   └── _template.html        # Legal page template
│   └── styles/                   # Legal page CSS only
├── src/                          # Backend (Express server)
│   ├── index.js                  # Entry point: Express app, middleware, routes, server
│   ├── config/
│   │   └── index.js              # Config with secret validation (fails fast)
│   ├── middleware/
│   │   ├── security.js           # Helmet, CORS, rate-limit, mongo-sanitize, CSRF
│   │   ├── auth.js               # JWT authenticate, authorize(roles), optionalAuth
│   │   ├── validation.js         # express-validator rules (leads, pagination)
│   │   └── errorHandler.js       # Global error handler (last middleware)
│   ├── routes/
│   │   └── admin.js              # /api/admin/* -- CRUD leads, stats (admin-only)
│   ├── services/
│   │   └── authService.js        # JWT sign/verify (HS256, JTI tracking)
│   └── utils/
│       ├── logger.js             # Winston logger (file + console)
│       └── shutdown.js           # Graceful shutdown (SIGTERM/SIGINT)
├── tests/
│   ├── unit/
│   │   └── agroBridgeApp.test.js
│   ├── integration/
│   │   ├── navigation.test.js
│   │   └── validation.test.js
│   ├── accessibility/
│   │   └── a11y.test.js
│   └── e2e/                      # Playwright tests (excluded from Jest)
├── .github/workflows/
│   └── ci-cd.yml                 # Lint -> Test -> Deploy pipeline
├── jest.config.js                # Jest config (ESM export)
└── .env.example                  # Environment variable template
```

## npm Scripts

**Working scripts (used regularly):**
| Script | Command | Description |
|---|---|---|
| `start` | `node src/index.js` | Start Express server |
| `start:prod` | `NODE_ENV=production node src/index.js` | Start in production mode |
| `dev` | `nodemon index.js` | Dev server with auto-restart |
| `test` | `jest --coverage` | Run all tests with coverage |
| `test:unit` | `jest tests/unit --coverage` | Unit tests only |
| `test:integration` | `jest tests/integration --coverage` | Integration tests |
| `test:a11y` | `jest tests/accessibility --coverage` | Accessibility tests |
| `test:e2e` | `npx playwright test` | Playwright E2E tests |
| `test:watch` | `jest --watch` | Jest in watch mode |
| `test:ci` | `jest --ci --coverage` | CI test run with junit reporter |
| `sync:brand` | `node scripts/sync-brand-logo.mjs` | Regenerate brand logo markup across all HTML pages from canonical templates |
| `lint:brand` | `sync-brand-logo.mjs --check` | CI gate: exit 1 if brand markup drifted out of sync (hooked into `test:release-gates`) |
| `clean` | `rm -rf node_modules && npm cache clean --force` | Full clean |

> **ℹ️ No build step**: The repo intentionally ships without a JS/CSS minification pipeline. HTML references source CSS/JS directly (e.g. `assets/main.css`, `scripts/utils.js`). Lighthouse Performance = 100 on Netlify CDN without minification (brotli + HTTP/2 + edge cache compensate). A build step was originally present (`esbuild` + `public_html/dist/`) but was **removed in Sprint 1 Día 2** as dead code — it generated files that no HTML referenced. If the site grows 10× and minification becomes meaningful, re-introducing it takes ~30 min.

**Legacy scripts (reference `tools/` which no longer exists -- will fail):**
`deploy`, `deploy:full`, `pre-deploy`, `post-deploy`, `test:backend`, `test:blockchain`, `test:security`, `test:api`, `test:compatibility`, `test:hash`, `persistence:*`, `blockchain:*`, `monitor:*`, `lotes:*`, `optimize`, `security:scan`, `reset:dev`, `docs`, `logs:view`

## Environment Variables

### Required (server will crash without these)

| Variable | Min Length | Description |
|---|---|---|
| `JWT_ACCESS_SECRET` | 64 chars | Access token signing secret |
| `JWT_REFRESH_SECRET` | 64 chars | Refresh token signing secret (must differ from access) |
| `CSRF_SECRET` | 32 chars | CSRF double-submit cookie secret |

### Optional (with defaults)

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | Server port |
| `SERVER_HOST` | `0.0.0.0` | Server bind address |
| `SERVER_TIMEOUT` | `30000` | Server timeout (ms) |
| `SERVER_KEEP_ALIVE` | `false` | Enable keep-alive |
| `MONGODB_URI` | `mongodb://localhost:27017/agrobridge` | MongoDB connection string |
| `DB_POOL_SIZE` | `20` | MongoDB connection pool size |
| `DB_CONNECTION_TIMEOUT` | `45000` | MongoDB socket timeout (ms) |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `JWT_ISSUER` | `agrobridge` | JWT issuer claim |
| `JWT_AUDIENCE` | `agrobridge-api` | JWT audience claim |
| `CSRF_COOKIE_NAME` | `csrf-token` | CSRF cookie name |
| `CSRF_HEADER_NAME` | `X-CSRF-Token` | CSRF header name |
| `CSRF_SECURE` | `true` in production | Secure cookie flag |
| `CSRF_SAME_SITE` | `strict` | SameSite cookie attribute |
| `BCRYPT_ROUNDS` | `12` | bcrypt cost factor |
| `MAX_LOGIN_ATTEMPTS` | `5` | Lockout threshold |
| `LOCKOUT_DURATION` | `900` | Lockout duration (seconds) |
| `PASSWORD_MIN_LENGTH` | `12` | Minimum password length |
| `REQUIRE_STRONG_PASSWORD` | `true` | Enforce password complexity |
| `SESSION_TIMEOUT` | `3600` | Session timeout (seconds) |
| `CORS_ORIGIN` / `CORS_ORIGINS` | `*` in dev, `false` in prod | Allowed origins (comma-separated) |
| `CORS_CREDENTIALS` | `false` | Allow credentials |
| `CORS_METHODS` | `GET,POST,PUT,DELETE,PATCH,OPTIONS` | Allowed HTTP methods |
| `CORS_MAX_AGE` | `86400` | Preflight cache (seconds) |
| `RATE_LIMIT_ENABLED` | `true` | Enable rate limiting |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `REDIS_URL` | (none) | Redis URL for rate limiting (falls back to in-memory) |
| `LOG_LEVEL` | `info` | Winston log level |
| `FRONTEND_URL` | (none) | Production frontend URL for CORS |
| `ADMIN_URL` | (none) | Admin dashboard URL for CORS |
| `APP_NAME` | `AgroBridge` | Application name |
| `APP_VERSION` | `1.0.0` | Application version |

### Frontend-only (set in index.html or config-production.js)

| Variable | Description |
|---|---|
| `window.AGROBRIDGE_API_BASE` | Backend API base URL (default: `https://api.agrobridge.global/v2`) |
| `window.AGROBRIDGE_USE_DEMO` | `true` to use demo data without backend |
| `window.AGROBRIDGE_RECAPTCHA_SITE_KEY` | Google reCAPTCHA v3 site key |
| `window.AGROBRIDGE_RECAPTCHA_ACTION` | reCAPTCHA action name (default: `enterprise_lead`) |
| `window.AGROBRIDGE_SENTRY_DSN` | Sentry DSN (optional, leave empty to disable) |

## Frontend Architecture

The frontend uses **window globals with IIFE module pattern** (no bundler, no import/export). On `index.html`, scripts load via `<script defer>` in this order (except `runtime-bootstrap.js`, which is head-loaded without defer so brand-route + config resolve before first paint):

1. `runtime-bootstrap.js` -> brand-route selection (URL param -> localStorage) + config bootstrap (head, blocking)
2. `web-vitals.js` -> LCP/CLS/FID via `PerformanceObserver` -> `sendBeacon`
3. `utils.js` -> `window.AgroBridgeUtils` (base utilities, must load first)
4. `demo-data.js` -> `window.AgroBridgeDemoData`
5. `i18n.js` -> `window.AgroBridgeI18n`
6. `ui.js` -> `window.AgroBridgeUI`
7. `validation.js` -> `window.AgroBridgeValidation`
8. `contact.js` -> `window.AgroBridgeContact`
9. `app.js` -> `window.AgroBridge.App` (class definition, delegates to modules above)
10. `main.js` -> Overrides `_construct` on `AgroBridgeApp.prototype`, bootstraps on `DOMContentLoaded`
11. `page-ready.js` -> Marks `body.ready` + IntersectionObserver fade-in
12. `whatsapp-config.js` -> Floating WhatsApp link href from `AGROBRIDGE_WHATSAPP_NUMBER`
13. `legal-consent.js` -> Cookie/data consent banner manager

The `AgroBridgeApp` class uses **prototype extension pattern**: `app.js` defines the class with method delegations, `main.js` overrides `_construct` and `_trackListener`, then bootstraps. All modules reference each other through `window.*` globals.

Legal pages (`legal/*.html`) load their own 6 scripts (no defer): `legal-i18n.js` -> `legal-core.js` -> `legal-animations.js` -> `legal-utils.js` -> `legal-consent.js` -> `legal-cookies-preferences.js`. The cookies-preferences controller only runs on `legal/cookies.html`.

### Brand Assets

Brand logo files live in `public_html/assets/images/`. Generated from the source JPG via `sharp` (alpha matting on beige background, palette-quantized PNGs, multi-resolution `favicon.ico`, PWA icons).

**Single source of truth**: brand `<img>` markup is centralized in `scripts/sync-brand-logo.mjs`. **Never hand-edit logo `<img>` tags** in HTML files — instead:
1. Edit `TEMPLATES` in `scripts/sync-brand-logo.mjs`
2. Run `npm run sync:brand` (writes to all 6 HTML files)
3. Verify with `npm run lint:brand` (CI gate, exits 1 on drift)

**File naming**:
- `logo-{N}.png` — display variants at N px height (16, 32, 48, 64, 80, 96, 128, 192, 256, 384, 512). Aspect 1056/992.
- `logo.png` — master at 512px height, palette-quantized (~47 KB)
- `favicon.ico` — multi-resolution (16/32/48)
- `apple-touch-icon.png` — 180×180 on brand navy bg
- `og-image.jpg` — 1200×630 social card
- `logo-social.jpg` — 512×512 on white bg (for JSON-LD fallback)
- `pwa-any-{192,512}.png` — PWA icon (any purpose), on brand navy
- `pwa-maskable-{192,512}.png` — PWA icon (maskable safe zone), on brand green

**Codec choice**: palette PNG (64 colors) wins over AVIF/WebP for this logo by 2.7–4.4× because the artwork has a flat color palette, not photographic gradients. Do not "optimize" to AVIF without re-running the empirical comparison in the `logo-tool` script.

**Regenerating assets**: the `sharp`-based generator lives in a temp dir outside the project (to avoid polluting `package.json`). Ask the user to re-run if the source logo changes.

## Backend Architecture

**Entry point:** `src/index.js` (ESM)

Request pipeline:
1. Request ID middleware (X-Request-ID header, UUID)
2. Body parsers (JSON + URL-encoded, 10KB limit)
3. Cookie parser
4. Compression
5. Security middleware (`setupSecurity(app)` from `security.js`):
   - Helmet (CSP, HSTS 1yr with preload, frameguard deny, noSniff, XSS filter)
   - CORS (whitelist in production: `FRONTEND_URL` + `ADMIN_URL`; permissive in dev)
   - Rate limiting (100 req/15 min, Redis-backed with in-memory fallback)
   - MongoDB sanitization (replaces `$` and `.` with `_`)
   - CSRF double-submit (via `csrf-csrf`, on POST/PUT/PATCH/DELETE only)
   - CSRF token endpoint: `GET /api/csrf-token`
6. Static file serving (`public_html/`)
7. API routes: `/api/admin/*` (authenticated, admin-only)
8. Health check: `GET /health`
9. Global error handler (last `app.use()`)

**Authentication:** Dual JWT with HS256
- Access tokens: 15m default, signed with `JWT_ACCESS_SECRET` (64+ chars)
- Refresh tokens: 7d default, signed with `JWT_REFRESH_SECRET` (64+ chars, must differ)
- Both include JTI (JWT ID) for token tracking via `crypto.randomUUID()`
- Refresh tokens include `type: 'refresh'` claim, validated on verification
- Middleware: `authenticate` (required), `authorize(roles)` (role check), `optionalAuth` (passthrough)

**Note:** `src/middleware/auth.js` and `src/services/authService.js` use CommonJS (`require`/`module.exports`) while the rest of `src/` uses ESM. The `admin.js` route imports the CommonJS auth module via ESM `import` -- this works due to Node's interop.

## Testing

**Framework:** Jest 29 with jsdom environment (ESM via `--experimental-vm-modules`)

**Coverage provider:** V8 (`coverageProvider: 'v8'`) — instruments by execution via Node's V8 inspector rather than babel transform, so every `collectCoverageFrom` file that runs reports real numbers. The legacy Istanbul provider silently omitted files loaded via the window-global IIFE pattern.

**Coverage thresholds** (from `jest.config.js`, ratcheted ~2pt below measured to act as a regression floor):
| Metric | Threshold | Measured baseline |
|---|---|---|
| Lines | 84% | 86.78% |
| Statements | 84% | 86.78% |
| Functions | 79% | 81.45% |
| Branches | 70% | 72.83% |

**Coverage collected from:** `app.js`, `contact.js`, `demo-data.js`, `i18n.js`, `ui.js`, `utils.js`, `validation.js` (7 of 18 frontend modules -- runtime/bootstrap/legal/web-vitals/whatsapp scripts excluded)

**Test suites:**
- `tests/unit/agroBridgeApp.test.js` -- Core app functionality
- `tests/unit/{utils,validation-reset,bootstrap-smoke,legal-consent,contact-submit}.test.js` -- Focused module coverage
- `tests/integration/{navigation,validation,index-bootstrap,server-smoke,legal-pages}.test.js` -- Integration flows
- `tests/accessibility/a11y.test.js` -- Accessibility checks
- `tests/security/*.test.js` -- Backend security (CSRF, CORS, rate-limit, admin auth) + **backend coverage gate for `src/`** (V8, ratcheted; separate config, excluded from `npm test`)
- `tests/e2e/` -- Playwright E2E (excluded from Jest via `testPathIgnorePatterns`)

**Commands:**
```bash
# Run all tests
npm test

# Run single file
node --experimental-vm-modules node_modules/jest/bin/jest.js tests/unit/agroBridgeApp.test.js

# E2E full suite (requires running frontend + backend; post-deploy uses FRONTEND_URL)
npm run test:e2e

# E2E pre-merge smoke (chromium only, local static server, no backend)
npm run test:e2e:smoke

# Backend security + src/ coverage gate
npm run test:security
```

## CI/CD Pipeline

**File:** `.github/workflows/ci-cd.yml`

**Triggers:** Push or PR to `main` or `develop`

**Jobs:**
1. **Lint** -- `npm run lint` (eslint on src/ + public_html/scripts/ + tests/)
2. **Release Gates** (depends on Lint) -- `validate:config` + `test:security` + `test:smoke` + `lint:brand` (brand markup sync check)
3. **Security Audit** (depends on Lint) -- `npm audit --production --audit-level=high`
4. **Test** (depends on Release Gates + Security) -- `test:ci` with JUnit reporter + Codecov upload
5. **Deploy Staging** (depends on Test, `develop` branch push only) -- rsync `public_html/` to SiteGround staging, smoke test `https://staging.agrobridge.global`
6. **Deploy Production** (depends on Test, `main` branch push only) -- rsync to SiteGround prod, smoke test `https://agrobridge.global`, run Playwright E2E against prod, Slack notification

**Required GitHub Secrets:** `SITEGROUND_SSH_HOST`, `SITEGROUND_SSH_USER`, `SITEGROUND_SSH_KEY`, `SITEGROUND_REMOTE_PATH`, `SITEGROUND_STAGING_PATH`

**Optional GitHub Secrets:** `SITEGROUND_SSH_PORT` (default 18765), `SLACK_WEBHOOK`, `CODECOV_TOKEN`

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | None | Health check (status, uptime, version) |
| `GET` | `/api/csrf-token` | None | Get CSRF token |
| `GET` | `/api/admin/leads` | Admin | List leads (paginated) |
| `GET` | `/api/admin/leads/:id` | Admin | Get lead by ID |
| `PATCH` | `/api/admin/leads/:id` | Admin | Update lead status/notes |
| `DELETE` | `/api/admin/leads/:id` | Admin | Delete lead |
| `GET` | `/api/admin/stats` | Admin | Dashboard statistics |

**Note:** The verification (`/v2/verify/:code`) and lead submission (`/v2/leads`) endpoints are served by the separate backend at `~/Documents/agrobridge-global-backend`, not this repo.

## Development Setup

```bash
# 1. Clone and install
cd ~/Documents/agrobridge-global-web
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env: set JWT_ACCESS_SECRET (64+ chars), JWT_REFRESH_SECRET (64+ chars, different), CSRF_SECRET (32+ chars)

# 3. Start dev server
npm run dev

# 4. Run tests
npm test
```

For full-stack development with the backend:
```bash
# Terminal 1: Backend
cd ~/Documents/agrobridge-global-backend
npm run dev

# Terminal 2: Frontend (this repo)
cd ~/Documents/agrobridge-global-web
npm run dev
# Or serve static files directly:
npx serve public_html -l 5000
```

## Sibling Repos

| Repo | Path | Relationship |
|---|---|---|
| Backend API | `~/Documents/agrobridge-global-backend` | Serves `/v2/verify/:code` and `/v2/leads` endpoints that this frontend consumes |

## Deployment

- **Frontend**: SiteGround via `scripts/deploy-siteground.sh` (rsync over SSH) -- deploys `public_html/` to production doc root. CI/CD hooks exist in `.github/workflows/ci-cd.yml` but require GitHub secrets (`SSH_HOST`, `SSH_USER`, `SSH_KEY`, `SITEGROUND_STAGING_PATH`) to be configured.
- **Backend**: Render.com -- see backend repo
- **Domain**: `agrobridge.global` (SiteGround) / `api.agrobridge.global` (Render)
- **Preview deploys**: Netlify CLI can be used for isolated CDN validation (e.g. `netlify deploy --dir=public_html --prod`). Not the production host since commit `1bf3eeb` (Feb 2026).

## Architectural Decision Records

### ADR-001: Render-blocking CSS — Won't Fix (2026-06-24)

**Status**: Accepted

**Context**: 6 CSS stylesheets load render-blocking in `<head>` of `index.html`:
`critical.css` (38KB), `main.css` (75KB), `accesibility.css` (9KB),
`utilities.css` (4KB), `premium-theme.css` (16KB), `premium-tokens-v1.css` (6KB).
Total: ~148KB before brotli. Lighthouse `render-blocking-insight` audit
consistently reports this as an optimization opportunity.

Audit performed Sprint 2 Día 1 revealed:
- All 6 files contain rules used above-the-fold (interconnected)
- `critical.css` is a hand-written "minimum viable styles" subset that
  intentionally duplicates rules from `main.css` (`.button`, `.animate-*`)
- Simple `media="print" onload="this.media='all'"` async trick would cause
  FOUC on `.skip-link`, `:focus-visible`, `.button`, `.nav__link`,
  `.hero__title`, `.container` max-width, `html` responsive font-size

**Decision**: **Won't Fix.** No critical CSS extraction (Penthouse), no
async loading, no consolidation of `critical.css` into `main.css`.

**Rationale (empirical)**:
- Lighthouse Performance: **100/100** on Netlify CDN (measured 2026-06-24)
- LCP: **1.0s** (objective was <1.8s)
- CLS: **0.0**, TBT: **0ms**
- The original "LCP variance 1.4s↔2.4s" symptom disappeared with Sprint 1
  CDN validation (it was edge cache warmth, not CSS blocking)
- Cost of Fase 2: 1 day engineering + FOUC risk in 3 viewports + ongoing
  critical CSS maintenance burden
- Benefit: 0 marginal — already at 100

**Consequences**:
- Future agents should NOT re-attempt D2 optimization without a clear
  regression in Performance score or measured LCP > 1.8s on production CDN
- If site grows 10× and Performance drops below 95, re-evaluate
- The `critical.css`/`main.css` duplication is accepted as intentional
  defensive design (graceful degradation if `main.css` fails to load)
- Brotli + HTTP/2 + edge cache remain the compensating factors

**Re-evaluation triggers** (when to revisit):
- Lighthouse Performance < 95 sustained across 3 runs
- LCP > 2.5s measured on production CDN (not preview)
- Mobile-only regression (CSS size > 200KB combined)
- New CSS files added without consolidation review
