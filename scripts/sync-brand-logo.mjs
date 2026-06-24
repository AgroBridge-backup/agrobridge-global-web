/**
 * sync-brand-logo.mjs
 *
 * Single source of truth for brand logo markup across all pages.
 *
 * WHY: 16 logo <img> blocks were duplicated across 6 HTML files. Any change
 *      to the logo markup required 6 coordinated manual edits → regression risk.
 *      This script eliminates that class of bug by regenerating blocks from
 *      canonical templates.
 *
 * HOW: Each logo block has a unique anchor (opening tag) and a regex pattern.
 *      The script replaces the matched block with the canonical version, then
 *      writes the file only if content changed (idempotent).
 *
 * USAGE:
 *   node scripts/sync-brand-logo.mjs           # sync (writes if needed)
 *   node scripts/sync-brand-logo.mjs --check   # CI mode: exit 1 if out of sync
 *
 * EXIT CODES:
 *   0  in sync (no changes needed)
 *   1  changes made (or --check failed: out of sync)
 *   2  error
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');

/**
 * Canonical logo <img> markup. Single source of truth.
 * Asset paths are parameterized via `p` (e.g. 'assets' or '../assets').
 * Output is deterministic to keep diffs minimal.
 */
const TEMPLATES = {
  nav: (p) => `<a href="#inicio" class="nav__logo">
                    <img src="${p}/images/logo-48.png"
                         srcset="${p}/images/logo-48.png 1x, ${p}/images/logo-64.png 1.5x, ${p}/images/logo-96.png 2x"
                         width="48" height="45"
                         alt=""
                         aria-hidden="true"
                         class="nav__logo-img"
                         decoding="async"
                         loading="eager">
                    <span class="nav__logo-text">Agro<span class="nav__logo-accent">Bridge</span></span>
                </a>`,

  legalHeader: (p) => `<a href="/" class="legal-header__logo">
                <img src="${p}/images/logo-32.png"
                     srcset="${p}/images/logo-32.png 1x, ${p}/images/logo-48.png 1.5x, ${p}/images/logo-64.png 2x"
                     width="32" height="30"
                     alt=""
                     aria-hidden="true"
                     class="legal-header__logo-img"
                     decoding="async">
                <span>AgroBridge <span class="text-gold-brand">ZTD</span></span>
            </a>`,

  legalFooter: (p) => `<a href="/" class="legal-footer__logo">
                        <img src="${p}/images/logo-48.png"
                             srcset="${p}/images/logo-48.png 1x, ${p}/images/logo-64.png 1.5x, ${p}/images/logo-96.png 2x"
                             width="40" height="38"
                             alt=""
                             aria-hidden="true"
                             class="legal-footer__logo-img"
                             decoding="async">
                        <span>AgroBridge ZTD</span>
                    </a>`,

  printHeader: (p) => `<div class="print-header__logo">
            <img src="${p}/images/logo-64.png" width="32" height="30" alt="" class="print-header__logo-img" decoding="async" loading="lazy">
            AgroBridge ZTD
        </div>`,
};

/**
 * Regex matchers. Anchored on stable opening tag + class name.
 * Use [\\s\\S]*? for non-greedy multiline match up to closing tag.
 */
const MATCHERS = {
  nav: /<a href="#inicio" class="nav__logo">[\s\S]*?<\/a>/,
  legalHeader: /<a href="\/" class="legal-header__logo">[\s\S]*?<\/a>/,
  legalFooter: /<a href="\/" class="legal-footer__logo">[\s\S]*?<\/a>/,
  printHeader: /<div class="print-header__logo">[\s\S]*?<\/div>/,
};

const LEGAL_FILES = [
  'public_html/legal/privacidad.html',
  'public_html/legal/terminos.html',
  'public_html/legal/cookies.html',
  'public_html/legal/datos.html',
  'public_html/legal/_template.html',
];

const TARGETS = [
  { file: 'public_html/index.html', prefix: 'assets', blocks: ['nav'] },
  ...LEGAL_FILES.map((file) => ({
    file,
    prefix: '../assets',
    blocks: ['legalHeader', 'legalFooter', 'printHeader'],
  })),
];

function syncFile({ file, prefix, blocks }) {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) {
    return { file, skipped: 'file not found' };
  }
  const original = fs.readFileSync(abs, 'utf8');
  let updated = original;
  const changes = [];

  for (const key of blocks) {
    const matcher = MATCHERS[key];
    const template = TEMPLATES[key](prefix);
    const before = updated;
    updated = updated.replace(matcher, template);
    if (updated !== before) {
      // Verify only one replacement happened (matcher is non-global)
      changes.push(key);
    } else {
      // Check if matcher would have matched at all
      if (!matcher.test(original)) {
        return { file, error: `pattern "${key}" not found` };
      }
    }
  }

  if (updated !== original) {
    if (!CHECK_ONLY) fs.writeFileSync(abs, updated, 'utf8');
    return { file, changes };
  }
  return { file, inSync: true };
}

function main() {
  let outOfSync = 0;
  let errors = 0;
  const results = TARGETS.map(syncFile);

  for (const r of results) {
    if (r.error) {
      errors++;
      console.error(`  ✗ ${r.file}: ${r.error}`);
    } else if (r.skipped) {
      console.error(`  - ${r.file}: ${r.skipped}`);
    } else if (r.inSync) {
      console.log(`  ✓ ${r.file} (in sync)`);
    } else {
      outOfSync++;
      console.log(`  ${CHECK_ONLY ? '✗' : '↻'} ${r.file}: ${r.changes.join(', ')} ${CHECK_ONLY ? 'out of sync' : 'updated'}`);
    }
  }

  console.log('');
  if (errors > 0) {
    console.error(`Failed: ${errors} error(s).`);
    process.exit(2);
  }
  if (outOfSync > 0) {
    console.log(`${outOfSync} file(s) ${CHECK_ONLY ? 'out of sync — run: node scripts/sync-brand-logo.mjs' : 'synced'}.`);
    process.exit(1);
  }
  console.log('All brand logo blocks in sync.');
  process.exit(0);
}

main();
