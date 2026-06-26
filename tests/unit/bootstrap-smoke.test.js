/**
 * Bootstrap smoke tests
 * @description Guards the "blank page on prod" failure class. main.js,
 * page-ready.js and runtime-bootstrap.js had zero coverage despite being the
 * critical path that wires the app together. brandRoute URL-param validation
 * is intentionally covered by Playwright (requires real navigation); here we
 * assert the observable post-bootstrap state.
 */
import { jest } from '@jest/globals';

const AgroBridgeApp = await global.loadAgroBridgeModules();
await import('../../public_html/scripts/runtime-bootstrap.js');
await import('../../public_html/scripts/page-ready.js');
await import('../../public_html/scripts/main.js');

describe('main.js bootstrap', () => {
  beforeEach(() => {
    global.testUtils.createMockDOM();
    delete window.agroBridgeApp;
  });

  test('constructs the app on DOMContentLoaded (prevents blank page)', () => {
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(window.agroBridgeApp).toBeInstanceOf(AgroBridgeApp);
  });

  test('the bootstrapped app is fully initialized', () => {
    document.dispatchEvent(new Event('DOMContentLoaded'));
    const app = window.agroBridgeApp;
    expect(app.currentLang).toBe('es');
    expect(app.apiBase).toMatch(/\/v2$/);
    expect(app.RATE_LIMIT_MS).toBe(500);
    expect(typeof app.destroy).toBe('function');
  });

  test('tracks global error and unhandledrejection listeners', () => {
    document.dispatchEvent(new Event('DOMContentLoaded'));
    const events = window.agroBridgeApp._elementHandlers.map(h => h.event);
    expect(events).toContain('error');
    expect(events).toContain('unhandledrejection');
  });

  test('destroy() tears down tracked listeners without throwing', () => {
    document.dispatchEvent(new Event('DOMContentLoaded'));
    const app = window.agroBridgeApp;
    expect(() => app.destroy()).not.toThrow();
  });
});

describe('page-ready.js', () => {
  beforeEach(() => {
    global.testUtils.createMockDOM();
  });

  test('adds the ready class to #body-main on DOMContentLoaded', () => {
    const body = document.getElementById('body-main');
    expect(body.classList.contains('ready')).toBe(false);
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(body.classList.contains('ready')).toBe(true);
  });

  test('is a safe no-op when #body-main is absent', () => {
    document.getElementById('body-main').remove();
    expect(() => document.dispatchEvent(new Event('DOMContentLoaded'))).not.toThrow();
  });
});

describe('runtime-bootstrap.js config', () => {
  test('sets a valid data-brand-route on the <html> element', () => {
    const route = document.documentElement.getAttribute('data-brand-route');
    expect(['institutional-tech', 'editorial-luxury', 'agro-heritage-modern']).toContain(route);
  });

  test('builds AGROBRIDGE_CONFIG with keys downstream scripts depend on', () => {
    const cfg = window.AGROBRIDGE_CONFIG;
    expect(cfg).toBeDefined();
    expect(cfg.apiBase).toMatch(/\/v2$/);
    expect(cfg).toHaveProperty('useDemo');
    expect(cfg).toHaveProperty('recaptchaSiteKey');
    expect(cfg).toHaveProperty('sentryDsn');
    expect(cfg).toHaveProperty('release');
  });

  test('installs a Sentry fallback stub when no real Sentry is present', () => {
    expect(window.Sentry).toBeDefined();
    expect(typeof window.Sentry.captureException).toBe('function');
    expect(typeof window.Sentry.captureMessage).toBe('function');
    expect(typeof window.Sentry.init).toBe('function');
  });

  test('Sentry fallback captureException is a safe no-op', () => {
    expect(() => window.Sentry.captureException(new Error('boom'))).not.toThrow();
  });
});
