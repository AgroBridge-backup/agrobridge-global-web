/**
 * Jest Test Setup
 * @description Global setup for all frontend tests
 */

import { jest } from '@jest/globals';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: jest.fn((key) => localStorageMock.store[key] || null),
  setItem: jest.fn((key, value) => {
    localStorageMock.store[key] = String(value);
  }),
  removeItem: jest.fn((key) => {
    delete localStorageMock.store[key];
  }),
  clear: jest.fn(() => {
    localStorageMock.store = {};
  }),
  get length() {
    return Object.keys(localStorageMock.store).length;
  },
  key: jest.fn((i) => Object.keys(localStorageMock.store)[i] || null)
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  })
);

// Mock PerformanceObserver
class MockPerformanceObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  disconnect() {}
  takeRecords() { return []; }
}

global.PerformanceObserver = MockPerformanceObserver;

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock console methods for cleaner test output
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.info = jest.fn();
  // Keep error and warn for debugging
});

afterAll(() => {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
});

// Reset mocks and localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
  fetch.mockClear();
  document.body.innerHTML = '';
});

// Custom matchers
expect.extend({
  toBeValidLotCode(received) {
    const regex = /^AB-[A-Z]{4}-\d{4}-\d{3}$/;
    const pass = regex.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid lot code`
          : `Expected ${received} to be a valid lot code (format: AB-XXXX-YYYY-NNN)`
    };
  },

  toBeValidEmail(received) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = regex.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid email`
          : `Expected ${received} to be a valid email`
    };
  },

  toHaveAriaLabel(element) {
    const pass = element && element.hasAttribute && element.hasAttribute('aria-label');
    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to have aria-label`
          : `Expected element to have aria-label attribute`
    };
  }
});

// Global test utilities
global.testUtils = {
  /**
   * Create a mock DOM structure for testing
   */
  createMockDOM: () => {
    document.body.innerHTML = `
      <div id="body-main">
        <header>
          <nav id="navbar">
            <button id="navToggle" aria-expanded="false">
              <span class="nav__toggle-bar"></span>
              <span class="nav__toggle-bar"></span>
              <span class="nav__toggle-bar"></span>
            </button>
            <ul id="navMenu" class="nav__menu">
              <li><a href="#inicio" class="nav__link">Inicio</a></li>
              <li><a href="#productos" class="nav__link">Productos</a></li>
            </ul>
          </nav>
        </header>
        <main>
          <section id="validacion">
            <input id="search-input" type="text" placeholder="Código de lote">
            <input id="validation-input" type="text" placeholder="Código de lote">
            <button id="search-button">Verificar</button>
            <button id="validate-btn">Verificar</button>
            <button id="demo-btn">Demo</button>
            <div id="search-error" style="display: none;"></div>
            <div id="validation-status-message" style="display: none;"></div>
            <div id="validation-details-container"></div>
            <div id="validation-results"></div>
            <div id="scanning-overlay">
              <div id="scanning-step"></div>
            </div>
            <div id="status-indicator" class="status-indicator"></div>
            <span id="status-text">Listo</span>
            <span id="time-harvest"></span>
            <span id="time-packing"></span>
            <span id="time-cold"></span>
            <span id="time-export"></span>
            <span id="metric-brix"></span>
            <span id="metric-ph"></span>
            <span id="metric-temp"></span>
            <span id="metric-quality"></span>
            <span id="seal-hash"></span>
          </section>
          <section id="contacto">
            <form id="enterprise-form" class="contact-form">
              <input name="name" type="text" required placeholder="Nombre completo" aria-label="Nombre">
              <input name="email" type="email" required placeholder="Email corporativo" aria-label="Email">
              <input name="company" type="text" required placeholder="Empresa" aria-label="Empresa">
              <input name="phone" type="tel" placeholder="Teléfono" aria-label="Teléfono">
              <select name="interest" aria-label="Interés">
                <option value="export">Exportación</option>
                <option value="import">Importación</option>
              </select>
              <button type="submit">Enviar</button>
            </form>
          </section>
        </main>
        <select id="lang-select" aria-label="Seleccionar idioma">
          <option value="es">ES</option>
          <option value="en">EN</option>
          <option value="zh">ZH</option>
        </select>
      </div>
    `;
  },

  /**
   * Wait for async operations
   */
  wait: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Trigger DOM event
   */
  triggerEvent: (element, eventType, options = {}) => {
    const event = new Event(eventType, { bubbles: true, ...options });
    element.dispatchEvent(event);
  },

  /**
   * Trigger keyboard event
   */
  triggerKeyEvent: (element, eventType, key) => {
    const event = new KeyboardEvent(eventType, { key, bubbles: true });
    element.dispatchEvent(event);
  }
};

// Export for ES modules
export default global.testUtils;
