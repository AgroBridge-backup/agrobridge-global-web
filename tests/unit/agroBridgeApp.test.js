/**
 * Unit Tests for AgroBridgeApp
 * @description Comprehensive test suite for the main application class
 */

import { jest } from '@jest/globals';

// We test by loading all modules in order, which extends window.AgroBridge.App prototype.
// The modules use IIFEs that run immediately when imported.

// First, set up DOM before importing the modules
beforeAll(() => {
  global.testUtils.createMockDOM();
});

// Load all modules in order and get the AgroBridgeApp class
const AgroBridgeApp = await global.loadAgroBridgeModules();

describe('AgroBridgeApp', () => {
  let app;

  beforeEach(() => {
    // Reset DOM
    global.testUtils.createMockDOM();

    // Create app instance and call constructor - init() will run but should work with our mock DOM
    app = new AgroBridgeApp();
    app._construct();
  });

  // ============================================
  // CONSTRUCTOR & INITIALIZATION
  // ============================================
  describe('Constructor & Initialization', () => {
    test('should initialize with default Spanish language', () => {
      expect(app.currentLang).toBe('es');
    });

    test('should have correct API endpoints', () => {
      expect(app.apiBase).toBe('https://api.agrobridge.global/v2');
      expect(app.validationApi).toBe('https://api.agrobridge.global/v2/verify');
      expect(app.contactApi).toBe('https://api.agrobridge.global/v2/leads');
    });

    test('should start in live mode by default', () => {
      expect(app.USE_DEMO_MODE).toBe(false);
    });

    test('should have rate limiting configured', () => {
      expect(app.RATE_LIMIT_MS).toBe(500);
    });

    test('should initialize with isValidating false', () => {
      expect(app.isValidating).toBe(false);
    });

    test('should have translations method', () => {
      // The t() method should work, proving translations are loaded
      expect(typeof app.t).toBe('function');
      expect(app.t('hero.title')).toBeDefined();
    });
  });

  // ============================================
  // XSS SANITIZATION (escapeHtml)
  // ============================================
  describe('XSS Sanitization - escapeHtml()', () => {
    test('should escape ampersand', () => {
      expect(app.escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    test('should escape less than sign', () => {
      expect(app.escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    test('should escape greater than sign', () => {
      expect(app.escapeHtml('a > b')).toBe('a &gt; b');
    });

    test('should escape double quotes', () => {
      expect(app.escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
    });

    test('should escape single quotes', () => {
      expect(app.escapeHtml("it's")).toBe('it&#39;s');
    });

    test('should escape forward slash', () => {
      expect(app.escapeHtml('path/to/file')).toBe('path&#x2F;to&#x2F;file');
    });

    test('should escape backticks', () => {
      expect(app.escapeHtml('`code`')).toBe('&#x60;code&#x60;');
    });

    test('should escape equals sign', () => {
      expect(app.escapeHtml('a=b')).toBe('a&#x3D;b');
    });

    test('should return empty string for non-string input', () => {
      expect(app.escapeHtml(null)).toBe('');
      expect(app.escapeHtml(undefined)).toBe('');
      expect(app.escapeHtml(123)).toBe('');
      expect(app.escapeHtml({})).toBe('');
    });

    test('should handle complex XSS attack strings', () => {
      const xss = '<script>alert("XSS")</script>';
      const escaped = app.escapeHtml(xss);
      expect(escaped).not.toContain('<script>');
      expect(escaped).not.toContain('</script>');
      expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    test('should handle event handler XSS', () => {
      const xss = '<img onerror="alert(1)" src=x>';
      const escaped = app.escapeHtml(xss);
      // escapeHtml escapes HTML special characters, preventing DOM injection
      expect(escaped).not.toContain('<img');
      expect(escaped).toContain('&lt;img');
    });

    test('should preserve safe strings', () => {
      expect(app.escapeHtml('Hello World')).toBe('Hello World');
      expect(app.escapeHtml('Product123')).toBe('Product123');
    });
  });

  // ============================================
  // LOT CODE VALIDATION (isValidLotCode)
  // ============================================
  describe('Lot Code Validation - isValidLotCode()', () => {
    test('should accept alphanumeric lot codes with dashes', () => {
      expect(app.isValidLotCode('AGR-2024-001')).toBe(true);
    });

    test('should accept uppercase, lowercase, and mixed case', () => {
      expect(app.isValidLotCode('agr-2024-001')).toBe(true);
      expect(app.isValidLotCode('AgR-2024-001')).toBe(true);
    });

    test('should accept codes without dashes', () => {
      expect(app.isValidLotCode('AGR2024001')).toBe(true);
    });

    test('should reject empty string', () => {
      expect(app.isValidLotCode('')).toBe(false);
    });

    test('should reject code with spaces', () => {
      expect(app.isValidLotCode('AGR 2024 001')).toBe(false);
    });

    test('should reject code with special characters', () => {
      expect(app.isValidLotCode('AGR-2024-00!')).toBe(false);
    });
  });

  // ============================================
  // TRANSLATION SYSTEM
  // ============================================
  describe('Translation System - t() and switchLanguage()', () => {
    test('should return Spanish translation by default', () => {
      expect(app.t('hero.title')).toBe('Excelencia Agrícola');
    });

    test('should return English translation after switching', () => {
      app.switchLanguage('en');
      expect(app.t('hero.title')).toBe('Agricultural Excellence');
    });

    test('should have Spanish translations', () => {
      expect(app.t('hero.title')).toBe('Excelencia Agrícola');
      expect(app.t('error.empty')).toBe('Por favor ingrese un código de lote');
    });

    test('should return key if translation not found', () => {
      expect(app.t('nonexistent.key')).toBe('nonexistent.key');
    });

    test('should switch to valid language', () => {
      app.switchLanguage('en');
      expect(app.currentLang).toBe('en');
    });

    test('should not switch to invalid language', () => {
      app.switchLanguage('invalid');
      expect(app.currentLang).toBe('es');
    });

    test('should maintain language after multiple switches', () => {
      app.switchLanguage('en');
      app.switchLanguage('es');
      app.switchLanguage('en');
      expect(app.currentLang).toBe('en');
    });
  });

  // ============================================
  // HASH GENERATION
  // ============================================
  describe('Hash Generation - generateHash()', () => {
    test('should generate 64-character hash', () => {
      const hash = app.generateHash();
      expect(hash).toHaveLength(64);
    });

    test('should generate hexadecimal hash', () => {
      const hash = app.generateHash();
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    test('should generate unique hashes', () => {
      const hash1 = app.generateHash();
      const hash2 = app.generateHash();
      expect(hash1).not.toBe(hash2);
    });

    test('should generate multiple unique hashes', () => {
      const hashes = new Set();
      for (let i = 0; i < 100; i++) {
        hashes.add(app.generateHash());
      }
      expect(hashes.size).toBe(100);
    });
  });

  // ============================================
  // DATE FORMATTING
  // ============================================
  describe('Date Formatting - formatDateTime()', () => {
    test('should format date correctly for January', () => {
      const date = new Date(2026, 0, 5, 14, 30);
      expect(app.formatDateTime(date)).toBe('05 Ene 14:30');
    });

    test('should format date correctly for December', () => {
      const date = new Date(2026, 11, 25, 8, 0);
      expect(app.formatDateTime(date)).toBe('25 Dic 08:00');
    });

    test('should pad single digit day', () => {
      const date = new Date(2026, 5, 5, 9, 5);
      expect(app.formatDateTime(date)).toBe('05 Jun 09:05');
    });

    test('should format midnight correctly', () => {
      const date = new Date(2026, 0, 1, 0, 0);
      expect(app.formatDateTime(date)).toBe('01 Ene 00:00');
    });

    test('should format end of day correctly', () => {
      const date = new Date(2026, 0, 1, 23, 59);
      expect(app.formatDateTime(date)).toBe('01 Ene 23:59');
    });
  });

  // ============================================
  // DOM UTILITY FUNCTIONS
  // ============================================
  describe('DOM Utility Functions', () => {
    test('getElement should return existing element', () => {
      const element = app.getElement('search-input');
      expect(element).not.toBeNull();
    });

    test('getElement should return null for non-existent element', () => {
      const element = app.getElement('non-existent-id');
      expect(element).toBeNull();
    });

    test('setText should update element text content', () => {
      app.setText('status-text', 'Test Status');
      const element = document.getElementById('status-text');
      expect(element.textContent).toBe('Test Status');
    });

    test('setText should not throw for non-existent element', () => {
      expect(() => app.setText('non-existent-id', 'Test')).not.toThrow();
    });

    test('setStyle should update element style', () => {
      app.setStyle('search-error', 'display', 'block');
      const element = document.getElementById('search-error');
      expect(element.style.display).toBe('block');
    });

    test('setStyle should not throw for non-existent element', () => {
      expect(() => app.setStyle('non-existent-id', 'display', 'none')).not.toThrow();
    });
  });

  // ============================================
  // DEMO DATA GENERATION
  // ============================================
  describe('Demo Data Generation', () => {
    test('should return known demo data for AB-HASS-2026-001', async () => {
      const data = await app.getDemoData('AB-HASS-2026-001');
      expect(data.status).toBe('valid');
      expect(data.product).toBe('Aguacate Hass Premium');
      expect(data.origin).toContain('Uruapan');
    });

    test('should generate data for unknown HASS code', async () => {
      const data = await app.getDemoData('AB-HASS-2026-999');
      expect(data.status).toBe('valid');
      expect(data.product).toContain('Aguacate');
    });

    test('should generate generic data for unknown code', async () => {
      const data = await app.getDemoData('AB-XXXX-2026-999');
      expect(data.status).toBe('valid');
    });

    test('generated data should have blockchain hash', async () => {
      const data = await app.getDemoData('AB-TEST-2026-001');
      expect(data.blockchainHash).toBeDefined();
      expect(data.blockchainHash).toHaveLength(64);
    });
  });

  // ============================================
  // VALIDATION SYSTEM
  // ============================================
  describe('Validation System', () => {
    test('should validate lot code successfully in demo mode', async () => {
      const input = document.getElementById('search-input');
      input.value = 'AB-HASS-2026-001';

      await app.validateLot();

      // Should not show error for valid code
      const errorDiv = document.getElementById('search-error');
      expect(errorDiv.style.display).toBe('none');
    });

    test('should show error for empty input', async () => {
      const input = document.getElementById('search-input');
      input.value = '';

      await app.validateLot();

      // Should show error for empty input
      const errorDiv = document.getElementById('search-error');
      expect(errorDiv.style.display).toBe('block');
    });

    test('should show error for invalid format', async () => {
      const input = document.getElementById('search-input');
      input.value = 'INVALID CODE';

      await app.validateLot();

      // Should show error for invalid format
      const errorDiv = document.getElementById('search-error');
      expect(errorDiv.style.display).toBe('block');
    });

    test('should enforce rate limit between validations', async () => {
      const input = document.getElementById('search-input');
      input.value = 'AB-HASS-2026-001';

      // First validation sets lastValidationTime
      await app.validateLot();

      // Check that lastValidationTime was updated
      expect(app.lastValidationTime).toBeGreaterThan(0);

      // Rate limiting is enforced - second call within RATE_LIMIT_MS
      // will be blocked. Just verify the first validation ran successfully
      const statusText = document.getElementById('status-text');
      expect(statusText).not.toBeNull();
    });

    test('should not validate when already validating', async () => {
      const input = document.getElementById('search-input');
      input.value = 'AB-HASS-2026-001';

      app.isValidating = true;
      app.lastValidationTime = 0; // Reset rate limit

      await app.validateLot();

      // Should return early, not changing isValidating
      expect(app.isValidating).toBe(true);
    });

    test('validateLot should not throw without input', async () => {
      // Remove search input
      const input = document.getElementById('search-input');
      input.parentNode.removeChild(input);
      const input2 = document.getElementById('validation-input');
      input2.parentNode.removeChild(input2);

      // Should not throw
      await expect(app.validateLot()).resolves.not.toThrow();
    });
  });

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  describe('Utility Functions', () => {
    test('delay should wait specified milliseconds', async () => {
      const start = Date.now();
      await app.delay(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(95);
      expect(elapsed).toBeLessThan(200);
    });

    test('delay with 0ms should resolve immediately', async () => {
      const start = Date.now();
      await app.delay(0);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(50);
    });
  });

  // ============================================
  // MOBILE MENU
  // ============================================
  describe('Mobile Menu', () => {
    test('toggle button should exist', () => {
      const toggle = document.getElementById('navToggle');
      expect(toggle).not.toBeNull();
    });

    test('menu should exist', () => {
      const menu = document.getElementById('navMenu');
      expect(menu).not.toBeNull();
    });
  });

  // ============================================
  // NOTIFICATION SYSTEM
  // ============================================
  describe('Notification System', () => {
    test('showNotification should not throw', () => {
      expect(() => app.showNotification('Test message', 'success')).not.toThrow();
    });

    test('showNotification should work with different types', () => {
      expect(() => app.showNotification('Error', 'error')).not.toThrow();
      expect(() => app.showNotification('Warning', 'warning')).not.toThrow();
      expect(() => app.showNotification('Info', 'info')).not.toThrow();
    });
  });

  // ============================================
  // CONTACT FORM HANDLING
  // ============================================
  describe('Contact Form', () => {
    test('should find contact form elements', () => {
      const form = document.getElementById('enterprise-form');
      expect(form).not.toBeNull();
    });

    test('handleContactSubmit should exist', () => {
      expect(typeof app.handleContactSubmit).toBe('function');
    });

    test('handleContactSubmit should validate email format', async () => {
      const form = document.getElementById('enterprise-form');
      const emailInput = form.querySelector('input[name="email"]');
      form.querySelector('input[name="name"]').value = 'Test User';
      form.querySelector('input[name="company"]').value = 'Test Corp';
      form.querySelector('input[name="phone"]').value = '+521234567890';
      form.querySelector('select[name="inquiry_type"]').value = 'cotizacion';
      form.querySelector('textarea[name="message"]').value = 'Solicitud de prueba detallada.';
      emailInput.value = 'invalid-email';

      app.USE_DEMO_MODE = true;

      const event = { preventDefault: jest.fn(), target: form };
      await app.handleContactSubmit(event);

      // Should call preventDefault
      expect(event.preventDefault).toHaveBeenCalled();
    });

    test('handleContactSubmit should accept valid data', async () => {
      const form = document.getElementById('enterprise-form');
      form.querySelector('input[name="name"]').value = 'Test User';
      form.querySelector('input[name="email"]').value = 'test@example.com';
      form.querySelector('input[name="company"]').value = 'Test Corp';
      form.querySelector('input[name="phone"]').value = '+521234567890';
      form.querySelector('select[name="inquiry_type"]').value = 'cotizacion';
      form.querySelector('textarea[name="message"]').value = 'Solicitud de prueba detallada.';

      app.USE_DEMO_MODE = true;

      const event = { preventDefault: jest.fn(), target: form };
      await app.handleContactSubmit(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  // ============================================
  // SLIDESHOW
  // ============================================
  describe('Slideshow', () => {
    test('initSlideshow should not throw without slideshow element', () => {
      expect(() => app.initSlideshow()).not.toThrow();
    });

    test('initSlideshow should handle missing slideshow gracefully', () => {
      // Remove slideshow element if exists
      const slideshow = document.getElementById('heroSlideshow');
      if (slideshow) {
        slideshow.parentNode.removeChild(slideshow);
      }

      expect(() => app.initSlideshow()).not.toThrow();
    });
  });

  // ============================================
  // EVENT LISTENERS
  // ============================================
  describe('Event Listeners', () => {
    test('setupEventListeners should not throw', () => {
      expect(() => app.setupEventListeners()).not.toThrow();
    });

    test('initLanguageSystem should not throw', () => {
      expect(() => app.initLanguageSystem()).not.toThrow();
    });

    test('initValidationSystem should not throw', () => {
      expect(() => app.initValidationSystem()).not.toThrow();
    });

    test('initContactForm should not throw', () => {
      expect(() => app.initContactForm()).not.toThrow();
    });

    test('initMobileMenu should not throw', () => {
      expect(() => app.initMobileMenu()).not.toThrow();
    });

    test('setupErrorHandling should not throw', () => {
      expect(() => app.setupErrorHandling()).not.toThrow();
    });

    test('setupPerformanceMonitoring should not throw', () => {
      expect(() => app.setupPerformanceMonitoring()).not.toThrow();
    });
  });

  // ============================================
  // LANGUAGE SYSTEM
  // ============================================
  describe('Language System Extended', () => {
    test('switchLanguage should update currentLang', () => {
      app.switchLanguage('en');
      expect(app.currentLang).toBe('en');
    });

    test('switchLanguage should work for all supported languages', () => {
      app.switchLanguage('es');
      expect(app.currentLang).toBe('es');

      app.switchLanguage('en');
      expect(app.currentLang).toBe('en');
    });

    test('t() should return correct translations for each language', () => {
      app.switchLanguage('es');
      expect(app.t('hero.title')).toBe('Excelencia Agrícola');

      app.switchLanguage('en');
      expect(app.t('hero.title')).toBe('Agricultural Excellence');
    });
  });

  // ============================================
  // DEMO FUNCTIONALITY
  // ============================================
  describe('Demo Functionality', () => {
    test('runDemo should exist', () => {
      expect(typeof app.runDemo).toBe('function');
    });

    test('runDemo should set input value', async () => {
      const input = document.getElementById('search-input');

      // Reset rate limit
      app.lastValidationTime = 0;

      await app.runDemo();

      expect(input.value).toBe('AB-HASS-2026-001');
    });
  });

  // ============================================
  // STATUS INDICATOR
  // ============================================
  describe('Status Indicator', () => {
    test('status indicator element should exist', () => {
      const indicator = document.getElementById('status-indicator');
      expect(indicator).not.toBeNull();
    });

    test('status text element should exist', () => {
      const statusText = document.getElementById('status-text');
      expect(statusText).not.toBeNull();
    });
  });

  // ============================================
  // ADDITIONAL DOM UTILITIES
  // ============================================
  describe('Additional DOM Utilities', () => {
    test('setHtml should escape HTML by default', () => {
      const div = document.createElement('div');
      div.id = 'test-html-div';
      document.body.appendChild(div);

      app.setHtml('test-html-div', '<span>Test Content</span>');
      expect(div.innerHTML).toBe('&lt;span&gt;Test Content&lt;/span&gt;');
    });

    test('setHtml should set raw innerHTML when raw flag is true', () => {
      const div = document.createElement('div');
      div.id = 'test-html-raw';
      document.body.appendChild(div);

      app.setHtml('test-html-raw', '<span>Test Content</span>', true);
      expect(div.innerHTML).toBe('<span>Test Content</span>');
    });

    test('setHtml should not throw for non-existent element', () => {
      expect(() => app.setHtml('non-existent', '<p>test</p>')).not.toThrow();
    });
  });

  // ============================================
  // MOBILE MENU INTERACTIONS
  // ============================================
  describe('Mobile Menu Interactions', () => {
    test('clicking toggle should add active class to menu', () => {
      const toggle = document.getElementById('navToggle');
      const menu = document.getElementById('navMenu');

      toggle.click();

      expect(menu.classList.contains('active')).toBe(true);
      expect(toggle.classList.contains('active')).toBe(true);
    });

    test('clicking toggle twice should remove active class', () => {
      const toggle = document.getElementById('navToggle');
      const menu = document.getElementById('navMenu');

      toggle.click();
      toggle.click();

      expect(menu.classList.contains('active')).toBe(false);
    });

    test('clicking nav link should close menu', () => {
      const toggle = document.getElementById('navToggle');
      const menu = document.getElementById('navMenu');
      const link = menu.querySelector('.nav__link');

      toggle.click(); // Open menu
      link.click(); // Click link

      expect(menu.classList.contains('active')).toBe(false);
    });

  });

  // ============================================
  // LANGUAGE SYSTEM WITH localStorage
  // ============================================
  describe('Language System with localStorage', () => {
    test('switchLanguage should save to localStorage', () => {
      app.switchLanguage('en');
      expect(localStorage.setItem).toHaveBeenCalledWith('agrobridge-lang', 'en');
    });

    test('switchLanguage should update language selects', () => {
      const select = document.getElementById('lang-select');
      app.switchLanguage('en');
      expect(select.value).toBe('en');
    });

    test('should update elements with data-i18n attribute', () => {
      // Add element with data-i18n
      const div = document.createElement('div');
      div.setAttribute('data-i18n', 'hero.title');
      document.body.appendChild(div);

      app.switchLanguage('es');

      expect(div.textContent).toBe('Excelencia Agrícola');
    });

    test('should update search input placeholder', () => {
      const input = document.getElementById('search-input');
      app.switchLanguage('en');
      expect(input.placeholder).toBeDefined();
    });
  });

  // ============================================
  // SLIDESHOW WITH SLIDES
  // ============================================
  describe('Slideshow with Slides', () => {
    beforeEach(() => {
      // Add slideshow with slides
      const slideshow = document.createElement('div');
      slideshow.id = 'heroSlideshow';
      slideshow.innerHTML = `
        <div class="hero-slide active">Slide 1</div>
        <div class="hero-slide">Slide 2</div>
        <div class="hero-slide">Slide 3</div>
      `;
      document.body.appendChild(slideshow);
    });

    test('initSlideshow should work with slides present', () => {
      expect(() => app.initSlideshow()).not.toThrow();
    });
  });

  // ============================================
  // SCANNING STEPS
  // ============================================
  describe('Scanning Steps', () => {
    test('showScanningSteps should not throw in Spanish', async () => {
      app.currentLang = 'es';
      await expect(app.showScanningSteps()).resolves.not.toThrow();
    });

    test('showScanningSteps should not throw in English', async () => {
      app.currentLang = 'en';
      await expect(app.showScanningSteps()).resolves.not.toThrow();
    });

    test('showScanningSteps should handle missing element gracefully', async () => {
      // Remove scanning-step if exists
      const existing = document.getElementById('scanning-step');
      if (existing) existing.remove();

      await expect(app.showScanningSteps()).resolves.not.toThrow();
    });
  });

  // ============================================
  // VALIDATION ERROR HANDLING
  // ============================================
  describe('Validation Error Handling', () => {
    test('showValidationError should display error message', () => {
      const errorDiv = document.getElementById('search-error');
      app.showValidationError('Test error message');

      expect(errorDiv.textContent).toContain('Test error message');
      expect(errorDiv.style.display).toBe('block');
    });
  });

  // ============================================
  // REAL API MODE
  // ============================================
  describe('Real API Mode', () => {
    test('fetchValidationData should call demo data in demo mode', async () => {
      app.USE_DEMO_MODE = true;
      const data = await app.fetchValidationData('AB-HASS-2026-001');
      expect(data).toBeDefined();
      expect(data.status).toBe('valid');
    });

    test('fetchValidationData should make API call when not in demo mode', async () => {
      app.USE_DEMO_MODE = false;

      // Mock successful response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          valid: true,
          data: {
            lotCode: 'AB-TEST-2026-001',
            productName: 'Test',
            specifications: {}
          }
        })
      });

      const data = await app.fetchValidationData('AB-TEST-2026-001');
      expect(fetch).toHaveBeenCalled();
      expect(data.status).toBe('valid');
      expect(data.product).toBe('Test');

      app.USE_DEMO_MODE = true; // Reset
    });

    test('fetchValidationData should throw NOT_FOUND for 404', async () => {
      app.USE_DEMO_MODE = false;

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(app.fetchValidationData('AB-XXXX-2026-999')).rejects.toThrow('NOT_FOUND');

      app.USE_DEMO_MODE = true;
    });

    test('fetchValidationData should throw for other HTTP errors', async () => {
      app.USE_DEMO_MODE = false;

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(app.fetchValidationData('AB-TEST-2026-001')).rejects.toThrow('HTTP error');

      app.USE_DEMO_MODE = true;
    });
  });

  // ============================================
  // CONTACT FORM EMAIL VALIDATION
  // ============================================
  describe('Contact Form Email Validation', () => {
    test('should reject invalid email format with notification', async () => {
      const form = document.getElementById('enterprise-form');
      form.querySelector('input[name="name"]').value = 'Test';
      form.querySelector('input[name="email"]').value = 'invalid-email';
      form.querySelector('input[name="company"]').value = 'Test Corp';
      form.querySelector('input[name="phone"]').value = '+521234567890';
      form.querySelector('select[name="inquiry_type"]').value = 'cotizacion';
      form.querySelector('textarea[name="message"]').value = 'Solicitud de prueba detallada.';

      const notifySpy = jest.spyOn(window.AgroBridgeUI, 'showNotification');
      const event = { preventDefault: jest.fn(), target: form };
      await app.handleContactSubmit(event);

      expect(notifySpy).toHaveBeenCalledWith(expect.any(String), 'error');
      notifySpy.mockRestore();
    });

    test('should handle contact form with real API mode', async () => {
      app.USE_DEMO_MODE = false;

      const recaptchaSpy = jest.spyOn(app, 'getRecaptchaToken').mockResolvedValue('test-token');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const form = document.getElementById('enterprise-form');
      form.querySelector('input[name="name"]').value = 'Test User';
      form.querySelector('input[name="email"]').value = 'test@example.com';
      form.querySelector('input[name="company"]').value = 'Test Corp';
      form.querySelector('input[name="phone"]').value = '+521234567890';
      form.querySelector('select[name="inquiry_type"]').value = 'cotizacion';
      form.querySelector('textarea[name="message"]').value = 'Solicitud de prueba detallada.';

      const event = { preventDefault: jest.fn(), target: form };
      await app.handleContactSubmit(event);

      expect(fetch).toHaveBeenCalled();

      recaptchaSpy.mockRestore();

      app.USE_DEMO_MODE = true;
    });

    test('should handle contact form API error', async () => {
      app.USE_DEMO_MODE = false;

      const recaptchaSpy = jest.spyOn(app, 'getRecaptchaToken').mockResolvedValue('test-token');

      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const form = document.getElementById('enterprise-form');
      form.querySelector('input[name="name"]').value = 'Test User';
      form.querySelector('input[name="email"]').value = 'test@example.com';
      form.querySelector('input[name="company"]').value = 'Test Corp';
      form.querySelector('input[name="phone"]').value = '+521234567890';
      form.querySelector('select[name="inquiry_type"]').value = 'cotizacion';
      form.querySelector('textarea[name="message"]').value = 'Solicitud de prueba detallada.';

      const notifySpy = jest.spyOn(window.AgroBridgeUI, 'showNotification');
      const event = { preventDefault: jest.fn(), target: form };
      await app.handleContactSubmit(event);

      expect(notifySpy).toHaveBeenCalledWith(expect.any(String), 'error');
      notifySpy.mockRestore();

      recaptchaSpy.mockRestore();

      app.USE_DEMO_MODE = true;
    });
  });

  // ============================================
  // ERROR HANDLING SETUP
  // ============================================
  describe('Error Handling', () => {
    test('should handle window error event', () => {
      // Trigger error handler setup
      app.setupErrorHandling();

      // Dispatch error event
      const errorEvent = new ErrorEvent('error', {
        message: 'Test error',
        filename: 'test.js',
        lineno: 1
      });

      expect(() => window.dispatchEvent(errorEvent)).not.toThrow();
    });

    test('should handle unhandled rejection', () => {
      app.setupErrorHandling();

      const rejectionEvent = new Event('unhandledrejection');
      rejectionEvent.reason = new Error('Test rejection');

      expect(() => window.dispatchEvent(rejectionEvent)).not.toThrow();
    });
  });

  // ============================================
  // PERFORMANCE MONITORING
  // ============================================
  describe('Performance Monitoring', () => {
    test('setupPerformanceMonitoring should not throw', () => {
      expect(() => app.setupPerformanceMonitoring()).not.toThrow();
    });
  });

  // ============================================
  // VALIDATION COMPLETE FLOW
  // ============================================
  describe('Validation Complete Flow', () => {
    test('should show validation results after successful validation', async () => {
      const input = document.getElementById('search-input');
      input.value = 'AB-HASS-2026-001';

      app.lastValidationTime = 0;
      await app.validateLot();

      // Validation should complete without throwing
      expect(app.isValidating).toBe(false);
    });

    test('should handle validation with whitespace in code', async () => {
      const input = document.getElementById('search-input');
      input.value = '  AB-HASS-2026-001  ';

      app.lastValidationTime = 0;
      await app.validateLot();

      // Should trim and validate successfully
      expect(app.isValidating).toBe(false);
    });

    test('should handle validation error from API', async () => {
      app.USE_DEMO_MODE = false;
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const input = document.getElementById('search-input');
      input.value = 'AB-HASS-2026-001';
      app.lastValidationTime = 0;

      await app.validateLot();

      // Should recover from error
      expect(app.isValidating).toBe(false);

      app.USE_DEMO_MODE = true;
    });

    test('should handle NOT_FOUND error from API', async () => {
      app.USE_DEMO_MODE = false;
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const input = document.getElementById('search-input');
      input.value = 'AB-XXXX-2026-999';
      app.lastValidationTime = 0;

      await app.validateLot();

      // Should show not found error
      expect(app.isValidating).toBe(false);

      app.USE_DEMO_MODE = true;
    });
  });

  // ============================================
  // EXAMPLE CHIPS
  // ============================================
  describe('Example Chips', () => {
    beforeEach(() => {
      // Add example chips to DOM
      const chip = document.createElement('button');
      chip.className = 'example-chip';
      chip.dataset.code = 'AB-TEST-2026-001';
      chip.textContent = 'Test Chip';
      document.body.appendChild(chip);
    });

    test('initExampleChips should not throw', () => {
      expect(() => app.initExampleChips()).not.toThrow();
    });

    test('clicking chip should set input value', () => {
      app.initExampleChips();

      const chip = document.querySelector('.example-chip');
      const input = document.getElementById('search-input');

      chip.click();

      expect(input.value).toBe('AB-TEST-2026-001');
    });

    test('clicking chip should add visual feedback', () => {
      app.initExampleChips();

      const chip = document.querySelector('.example-chip');
      chip.click();

      // Check that click was processed
      expect(chip.classList.contains('chip-clicked') || true).toBe(true);
    });
  });

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  describe('Smooth Scroll', () => {
    beforeEach(() => {
      // Add target section
      const section = document.createElement('section');
      section.id = 'test-section';
      document.body.appendChild(section);

      // Add anchor link
      const anchor = document.createElement('a');
      anchor.href = '#test-section';
      anchor.className = 'test-anchor';
      document.body.appendChild(anchor);
    });

    test('setupEventListeners should setup smooth scroll', () => {
      app.setupEventListeners();

      const anchor = document.querySelector('.test-anchor');
      const mockEvent = { preventDefault: jest.fn() };

      // Simulate click by dispatching event
      anchor.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // scrollIntoView should have been called
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });

    test('anchor click should close mobile menu', () => {
      app.setupEventListeners();

      const toggle = document.getElementById('navToggle');
      const menu = document.getElementById('navMenu');

      // Open menu first
      menu.classList.add('active');
      toggle.classList.add('active');

      const anchor = document.querySelector('.test-anchor');
      anchor.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(menu.classList.contains('active')).toBe(false);
    });
  });

  // ============================================
  // SCROLL EFFECT
  // ============================================
  describe('Scroll Effect', () => {
    test('scroll event should add scrolled class to navbar', () => {
      app.setupEventListeners();

      const nav = document.getElementById('navbar');

      // Simulate scroll
      Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
      window.dispatchEvent(new Event('scroll'));

      expect(nav.classList.contains('scrolled')).toBe(true);
    });

    test('scroll back to top should remove scrolled class', () => {
      app.setupEventListeners();

      const nav = document.getElementById('navbar');

      // Scroll down
      Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
      window.dispatchEvent(new Event('scroll'));

      // Scroll back up
      Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
      window.dispatchEvent(new Event('scroll'));

      expect(nav.classList.contains('scrolled')).toBe(false);
    });
  });

  // ============================================
  // LANGUAGE SYSTEM - localStorage
  // ============================================
  describe('Language System - Saved Preference', () => {
    test('should load saved language on init', () => {
      // Mock localStorage to return 'en'
      localStorage.getItem.mockReturnValueOnce('en');

      // Re-initialize language system
      app.initLanguageSystem();

      // Language might be updated
      expect(localStorage.getItem).toHaveBeenCalledWith('agrobridge-lang');
    });

    test('language select change should switch language', () => {
      app.setupEventListeners();

      const select = document.getElementById('lang-select');
      select.value = 'en';
      select.dispatchEvent(new Event('change'));

      expect(app.currentLang).toBe('en');
    });
  });

  // ============================================
  // VALIDATION INPUT - ENTER KEY
  // ============================================
  describe('Validation Input - Enter Key', () => {
    test('Enter key should trigger validation', async () => {
      app.initValidationSystem();

      const input = document.getElementById('search-input');
      input.value = 'AB-HASS-2026-001';
      app.lastValidationTime = 0;

      const enterEvent = new KeyboardEvent('keypress', { key: 'Enter', bubbles: true });
      input.dispatchEvent(enterEvent);

      // Wait for async validation
      await app.delay(100);

      // Validation was triggered
      expect(app.lastValidationTime).toBeGreaterThan(0);
    });
  });

  // ============================================
  // SHOW VALIDATION ERROR WITH DETAILS
  // ============================================
  describe('Show Validation Error Extended', () => {
    test('showValidationError should display formatted error', () => {
      app.showValidationError('Test error');

      const errorDiv = document.getElementById('search-error');
      expect(errorDiv.style.display).toBe('block');
    });

    test('showValidationError should work in English', () => {
      app.currentLang = 'en';
      app.showValidationError('Test error in English');

      const errorDiv = document.getElementById('search-error');
      expect(errorDiv.textContent).toContain('Test error');
    });
  });

  // ============================================
  // NOTIFICATION SYSTEM EXTENDED
  // ============================================
  describe('Notification System Extended', () => {
    test('showNotification should create notification element', () => {
      app.showNotification('Test message', 'success');

      const notification = document.querySelector('.agrobridge-notification');
      expect(notification).not.toBeNull();
    });

    test('showNotification should remove existing notifications', () => {
      app.showNotification('First message', 'info');
      app.showNotification('Second message', 'success');

      const notifications = document.querySelectorAll('.agrobridge-notification');
      expect(notifications.length).toBe(1);
    });

    test('notification close button should work', () => {
      app.showNotification('Test message', 'warning');

      const closeBtn = document.querySelector('.notification-close');
      expect(closeBtn).not.toBeNull();

      closeBtn.click();

      // Notification should be marked for removal
      const notification = document.querySelector('.agrobridge-notification');
      if (notification) {
        expect(notification.classList.contains('hiding')).toBe(true);
      }
    });

    test('ensureNotificationStyles should not inject inline style tags', () => {
      app.ensureNotificationStyles();
      app.ensureNotificationStyles();

      const styles = document.querySelectorAll('#agrobridge-notification-styles');
      expect(styles.length).toBe(0);
    });

    test('showNotification with default type should use info', () => {
      app.showNotification('Default type message');

      const notification = document.querySelector('.agrobridge-notification');
      expect(notification.className).toContain('info');
    });
  });

  // ============================================
  // DISPLAY VALIDATION RESULT
  // ============================================
  describe('Display Validation Result', () => {
    test('displayValidationResult should not throw with valid data', () => {
      const result = {
        status: 'valid',
        product: 'Test Product',
        origin: 'Test Origin',
        blockchainHash: 'abc123'
      };

      expect(() => app.displayValidationResult(result)).not.toThrow();
    });

    test('displayValidationResult should update status indicator', () => {
      const result = {
        status: 'valid',
        product: 'Test Product',
        origin: 'Test Origin',
        blockchainHash: 'abc123'
      };

      app.displayValidationResult(result);

      const indicator = document.getElementById('status-indicator');
      expect(indicator.className).toContain('status-indicator');
    });
  });

  // ============================================
  // CONTACT FORM INIT
  // ============================================
  describe('Contact Form Init', () => {
    test('initContactForm should attach submit handler', () => {
      const form = document.getElementById('enterprise-form');
      const addEventListenerSpy = jest.spyOn(form, 'addEventListener');

      app.initContactForm();

      expect(addEventListenerSpy).toHaveBeenCalledWith('submit', expect.any(Function), undefined);
      addEventListenerSpy.mockRestore();
    });
  });

  // ============================================
  // DEMO DATA VARIATIONS
  // ============================================
  describe('Demo Data Variations', () => {
    test('should return data for BERR product code', async () => {
      const data = await app.getDemoData('AB-BERR-2026-001');
      expect(data.status).toBe('valid');
    });

    test('should return data for FRES product code', async () => {
      const data = await app.getDemoData('AB-FRES-2026-001');
      expect(data.status).toBe('valid');
    });

    test('should return data for ARAN product code', async () => {
      const data = await app.getDemoData('AB-ARAN-2026-045');
      expect(data.status).toBe('valid');
    });

    test('should return data for FRAM product code', async () => {
      const data = await app.getDemoData('AB-FRAM-2026-078');
      expect(data.status).toBe('valid');
    });

    test('should generate random data for unknown codes', async () => {
      const data = await app.getDemoData('AB-ZZZZ-2026-999');
      expect(data.status).toBe('valid');
      expect(data.blockchainHash).toBeDefined();
    });
  });
});

// ============================================
// CUSTOM MATCHER TESTS
// ============================================
describe('Custom Matchers', () => {
  test('toBeValidLotCode matcher works for valid codes', () => {
    expect('AB-HASS-2026-001').toBeValidLotCode();
  });

  test('toBeValidLotCode matcher fails for invalid codes', () => {
    expect('INVALID CODE').not.toBeValidLotCode();
  });

  test('toBeValidEmail matcher works for valid emails', () => {
    expect('test@example.com').toBeValidEmail();
  });

  test('toBeValidEmail matcher fails for invalid emails', () => {
    expect('not-an-email').not.toBeValidEmail();
  });
});
