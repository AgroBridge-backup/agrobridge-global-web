import baseConfig from './jest.config.js';

export default {
  ...baseConfig,
  testMatch: [
    '<rootDir>/tests/accessibility/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  }
};
