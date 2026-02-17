export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/security/**/*.test.js'],
  collectCoverage: false,
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 20000,
  transform: {},
  verbose: true,
};
