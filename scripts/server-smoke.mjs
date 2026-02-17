import { spawn } from 'node:child_process';

const HEALTH_TIMEOUT_MS = 15000;
const HEALTH_POLL_INTERVAL_MS = 250;
const port = Number.parseInt(process.env.SMOKE_PORT || '4100', 10);
const baseUrl = `http://127.0.0.1:${port}`;

const syntheticEnv = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SERVER_HOST: '127.0.0.1',
  SERVER_PORT: String(port),
  PORT: String(port),
  TRUST_PROXY: process.env.TRUST_PROXY || 'true',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'a'.repeat(64),
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'b'.repeat(64),
  CSRF_SECRET: process.env.CSRF_SECRET || 'c'.repeat(32),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agrobridge-smoke',
  DB_SERVER_SELECTION_TIMEOUT: process.env.DB_SERVER_SELECTION_TIMEOUT || '200',
  DB_CONNECTION_TIMEOUT: process.env.DB_CONNECTION_TIMEOUT || '200',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startServer = () => {
  const child = spawn('node', ['src/index.js'], {
    env: syntheticEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });

  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  return {
    child,
    getLogs: () => ({ stdout, stderr }),
  };
};

const waitForHealth = async (url, timeoutMs) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${url}/health`);
      if (response.status === 200) {
        return response;
      }
    } catch (_error) {
      // Ignore until timeout.
    }

    await sleep(HEALTH_POLL_INTERVAL_MS);
  }

  throw new Error(`Server did not become healthy within ${timeoutMs}ms`);
};

const stopServer = async (child) => {
  if (!child || child.killed) {
    return;
  }

  await new Promise((resolve) => {
    child.once('exit', () => resolve());
    child.kill('SIGTERM');
    setTimeout(() => {
      if (!child.killed) {
        child.kill('SIGKILL');
      }
    }, 4000);
  });
};

const { child, getLogs } = startServer();

try {
  await waitForHealth(baseUrl, HEALTH_TIMEOUT_MS);

  const healthResponse = await fetch(`${baseUrl}/health`);
  const rootResponse = await fetch(`${baseUrl}/`);
  const rootHtml = await rootResponse.text();

  if (healthResponse.status !== 200) {
    throw new Error(`Expected /health status 200, got ${healthResponse.status}`);
  }

  if (rootResponse.status !== 200) {
    throw new Error(`Expected / status 200, got ${rootResponse.status}`);
  }

  if (!rootHtml.includes('<!DOCTYPE html>')) {
    throw new Error('Root response did not contain HTML doctype');
  }

  const csp = rootResponse.headers.get('content-security-policy') || '';
  if (!csp || csp.includes("'unsafe-inline'")) {
    throw new Error('CSP header missing or contains unsafe-inline');
  }

  console.log('Smoke test passed: server booted, /health returned 200, / served HTML, CSP header valid.');
} catch (error) {
  const logs = getLogs();
  console.error('Smoke test failed:', error.message);
  if (logs.stdout.trim()) {
    console.error('Server stdout:\n', logs.stdout);
  }
  if (logs.stderr.trim()) {
    console.error('Server stderr:\n', logs.stderr);
  }
  process.exitCode = 1;
} finally {
  await stopServer(child);
}
