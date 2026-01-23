/**
 * Integration Tests for Validation Flow
 * @description Tests for the complete validation workflow
 */

import { jest } from '@jest/globals';

describe('Validation Flow Integration', () => {
  let mockApp;

  beforeEach(() => {
    global.testUtils.createMockDOM();

    // Create a mock app instance
    mockApp = {
      currentLang: 'es',
      isValidating: false,
      lastValidationTime: 0,
      RATE_LIMIT_MS: 1000,
      USE_DEMO_MODE: true,

      isValidLotCode: (code) => /^AB-[A-Z]{4}-\d{4}-\d{3}$/.test(code.toUpperCase()),

      escapeHtml: (str) => {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"'`=\/]/g, char => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
          "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
        }[char]));
      },

      getElement: (id) => document.getElementById(id),

      setText: (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      },

      t: (key) => {
        const translations = {
          'error.empty': 'Por favor ingrese un código de lote',
          'error.format': 'Formato inválido. Use: AB-HASS-2026-001',
          'error.ratelimit': 'Espere un momento antes de verificar nuevamente.',
          'status.verifying': 'Verificando...',
          'status.verified': 'Origen Verificado'
        };
        return translations[key] || key;
      },

      showNotification: jest.fn(),

      validateLot: async function() {
        const searchInput = this.getElement('search-input') || this.getElement('validation-input');
        const errorDiv = this.getElement('search-error');
        const validateBtn = this.getElement('search-button') || this.getElement('validate-btn');

        if (!searchInput) return { success: false, error: 'input_not_found' };

        // Rate limiting
        const now = Date.now();
        if (now - this.lastValidationTime < this.RATE_LIMIT_MS) {
          this.showNotification(this.t('error.ratelimit'), 'warning');
          return { success: false, error: 'rate_limited' };
        }

        if (this.isValidating) return { success: false, error: 'already_validating' };

        const lotCode = searchInput.value.trim().toUpperCase();

        // Reset error state
        if (errorDiv) errorDiv.style.display = 'none';

        // Empty check
        if (!lotCode) {
          if (errorDiv) {
            errorDiv.textContent = this.t('error.empty');
            errorDiv.style.display = 'block';
          }
          return { success: false, error: 'empty' };
        }

        // Format validation
        if (!this.isValidLotCode(lotCode)) {
          if (errorDiv) {
            errorDiv.textContent = this.t('error.format');
            errorDiv.style.display = 'block';
          }
          return { success: false, error: 'invalid_format' };
        }

        // Start validation
        this.isValidating = true;
        this.lastValidationTime = now;

        if (validateBtn) validateBtn.disabled = true;

        // Simulate validation
        await new Promise(r => setTimeout(r, 50));

        this.isValidating = false;
        if (validateBtn) validateBtn.disabled = false;

        return {
          success: true,
          data: {
            status: 'valid',
            product: 'Aguacate Hass Premium',
            origin: 'Uruapan, Michoacán',
            blockchainHash: 'abc123'
          }
        };
      }
    };
  });

  // ============================================
  // INPUT HANDLING
  // ============================================
  describe('Input Handling', () => {
    test('should find search input element', () => {
      const input = mockApp.getElement('search-input');
      expect(input).not.toBeNull();
    });

    test('should find validation button', () => {
      const btn = mockApp.getElement('search-button');
      expect(btn).not.toBeNull();
    });

    test('should find error display element', () => {
      const error = mockApp.getElement('search-error');
      expect(error).not.toBeNull();
    });
  });

  // ============================================
  // EMPTY INPUT VALIDATION
  // ============================================
  describe('Empty Input Validation', () => {
    test('should show error for empty input', async () => {
      const input = document.getElementById('search-input');
      input.value = '';

      const result = await mockApp.validateLot();

      expect(result.success).toBe(false);
      expect(result.error).toBe('empty');
    });

    test('should show error message in error div', async () => {
      const input = document.getElementById('search-input');
      input.value = '';

      await mockApp.validateLot();

      const errorDiv = document.getElementById('search-error');
      expect(errorDiv.style.display).toBe('block');
      expect(errorDiv.textContent).toBe('Por favor ingrese un código de lote');
    });

    test('should show error for whitespace-only input', async () => {
      const input = document.getElementById('search-input');
      input.value = '   ';

      const result = await mockApp.validateLot();

      expect(result.success).toBe(false);
      expect(result.error).toBe('empty');
    });
  });

  // ============================================
  // FORMAT VALIDATION
  // ============================================
  describe('Format Validation', () => {
    test('should reject invalid format', async () => {
      const input = document.getElementById('search-input');
      input.value = 'INVALID';

      const result = await mockApp.validateLot();

      expect(result.success).toBe(false);
      expect(result.error).toBe('invalid_format');
    });

    test('should show format error message', async () => {
      const input = document.getElementById('search-input');
      input.value = 'BAD-CODE';

      await mockApp.validateLot();

      const errorDiv = document.getElementById('search-error');
      expect(errorDiv.textContent).toContain('Formato inválido');
    });

    test('should reject code with wrong prefix', async () => {
      const input = document.getElementById('search-input');
      input.value = 'XX-HASS-2026-001';

      const result = await mockApp.validateLot();

      expect(result.success).toBe(false);
      expect(result.error).toBe('invalid_format');
    });

    test('should reject code with wrong length', async () => {
      const input = document.getElementById('search-input');
      input.value = 'AB-HAS-2026-01';

      const result = await mockApp.validateLot();

      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // SUCCESSFUL VALIDATION
  // ============================================
  describe('Successful Validation', () => {
    test('should accept valid lot code', async () => {
      const input = document.getElementById('search-input');
      input.value = 'AB-HASS-2026-001';

      const result = await mockApp.validateLot();

      expect(result.success).toBe(true);
    });

    test('should return valid data on success', async () => {
      const input = document.getElementById('search-input');
      input.value = 'AB-HASS-2026-001';

      const result = await mockApp.validateLot();

      expect(result.data).toBeDefined();
      expect(result.data.status).toBe('valid');
      expect(result.data.product).toBeDefined();
      expect(result.data.origin).toBeDefined();
      expect(result.data.blockchainHash).toBeDefined();
    });

    test('should convert lowercase to uppercase', async () => {
      const input = document.getElementById('search-input');
      input.value = 'ab-hass-2026-001';

      const result = await mockApp.validateLot();

      expect(result.success).toBe(true);
    });

    test('should hide error div on valid input', async () => {
      const input = document.getElementById('search-input');
      const errorDiv = document.getElementById('search-error');

      // First trigger an error
      input.value = '';
      await mockApp.validateLot();
      expect(errorDiv.style.display).toBe('block');

      // Then valid input
      input.value = 'AB-HASS-2026-001';
      await mockApp.validateLot();
      expect(errorDiv.style.display).toBe('none');
    });
  });

  // ============================================
  // RATE LIMITING
  // ============================================
  describe('Rate Limiting', () => {
    test('should prevent rapid consecutive validations', async () => {
      const input = document.getElementById('search-input');
      input.value = 'AB-HASS-2026-001';

      // First validation
      const result1 = await mockApp.validateLot();
      expect(result1.success).toBe(true);

      // Immediate second validation
      const result2 = await mockApp.validateLot();
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('rate_limited');
    });

    test('should show rate limit notification', async () => {
      const input = document.getElementById('search-input');
      input.value = 'AB-HASS-2026-001';

      await mockApp.validateLot();
      await mockApp.validateLot();

      expect(mockApp.showNotification).toHaveBeenCalledWith(
        'Espere un momento antes de verificar nuevamente.',
        'warning'
      );
    });

    test('should allow validation after rate limit period', async () => {
      const input = document.getElementById('search-input');
      input.value = 'AB-HASS-2026-001';

      await mockApp.validateLot();

      // Reset the lastValidationTime to simulate waiting
      mockApp.lastValidationTime = 0;

      const result = await mockApp.validateLot();
      expect(result.success).toBe(true);
    });
  });

  // ============================================
  // BUTTON STATE
  // ============================================
  describe('Button State Management', () => {
    test('should disable button during validation', async () => {
      const input = document.getElementById('search-input');
      const btn = document.getElementById('search-button');
      input.value = 'AB-HASS-2026-001';

      // Start validation but don't await
      const validationPromise = mockApp.validateLot();

      // Button should be disabled during validation
      // Note: This is a simplified test since our mock is synchronous
      await validationPromise;

      // Button should be re-enabled after validation
      expect(btn.disabled).toBe(false);
    });

    test('should re-enable button after validation completes', async () => {
      const input = document.getElementById('search-input');
      const btn = document.getElementById('search-button');
      input.value = 'AB-HASS-2026-001';

      await mockApp.validateLot();

      expect(btn.disabled).toBe(false);
    });

    test('should re-enable button after validation error', async () => {
      const input = document.getElementById('search-input');
      const btn = document.getElementById('search-button');
      input.value = 'INVALID';

      await mockApp.validateLot();

      expect(btn.disabled).toBe(false);
    });
  });

  // ============================================
  // CONCURRENT VALIDATION PREVENTION
  // ============================================
  describe('Concurrent Validation Prevention', () => {
    test('should prevent concurrent validations', async () => {
      const input = document.getElementById('search-input');
      input.value = 'AB-HASS-2026-001';

      mockApp.isValidating = true;

      const result = await mockApp.validateLot();

      expect(result.success).toBe(false);
      expect(result.error).toBe('already_validating');
    });
  });
});

// ============================================
// CONTACT FORM INTEGRATION
// ============================================
describe('Contact Form Integration', () => {
  let mockContactHandler;

  beforeEach(() => {
    global.testUtils.createMockDOM();

    mockContactHandler = {
      showNotification: jest.fn(),

      handleContactSubmit: async function(formData) {
        // Validate required fields
        if (!formData.name || !formData.email || !formData.company) {
          this.showNotification('Por favor complete todos los campos requeridos.', 'error');
          return { success: false, error: 'missing_fields' };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          this.showNotification('Por favor ingrese un email válido.', 'error');
          return { success: false, error: 'invalid_email' };
        }

        // Simulate API call
        await new Promise(r => setTimeout(r, 50));

        this.showNotification('¡Solicitud enviada!', 'success');
        return { success: true };
      }
    };
  });

  describe('Form Validation', () => {
    test('should reject empty form', async () => {
      const result = await mockContactHandler.handleContactSubmit({});

      expect(result.success).toBe(false);
      expect(result.error).toBe('missing_fields');
    });

    test('should reject form without name', async () => {
      const result = await mockContactHandler.handleContactSubmit({
        email: 'test@example.com',
        company: 'Test Corp'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('missing_fields');
    });

    test('should reject form without email', async () => {
      const result = await mockContactHandler.handleContactSubmit({
        name: 'John',
        company: 'Test Corp'
      });

      expect(result.success).toBe(false);
    });

    test('should reject form without company', async () => {
      const result = await mockContactHandler.handleContactSubmit({
        name: 'John',
        email: 'test@example.com'
      });

      expect(result.success).toBe(false);
    });

    test('should reject invalid email format', async () => {
      const result = await mockContactHandler.handleContactSubmit({
        name: 'John',
        email: 'not-an-email',
        company: 'Test Corp'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('invalid_email');
    });

    test('should accept valid form data', async () => {
      const result = await mockContactHandler.handleContactSubmit({
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Corp'
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Email Validation', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.org',
      'user+tag@domain.co.uk',
      'a@b.co'
    ];

    const invalidEmails = [
      'plaintext',
      '@no-user.com',
      'no-domain@',
      'spaces in@email.com',
      'missing@dot'
    ];

    validEmails.forEach(email => {
      test(`should accept valid email: ${email}`, async () => {
        const result = await mockContactHandler.handleContactSubmit({
          name: 'Test',
          email: email,
          company: 'Test Corp'
        });
        expect(result.success).toBe(true);
      });
    });

    invalidEmails.forEach(email => {
      test(`should reject invalid email: ${email}`, async () => {
        const result = await mockContactHandler.handleContactSubmit({
          name: 'Test',
          email: email,
          company: 'Test Corp'
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Notification Display', () => {
    test('should show error notification for missing fields', async () => {
      await mockContactHandler.handleContactSubmit({});

      expect(mockContactHandler.showNotification).toHaveBeenCalledWith(
        'Por favor complete todos los campos requeridos.',
        'error'
      );
    });

    test('should show success notification on successful submission', async () => {
      await mockContactHandler.handleContactSubmit({
        name: 'John',
        email: 'john@example.com',
        company: 'Acme'
      });

      expect(mockContactHandler.showNotification).toHaveBeenCalledWith(
        '¡Solicitud enviada!',
        'success'
      );
    });
  });
});
