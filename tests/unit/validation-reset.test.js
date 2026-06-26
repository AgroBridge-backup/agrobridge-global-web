/**
 * Unit Tests for validation reset flow
 * @description Covers resetValidation() + initResetButton() (validation.js),
 * which previously had zero coverage despite being user-facing (mutates DOM
 * state across 8+ nodes and wires the reset button).
 */
import { jest } from '@jest/globals';

const AgroBridgeApp = await global.loadAgroBridgeModules();

describe('resetValidation', () => {
  let app;

  beforeEach(() => {
    global.testUtils.createMockDOM();
    app = new AgroBridgeApp();
    app._construct();
  });

  test('clears the lot code input value', () => {
    const input = document.getElementById('search-input');
    input.value = 'AVO-2024-001';
    app.resetValidation();
    expect(input.value).toBe('');
  });

  test('resets aria-invalid to false on the input', () => {
    const input = document.getElementById('search-input');
    input.setAttribute('aria-invalid', 'true');
    app.resetValidation();
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  test('removes aria-busy from the input', () => {
    const input = document.getElementById('search-input');
    input.setAttribute('aria-busy', 'true');
    app.resetValidation();
    expect(input.hasAttribute('aria-busy')).toBe(false);
  });

  test('hides the results container and marks it aria-hidden', () => {
    const results = document.getElementById('validation-results');
    results.classList.add('active');
    app.resetValidation();
    expect(results.classList.contains('active')).toBe(false);
    expect(results.getAttribute('aria-hidden')).toBe('true');
  });

  test('resets the status indicator to the ready state', () => {
    const indicator = document.getElementById('status-indicator');
    indicator.className = 'status-indicator status-indicator--error';
    app.resetValidation();
    expect(indicator.className).toContain('status-indicator--ready');
  });

  test('clears the error message container', () => {
    const errorDiv = document.getElementById('search-error');
    errorDiv.innerHTML = '<p>something went wrong</p>';
    app.resetValidation();
    expect(errorDiv.innerHTML).toBe('');
  });

  test('clears the details container', () => {
    const details = document.getElementById('validation-details-container');
    details.innerHTML = '<div class="detail-row">x</div>';
    app.resetValidation();
    expect(details.innerHTML).toBe('');
  });

  test('sets the status text to the localized ready message', () => {
    const statusText = document.getElementById('status-text');
    app.resetValidation();
    expect(statusText.textContent).toBe('Listo para verificar');
  });

  test('does not throw when optional nodes (time-verified, validation-card-v2) are absent', () => {
    expect(() => app.resetValidation()).not.toThrow();
  });

  test('falls back to #validation-input when #search-input is absent', () => {
    document.getElementById('search-input').remove();
    const validationInput = document.getElementById('validation-input');
    validationInput.value = 'leftover-code';
    app.resetValidation();
    expect(validationInput.value).toBe('');
  });

  test('focuses the input after reset', () => {
    const input = document.getElementById('search-input');
    const focusSpy = jest.spyOn(input, 'focus');
    app.resetValidation();
    expect(focusSpy).toHaveBeenCalledTimes(1);
  });
});

describe('initResetButton', () => {
  test('wires #reset-validation-btn click to reset the form', () => {
    global.testUtils.createMockDOM();
    const btn = document.createElement('button');
    btn.id = 'reset-validation-btn';
    document.body.appendChild(btn);

    const app = new AgroBridgeApp();
    app._construct();

    const input = document.getElementById('search-input');
    input.value = 'AVO-2025-099';
    btn.click();
    expect(input.value).toBe('');
  });

  test('is a safe no-op when #reset-validation-btn is absent', () => {
    global.testUtils.createMockDOM();
    expect(() => {
      const app = new AgroBridgeApp();
      app._construct();
    }).not.toThrow();
  });
});
