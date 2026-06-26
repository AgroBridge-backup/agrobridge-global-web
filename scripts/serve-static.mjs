/**
 * Zero-dependency static file server for the AgroBridge frontend.
 *
 * Used by Playwright (playwright.config.js webServer) so E2E can run against
 * a local build WITHOUT booting Express and its required secrets. The frontend
 * is fully static, so this is sufficient for smoke + visual E2E.
 *
 * Usage: node scripts/serve-static.mjs   (PORT env, default 3000)
 */
import http from 'http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', 'public_html');
const PORT = parseInt(process.env.PORT || '3000', 10);

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.pdf': 'application/pdf'
};

function resolveSafe(requestPath) {
  const decoded = decodeURIComponent(requestPath.split('?')[0]);
  const resolved = path.resolve(ROOT, '.' + decoded);
  // Prevent path traversal outside public_html/
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    return null;
  }
  return resolved;
}

const server = http.createServer((req, res) => {
  const safePath = resolveSafe(req.url);
  if (!safePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.promises.stat(safePath).then(stat => {
    let filePath = safePath;
    if (stat.isDirectory()) {
      filePath = path.join(safePath, 'index.html');
    }
    return fs.promises.readFile(filePath).then(data => {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': CONTENT_TYPES[ext] || 'application/octet-stream' });
      res.end(data);
    });
  }).catch(() => {
    // SPA-style fallback for unknown files (keeps deep links working)
    const fallback = path.join(ROOT, 'index.html');
    fs.promises.readFile(fallback).then(data => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    }).catch(() => {
      res.writeHead(404);
      res.end('Not Found');
    });
  });
});

server.listen(PORT, () => {
  console.log(`[serve-static] public_html/ serving on http://localhost:${PORT}`);
});

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => {
    server.close(() => process.exit(0));
  });
}
