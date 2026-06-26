/**
 * Unit Tests for AgroBridgeUtils pure helpers
 * @description Targeted coverage for debounce/throttle (timing) and escapeHtml
 * (XSS) edge cases. These are high-reuse primitives; regressions are high blast-radius.
 */
import { jest } from '@jest/globals';

await import('../../public_html/scripts/utils.js');
const utils = window.AgroBridgeUtils;

describe('AgroBridgeUtils.debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('does not invoke the wrapped function synchronously', () => {
    const fn = jest.fn();
    utils.debounce(fn, 100)();
    expect(fn).not.toHaveBeenCalled();
  });

  test('invokes once after the wait window elapses', () => {
    const fn = jest.fn();
    utils.debounce(fn, 100)();
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('coalesces rapid calls into a single trailing invocation with the last args', () => {
    const fn = jest.fn();
    const d = utils.debounce(fn, 100);
    d('a'); d('b'); d('c');
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  test('forwards all arguments to the wrapped function', () => {
    const fn = jest.fn();
    utils.debounce(fn, 50)(1, 2, 3);
    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledWith(1, 2, 3);
  });

  test('reschedules on every call (does not fire mid-stream)', () => {
    const fn = jest.fn();
    const d = utils.debounce(fn, 100);
    d();
    jest.advanceTimersByTime(90);
    d();
    jest.advanceTimersByTime(90);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(20);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('AgroBridgeUtils.throttle', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('invokes immediately on the first call (leading edge)', () => {
    const fn = jest.fn();
    utils.throttle(fn, 100)();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('suppresses subsequent calls within the limit window', () => {
    const fn = jest.fn();
    const t = utils.throttle(fn, 100);
    t(); t(); t();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('allows another call after the limit window elapses', () => {
    const fn = jest.fn();
    const t = utils.throttle(fn, 100);
    t();
    jest.advanceTimersByTime(100);
    t();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('forwards arguments on the leading call', () => {
    const fn = jest.fn();
    utils.throttle(fn, 100)('x', 'y');
    expect(fn).toHaveBeenCalledWith('x', 'y');
  });
});

describe('AgroBridgeUtils.escapeHtml edge cases', () => {
  test('returns empty string for null', () => {
    expect(utils.escapeHtml(null)).toBe('');
  });

  test('returns empty string for undefined', () => {
    expect(utils.escapeHtml(undefined)).toBe('');
  });

  test('returns empty string for non-string input (number)', () => {
    expect(utils.escapeHtml(42)).toBe('');
  });

  test('returns empty string for non-string input (object)', () => {
    expect(utils.escapeHtml({ evil: true })).toBe('');
  });

  test('returns empty string for empty input', () => {
    expect(utils.escapeHtml('')).toBe('');
  });

  test('escapes backtick', () => {
    expect(utils.escapeHtml('`cmd`')).toBe('&#x60;cmd&#x60;');
  });

  test('escapes equals sign', () => {
    expect(utils.escapeHtml('a=b')).toBe('a&#x3D;b');
  });

  test('neutralizes a realistic XSS payload in a single pass', () => {
    const payload = '<img src=x onerror="alert(1)">';
    expect(utils.escapeHtml(payload))
      .toBe('&lt;img src&#x3D;x onerror&#x3D;&quot;alert(1)&quot;&gt;');
  });

  test('leaves safe text untouched', () => {
    expect(utils.escapeHtml('Lote AVO-2024-001 verificado')).toBe('Lote AVO-2024-001 verificado');
  });
});
