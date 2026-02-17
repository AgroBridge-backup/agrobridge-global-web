import request from 'supertest';

const ACCESS_SECRET = 'a'.repeat(64);
const REFRESH_SECRET = 'b'.repeat(64);
const CSRF_SECRET = 'c'.repeat(32);

let app;
let authService;
let ipCounter = 20;

const randomIp = () => {
  ipCounter += 1;
  if (ipCounter > 220) {
    ipCounter = 21;
  }
  return `203.0.113.${ipCounter}`;
};

const withClientIp = (req, ip = randomIp()) => req.set('X-Forwarded-For', ip);

beforeAll(async () => {
  process.env.NODE_ENV = 'production';
  process.env.JWT_ACCESS_SECRET = ACCESS_SECRET;
  process.env.JWT_REFRESH_SECRET = REFRESH_SECRET;
  process.env.CSRF_SECRET = CSRF_SECRET;
  process.env.TRUST_PROXY = 'true';
  process.env.CORS_ORIGIN = 'https://allowed.agrobridge.test';
  process.env.CORS_METHODS = 'GET,POST,PUT,DELETE,PATCH,OPTIONS';
  process.env.RATE_LIMIT_ENABLED = 'true';
  process.env.RATE_LIMIT_WINDOW_MS = '4000';
  process.env.RATE_LIMIT_MAX_REQUESTS = '2';
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/agrobridge-security-tests';
  process.env.DB_SERVER_SELECTION_TIMEOUT = '100';
  process.env.DB_CONNECTION_TIMEOUT = '100';
  process.env.ENABLE_TEST_ENDPOINTS = 'true';

  const { createApp } = await import('../../src/index.js');
  authService = (await import('../../src/services/authService.js')).default;
  app = createApp();
});

describe('Security middleware integration', () => {
  describe('CSP and security headers', () => {
    test('serves CSP header without unsafe-inline and with expected directives', async () => {
      const response = await withClientIp(request(app).get('/'));

      expect(response.status).toBe(200);
      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['content-security-policy']).not.toContain("'unsafe-inline'");
      expect(response.headers['content-security-policy']).toContain('default-src');
      expect(response.headers['content-security-policy']).toContain('script-src');
      expect(response.headers['content-security-policy']).toContain('style-src');
      expect(response.headers['content-security-policy']).toContain('connect-src');
      expect(response.headers['content-security-policy']).toContain('frame-src');
      expect(response.headers['content-security-policy']).toContain('object-src');
      expect(response.headers['strict-transport-security']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['referrer-policy']).toBeDefined();
    });

    test('serves expected bootstrap scripts without inline runtime dependency', async () => {
      const response = await withClientIp(request(app).get('/'));

      expect(response.status).toBe(200);
      expect(response.text).toContain('scripts/runtime-bootstrap.js');
      expect(response.text).toContain('scripts/web-vitals.js');
      expect(response.text).toContain('scripts/page-ready.js');
      expect(response.text).not.toContain('function applyRuntimeDefaults()');
      expect(response.text).not.toContain('document.addEventListener(\'DOMContentLoaded\', function() {');
    });
  });

  describe('CSRF', () => {
    test('GET /api/csrf-token returns token and CSRF cookie', async () => {
      const response = await withClientIp(request(app).get('/api/csrf-token'));

      expect(response.status).toBe(200);
      expect(typeof response.body.csrfToken).toBe('string');
      expect(response.body.csrfToken.length).toBeGreaterThan(10);
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('csrf-token=');
      expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
      expect(response.headers['set-cookie'][0]).toContain('SameSite=Strict');
    });

    test('state-changing request without CSRF token fails with 403', async () => {
      const response = await withClientIp(request(app).post('/api/test/csrf-protected').send({ sample: true }));

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('CSRF_ERROR');
    });

    test('mismatched CSRF token and cookie fails with 403', async () => {
      const tokenResponse = await withClientIp(request(app).get('/api/csrf-token'));
      const csrfCookie = tokenResponse.headers['set-cookie'][0].split(';')[0];

      const response = await withClientIp(
        request(app)
          .post('/api/test/csrf-protected')
          .set('Cookie', csrfCookie)
          .set('X-CSRF-Token', 'invalid-token')
          .send({ sample: true })
      );

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('CSRF_ERROR');
    });

    test('valid token and cookie succeeds on controlled endpoint', async () => {
      const tokenResponse = await withClientIp(request(app).get('/api/csrf-token'));
      const csrfCookie = tokenResponse.headers['set-cookie'][0].split(';')[0];
      const csrfToken = tokenResponse.body.csrfToken;

      const response = await withClientIp(
        request(app)
          .post('/api/test/csrf-protected')
          .set('Cookie', csrfCookie)
          .set('X-CSRF-Token', csrfToken)
          .send({ sample: true })
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('CSRF validation passed');
    });
  });

  describe('CORS', () => {
    test('allowed origin receives CORS headers', async () => {
      const response = await withClientIp(
        request(app)
          .get('/health')
          .set('Origin', 'https://allowed.agrobridge.test')
      );

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('https://allowed.agrobridge.test');
    });

    test('disallowed origin is blocked with 403', async () => {
      const response = await withClientIp(
        request(app)
          .get('/health')
          .set('Origin', 'https://malicious.example')
      );

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('CORS_ERROR');
    });

    test('missing Origin is allowed for operational calls', async () => {
      const response = await withClientIp(request(app).get('/health'));

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });

    test('OPTIONS preflight responds with expected CORS headers', async () => {
      const response = await withClientIp(
        request(app)
          .options('/api/admin/leads')
          .set('Origin', 'https://allowed.agrobridge.test')
          .set('Access-Control-Request-Method', 'GET')
      );

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe('https://allowed.agrobridge.test');
      expect(response.headers['access-control-allow-methods']).toContain('GET');
    });
  });

  describe('Rate limiting and trusted proxies', () => {
    test('TRUST_PROXY=false ignores spoofed X-Forwarded-For for keying', async () => {
      app.set('trust proxy', false);

      const first = await request(app).get('/health').set('X-Forwarded-For', '198.51.100.1');
      const second = await request(app).get('/health').set('X-Forwarded-For', '198.51.100.2');
      const third = await request(app).get('/health').set('X-Forwarded-For', '198.51.100.3');

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(third.status).toBe(429);
    });

    test('TRUST_PROXY=true keys by trusted client IP chain and returns bounded Retry-After', async () => {
      app.set('trust proxy', true);

      const allowedA = await request(app).get('/health').set('X-Forwarded-For', '198.51.100.10');
      const allowedB = await request(app).get('/health').set('X-Forwarded-For', '198.51.100.11');
      const secondForA = await request(app).get('/health').set('X-Forwarded-For', '198.51.100.10');
      const limitedA = await request(app).get('/health').set('X-Forwarded-For', '198.51.100.10');

      expect(allowedA.status).toBe(200);
      expect(allowedB.status).toBe(200);
      expect(secondForA.status).toBe(200);
      expect(limitedA.status).toBe(429);
      expect(limitedA.body.code).toBe('RATE_LIMIT');

      const retryAfter = Number.parseInt(limitedA.headers['retry-after'], 10);
      expect(Number.isFinite(retryAfter)).toBe(true);
      expect(retryAfter).toBeGreaterThanOrEqual(1);
      expect(retryAfter).toBeLessThanOrEqual(4);
      expect(limitedA.body.retryAfter).toBe(retryAfter);
    });
  });

  describe('Admin authorization', () => {
    test('missing bearer token returns 401', async () => {
      const response = await withClientIp(request(app).get('/api/admin/leads'));

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('AUTH_REQUIRED');
    });

    test('invalid bearer token returns 401', async () => {
      const response = await withClientIp(
        request(app)
          .get('/api/admin/leads')
          .set('Authorization', 'Bearer invalid.token.value')
      );

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('AUTH_INVALID_TOKEN');
    });

    test('valid non-admin token returns 403', async () => {
      const token = authService.generateAccessToken({
        id: 'user-123',
        email: 'user@example.com',
        role: 'user',
      });

      const response = await withClientIp(
        request(app)
          .get('/api/admin/leads')
          .set('Authorization', `Bearer ${token}`)
      );

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('AUTH_FORBIDDEN');
    });

    test('valid admin token reaches admin handler path (DB unavailable => 503)', async () => {
      const token = authService.generateAccessToken({
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      });

      const response = await withClientIp(
        request(app)
          .get('/api/admin/leads')
          .set('Authorization', `Bearer ${token}`)
      );

      expect(response.status).toBe(503);
      expect(response.body.code).toBe('DB_UNAVAILABLE');
    });
  });
});
