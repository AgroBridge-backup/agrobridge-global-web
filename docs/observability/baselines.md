# Observability Baselines

## Scope
This baseline covers request telemetry and security failure visibility for AgroBridge Global Web (`/Users/mac/Documents/agrobridge-global-web/src`).

## Instrumentation
Runtime telemetry is emitted by `/Users/mac/Documents/agrobridge-global-web/src/middleware/observability.js` and attached in `/Users/mac/Documents/agrobridge-global-web/src/index.js`.

Recorded metrics:
- Request count (`agrobridge_requests_total`)
- Error count (`agrobridge_errors_total`)
- Status class counts (`agrobridge_requests_by_status_class_total{status_class}`)
- Latency histogram (`agrobridge_request_latency_milliseconds_*`)
- Security failure counters (`agrobridge_security_failures_total{type}`)

Structured request logs include:
- `method`
- `path`
- `status`
- `latency_ms`
- `request_id`
- `client_ip`

Optional metrics endpoint:
- Path: `METRICS_PATH` (default `/metrics`)
- Enable flag: `METRICS_ENDPOINT_ENABLED=true`
- Optional bearer guard: `METRICS_BEARER_TOKEN`

## SLO Baseline
- Availability SLO: 99.9% monthly for `GET /health` and static page delivery.
- Latency SLO: p95 request latency under 600ms for user-facing endpoints.
- Security SLO: sustained auth/CSRF/CORS failure bursts are detected within 5 minutes.

## Alert Thresholds
### 1. 5xx Error Rate
- Warning: `5xx / total` > 1% for 5 minutes.
- Critical: `5xx / total` > 3% for 5 minutes.

### 2. p95 Latency
- Warning: p95 > 600ms for 10 minutes.
- Critical: p95 > 1200ms for 10 minutes.

### 3. Repeated CSRF/CORS/Auth Failures
- Warning: (`csrf` + `cors` + `auth`) failures > 20 in 5 minutes.
- Critical: (`csrf` + `cors` + `auth`) failures > 60 in 5 minutes.

### 4. Rate-Limit Saturation
- Warning: `rate_limit` failures > 15% of requests for 5 minutes.
- Critical: `rate_limit` failures > 35% of requests for 5 minutes.

## Incident Runbook
1. Classify impact.
- Confirm if impact is availability (`5xx`), latency, or abuse/security signal.
- Capture first-seen timestamp, request IDs, and affected endpoints.

2. Stabilize.
- For abuse spikes: tighten `RATE_LIMIT_MAX_REQUESTS` and/or reduce `RATE_LIMIT_WINDOW_MS`.
- For CORS/CSRF/auth bursts: verify edge rules and auth token issuer/audience consistency.
- For infra instability: roll back most recent deployment and verify `/health` recovery.

3. Diagnose.
- Query logs by `request_id`, `status`, and `path`.
- Compare status-class and latency histograms before/after release.
- Inspect security failure counters (`csrf`, `cors`, `auth`, `rate_limit`).

4. Recover.
- Apply config or code mitigation.
- Re-run smoke/security gates (`npm run test:security`, `npm run test:smoke`).
- Confirm alerts return below warning thresholds.

5. Follow-up.
- File action items with owner and due date.
- Update this baseline if thresholds or telemetry contracts changed.
