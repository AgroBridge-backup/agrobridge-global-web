/**
 * Legal pages compliance smoke
 * @description The four legal pages (privacidad/terminos/cookies/datos) are the
 * repo's compliance surface and previously had zero structural tests. A blank or
 * broken legal page is a legal exposure. These assertions lock the required
 * scaffold so regressions are caught at CI.
 */
import fs from 'fs';
import path from 'path';

const legalDir = path.resolve(process.cwd(), 'public_html/legal');

const LEGAL_PAGES = [
  { file: 'privacidad.html', topic: /privacidad/i },
  { file: 'terminos.html', topic: /términos|terminos/i },
  { file: 'cookies.html', topic: /cookies/i },
  { file: 'datos.html', topic: /datos/i }
];

const REQUIRED_MARKS = [
  /<main[\s>]/i,
  /<h1[\s>]/i,
  /scripts\/legal-core\.js/,
  /scripts\/legal-consent\.js/,
  /styles\/legal-base\.css/,
  /charset=/i,
  /<html\s+lang="es"/i
];

describe('legal pages compliance scaffold', () => {
  test.each(LEGAL_PAGES.map(p => [p.file, p.topic]))(
    '%s exists and declares its topic in <title>',
    (file, topic) => {
      const fullPath = path.join(legalDir, file);
      expect(fs.existsSync(fullPath)).toBe(true);
      const html = fs.readFileSync(fullPath, 'utf8');
      const title = html.match(/<title>([\s\S]*?)<\/title>/i);
      expect(title).not.toBeNull();
      expect(title[1]).toMatch(topic);
    }
  );

  test.each(LEGAL_PAGES.map(p => p.file))('%s contains every required structural mark', (file) => {
    const html = fs.readFileSync(path.join(legalDir, file), 'utf8');
    for (const re of REQUIRED_MARKS) {
      expect(html).toMatch(re);
    }
  });

  test('every legal page loads the consent manager (privacy enforcement)', () => {
    for (const { file } of LEGAL_PAGES) {
      const html = fs.readFileSync(path.join(legalDir, file), 'utf8');
      expect(html).toContain('scripts/legal-consent.js');
    }
  });
});
