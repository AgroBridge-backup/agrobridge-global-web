/**
 * Legal consent manager smoke tests
 * @description CookieConsentManager (legal-consent.js) is shared by the main
 * site and legal pages and persists GDPR/LFPDPPP consent. It had zero coverage
 * despite being privacy-critical. These tests lock the consent lifecycle
 * (accept/reject/customize/persist/hasConsent/expiry).
 */
import { jest } from '@jest/globals';

await import('../../public_html/scripts/utils.js');
await import('../../public_html/scripts/legal-consent.js');

const CookieConsentManager = window.cookieConsentManager.constructor;

describe('CookieConsentManager', () => {
  let manager;

  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    document.body.innerHTML = '';
    manager = new CookieConsentManager();
  });

  afterEach(() => {
    manager.destroy();
    jest.useRealTimers();
  });

  test('starts with no consent recorded', () => {
    expect(manager.consent).toBeNull();
    expect(manager.hasConsent('analytics')).toBe(false);
    expect(manager.hasConsent('essential')).toBe(false);
  });

  test('acceptAll persists every category to localStorage', () => {
    manager.acceptAll();
    const stored = JSON.parse(localStorage.getItem('agrobridge_consent_v1'));
    expect(stored.preferences).toEqual({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true
    });
    expect(manager.hasConsent('analytics')).toBe(true);
    expect(manager.hasConsent('marketing')).toBe(true);
  });

  test('rejectOptional persists essential-only and disables analytics', () => {
    manager.rejectOptional();
    const stored = JSON.parse(localStorage.getItem('agrobridge_consent_v1'));
    expect(stored.preferences).toEqual({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false
    });
    expect(manager.hasConsent('analytics')).toBe(false);
    expect(manager.hasConsent('essential')).toBe(true);
  });

  test('customize always forces essential=true even when caller disables it', () => {
    manager.customize({ essential: false, analytics: true, functional: false, marketing: false });
    const stored = JSON.parse(localStorage.getItem('agrobridge_consent_v1'));
    expect(stored.preferences.essential).toBe(true);
    expect(stored.preferences.analytics).toBe(true);
  });

  test('consent persists across instances (loaded on next construction)', () => {
    manager.acceptAll();
    const fresh = new CookieConsentManager();
    expect(fresh.hasConsent('analytics')).toBe(true);
    expect(fresh.isConsentExpired()).toBe(false);
    fresh.destroy();
  });

  test('isConsentExpired is true when there is no consent', () => {
    expect(manager.isConsentExpired()).toBe(true);
  });

  test('isConsentExpired is false immediately after accepting', () => {
    manager.acceptAll();
    expect(manager.isConsentExpired()).toBe(false);
  });

  test('hasConsent returns false for an unknown category even after acceptAll', () => {
    manager.acceptAll();
    expect(manager.hasConsent('nonexistent')).toBe(false);
  });

  test('getStatus reflects current state before and after consent', () => {
    expect(manager.getStatus().hasConsent).toBe(false);
    manager.acceptAll();
    const status = manager.getStatus();
    expect(status.hasConsent).toBe(true);
    expect(status.preferences.analytics).toBe(true);
    expect(status.version).toBe(manager.VERSION);
  });

  test('saving consent sets the server-side cookie', () => {
    manager.acceptAll();
    expect(document.cookie).toContain('agrobridge_consent=');
  });
});
