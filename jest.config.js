/**
 * Jest Configuration for AgroBridge Frontend
 * @description Complete testing setup for frontend validation
 */

export default {
  // Test environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Test file patterns (exclude e2e tests - those use Playwright)
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],

  // Ignore E2E tests (they use Playwright)
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/',
    '/tests/security/',
    '/tests/integration/server-smoke.test.js'
  ],

  // Coverage configuration
  // Use V8 provider: instruments by execution (Node V8 inspector) rather than
  // babel transform, so every collectCoverageFrom file that runs reports real
  // numbers. The default Istanbul provider was silently omitting files loaded
  // via the window-global IIFE pattern, inflating the headline percentage.
  coverageProvider: 'v8',
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Coverage thresholds - ratcheted to current true (V8-measured) coverage,
  // ~2pt below measured to absorb run-to-run variance. Acts as a regression
  // floor; raise incrementally as tests are added. Measured baseline:
  // stmts 86.78 | branches 72.83 | functions 81.45 | lines 86.78.
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 79,
      lines: 84,
      statements: 84
    }
  },

  // Files to collect coverage from (active split frontend modules)
  collectCoverageFrom: [
    'public_html/scripts/app.js',
    'public_html/scripts/contact.js',
    'public_html/scripts/demo-data.js',
    'public_html/scripts/i18n.js',
    'public_html/scripts/ui.js',
    'public_html/scripts/utils.js',
    'public_html/scripts/validation.js',
    '!**/node_modules/**'
  ],

  // Module paths
  moduleDirectories: ['node_modules', 'public_html/scripts'],

  // Transform configuration
  transform: {},

  // Verbose output
  verbose: true,

  // Test timeout
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Module name mapping for imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/public_html/scripts/$1'
  },

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Reporter configuration
  reporters: ['default']
};
