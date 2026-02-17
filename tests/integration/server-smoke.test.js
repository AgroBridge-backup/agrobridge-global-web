import request from 'supertest';

const ACCESS_SECRET = 'a'.repeat(64);
const REFRESH_SECRET = 'b'.repeat(64);
const CSRF_SECRET = 'c'.repeat(32);

let server;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '0';
  process.env.SERVER_PORT = '0';
  process.env.TRUST_PROXY = 'false';
  process.env.JWT_ACCESS_SECRET = ACCESS_SECRET;
  process.env.JWT_REFRESH_SECRET = REFRESH_SECRET;
  process.env.CSRF_SECRET = CSRF_SECRET;
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/agrobridge-test';
  process.env.DB_SERVER_SELECTION_TIMEOUT = '100';
  process.env.DB_CONNECTION_TIMEOUT = '100';

  const { createApp } = await import('../../src/index.js');
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
});

afterAll(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

});

describe('Server startup smoke test', () => {
  test('responds healthy on GET /health', async () => {
    const response = await request(server).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });

  test('serves main HTML on GET /', async () => {
    const response = await request(server).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('<!DOCTYPE html>');
    expect(response.text).toContain('scripts/main.js');
  });

  test('issues CSRF token on GET /api/csrf-token', async () => {
    const response = await request(server).get('/api/csrf-token');
    expect(response.status).toBe(200);
    expect(typeof response.body.csrfToken).toBe('string');
    expect(response.body.csrfToken.length).toBeGreaterThan(10);
  });
});
