import fs from 'node:fs';
import path from 'node:path';
import { cspHeaderValue } from '../../src/config/csp.js';

describe('CSP parity between Express and Netlify headers', () => {
  test('CSP config does not allow unsafe-inline', () => {
    expect(cspHeaderValue).not.toContain("'unsafe-inline'");
  });

  test('Netlify _headers CSP matches runtime CSP value', () => {
    const headersPath = path.resolve(process.cwd(), 'public_html/_headers');
    const headersFile = fs.readFileSync(headersPath, 'utf8');
    const cspMatch = headersFile.match(/Content-Security-Policy:\s*(.+)/);

    expect(cspMatch).toBeTruthy();
    const netlifyCsp = cspMatch[1].trim();

    expect(netlifyCsp).toBe(cspHeaderValue);
  });
});
