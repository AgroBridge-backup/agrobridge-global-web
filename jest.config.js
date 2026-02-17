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
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Coverage thresholds - 90%+ target
  coverageThreshold: {
    global: {
      branches: 55,
      functions: 70,
      lines: 73,
      statements: 73
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
