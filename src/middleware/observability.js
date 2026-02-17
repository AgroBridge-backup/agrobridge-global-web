import logger from '../utils/logger.js';

const LATENCY_BUCKETS_MS = [50, 100, 250, 500, 1000, 2000, 5000];

const incrementCounter = (counter, key, value = 1) => {
  counter[key] = (counter[key] || 0) + value;
};

const statusClassOf = (statusCode) => `${Math.floor(statusCode / 100)}xx`;

const initializeLatencyBuckets = () => {
  const buckets = {};
  LATENCY_BUCKETS_MS.forEach((bucket) => {
    buckets[bucket] = 0;
  });
  buckets.inf = 0;
  return buckets;
};

const observeLatency = (state, latencyMs) => {
  const bucket = LATENCY_BUCKETS_MS.find((candidate) => latencyMs <= candidate);
  if (bucket) {
    state.latencyHistogram[bucket] += 1;
    return;
  }

  state.latencyHistogram.inf += 1;
};

const createObservabilityState = () => ({
  startedAt: Date.now(),
  requestsTotal: 0,
  errorsTotal: 0,
  requestsByStatusClass: {},
  requestsByStatusCode: {},
  latencyHistogram: initializeLatencyBuckets(),
  latencyTotalMs: 0,
  securityFailures: {},
});

const formatMetricsOutput = (state) => {
  const uptimeSeconds = Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000));
  const totalLatencyCount = Object.values(state.latencyHistogram).reduce((sum, count) => sum + count, 0);

  const lines = [
    '# HELP agrobridge_uptime_seconds Process uptime in seconds',
    '# TYPE agrobridge_uptime_seconds gauge',
    `agrobridge_uptime_seconds ${uptimeSeconds}`,
    '# HELP agrobridge_requests_total Total HTTP requests observed',
    '# TYPE agrobridge_requests_total counter',
    `agrobridge_requests_total ${state.requestsTotal}`,
    '# HELP agrobridge_errors_total Total HTTP 4xx/5xx responses',
    '# TYPE agrobridge_errors_total counter',
    `agrobridge_errors_total ${state.errorsTotal}`,
    '# HELP agrobridge_request_latency_milliseconds Request latency histogram',
    '# TYPE agrobridge_request_latency_milliseconds histogram',
  ];

  let cumulative = 0;
  LATENCY_BUCKETS_MS.forEach((bucket) => {
    cumulative += state.latencyHistogram[bucket];
    lines.push(`agrobridge_request_latency_milliseconds_bucket{le="${bucket}"} ${cumulative}`);
  });
  cumulative += state.latencyHistogram.inf;
  lines.push(`agrobridge_request_latency_milliseconds_bucket{le="+Inf"} ${cumulative}`);
  lines.push(`agrobridge_request_latency_milliseconds_sum ${state.latencyTotalMs.toFixed(2)}`);
  lines.push(`agrobridge_request_latency_milliseconds_count ${totalLatencyCount}`);

  Object.entries(state.requestsByStatusClass).forEach(([statusClass, count]) => {
    lines.push(`agrobridge_requests_by_status_class_total{status_class="${statusClass}"} ${count}`);
  });

  Object.entries(state.securityFailures).forEach(([failureType, count]) => {
    lines.push(`agrobridge_security_failures_total{type="${failureType}"} ${count}`);
  });

  return `${lines.join('\n')}\n`;
};

const createObservabilityMiddleware = ({
  metricsBearerToken = '',
} = {}) => {
  const state = createObservabilityState();

  const middleware = (req, res, next) => {
    const requestStart = process.hrtime.bigint();

    res.on('finish', () => {
      const elapsedNs = process.hrtime.bigint() - requestStart;
      const latencyMs = Number(elapsedNs) / 1_000_000;
      const statusCode = res.statusCode || 0;
      const statusClass = statusClassOf(statusCode);

      state.requestsTotal += 1;
      state.latencyTotalMs += latencyMs;
      incrementCounter(state.requestsByStatusClass, statusClass);
      incrementCounter(state.requestsByStatusCode, String(statusCode));
      observeLatency(state, latencyMs);

      if (statusCode >= 400) {
        state.errorsTotal += 1;
      }

      if (req.securityFailureType) {
        incrementCounter(state.securityFailures, req.securityFailureType);
      }

      logger.info?.('http_request', {
        method: req.method,
        path: req.originalUrl || req.url,
        status: statusCode,
        latency_ms: Number(latencyMs.toFixed(2)),
        request_id: req.id,
        client_ip: req.ip,
      });
    });

    next();
  };

  const metricsAuthMiddleware = (req, res, next) => {
    if (!metricsBearerToken) {
      return next();
    }

    const expected = `Bearer ${metricsBearerToken}`;
    if (req.get('authorization') !== expected) {
      req.securityFailureType = 'metrics_auth';
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        code: 'METRICS_UNAUTHORIZED',
        requestId: req.id,
      });
    }

    return next();
  };

  const metricsHandler = (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(formatMetricsOutput(state));
  };

  return {
    state,
    middleware,
    metricsAuthMiddleware,
    metricsHandler,
  };
};

export {
  LATENCY_BUCKETS_MS,
  createObservabilityMiddleware,
  createObservabilityState,
  formatMetricsOutput,
};

export default createObservabilityMiddleware;
