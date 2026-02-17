# Threat Model

## 1. System Context and Trust Boundaries
AgroBridge Global Web has two major surfaces:
- Static frontend pages in `/Users/mac/Documents/agrobridge-global-web/public_html`.
- Express backend in `/Users/mac/Documents/agrobridge-global-web/src`.

Primary trust boundaries:
- Browser ↔ public web origin (`agrobridge.global`).
- Browser ↔ API/admin endpoints (`/api/*`).
- Backend ↔ MongoDB.
- Backend ↔ optional Redis store for rate-limit state.
- Backend ↔ third-party resources (reCAPTCHA, Sentry, CDN).

## 2. Entry Points and Data Flows
- `GET /` and legal pages: static content and JS bootstraps.
- `GET /api/csrf-token`: CSRF token issuance + cookie.
- `POST|PUT|PATCH|DELETE` endpoints: CSRF-protected mutation paths.
- `/api/admin/*`: JWT-authenticated admin operations.
- `GET /health`: unauthenticated operational probe.
- Optional `GET /metrics`: observability export when enabled.

## 3. STRIDE-Focused Threats
### Spoofing
- Threat: forged bearer tokens.
- Mitigation: HS256 JWT verification with issuer/audience, separate access/refresh secrets, minimum secret length validation.

### Tampering
- Threat: script/style injection via inline payloads.
- Mitigation: strict CSP without `'unsafe-inline'`, runtime bootstrap moved to external scripts, JSON-LD hash allowlist, removal of inline event handlers.

### Repudiation
- Threat: inability to tie requests to actors.
- Mitigation: request IDs on all responses, structured logs with `request_id`, auth status, and client IP.

### Information Disclosure
- Threat: over-broad cross-origin data exposure.
- Mitigation: explicit CORS allowlist in production and 403 on disallowed origins.

### Denial of Service
- Threat: request floods and proxy IP spoofing.
- Mitigation: express-rate-limit with explicit keying, Retry-After correctness, trust-proxy behavior validated for true/false modes.

### Elevation of Privilege
- Threat: non-admin users accessing admin APIs.
- Mitigation: `authenticate` + `authorize(['admin'])` middleware chain, explicit 401/403 responses, route/service layering with centralized validation.

## 4. Existing Mitigations
- Helmet security headers + CSP parity between Express and Netlify `_headers`.
- CSRF double-submit cookie protection for state-changing methods.
- Mongo sanitization middleware for key injection attempts.
- Layered admin architecture (`model -> repository -> service -> route`) and indexed query paths.
- Observability counters for security failure classes and latency/error trends.

## 5. Residual Risks and Prioritized Follow-ups
- P1: MongoDB outage still impacts admin APIs (returns 503 by design). Owner: Platform.
- P1: In-memory rate-limit fallback can reset on process restart. Owner: Platform.
- P2: Metrics endpoint protection relies on env flag/optional bearer token; enforce network ACL in production. Owner: Platform/SRE.
- P2: Third-party script supply-chain exposure (Sentry/CDN/reCAPTCHA) persists; add subresource integrity where feasible. Owner: Security.
- P3: No automated browser CSP violation collection yet; add report-only endpoint during staged rollouts. Owner: Security.
