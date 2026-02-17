import fs from 'fs';
import path from 'path';

const indexPath = path.resolve(process.cwd(), 'public_html/index.html');

describe('index.html bootstrap contract', () => {
  test('loads main.js after app.js', () => {
    const html = fs.readFileSync(indexPath, 'utf8');
    const appScriptIndex = html.indexOf('scripts/app.js');
    const mainScriptIndex = html.indexOf('scripts/main.js');

    expect(appScriptIndex).toBeGreaterThan(-1);
    expect(mainScriptIndex).toBeGreaterThan(-1);
    expect(mainScriptIndex).toBeGreaterThan(appScriptIndex);
  });

  test('loads runtime bootstrap scripts from external files', () => {
    const html = fs.readFileSync(indexPath, 'utf8');
    expect(html).toContain('scripts/runtime-bootstrap.js');
    expect(html).toContain('scripts/web-vitals.js');
    expect(html).toContain('scripts/page-ready.js');
    expect(html).not.toContain('function applyRuntimeDefaults()');
    expect(html).not.toContain('<style>/* SISTEMA DE DISENO AGROBRIDGE');
  });
});
