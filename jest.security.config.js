// Backend (src/) test + coverage config.
// The security suite is the only suite that exercises src/, so it doubles as
// the backend coverage gate. `test:security` (already in CI release-gates)
// fails if src/ coverage regresses past the ratchet below.
//
// Coverage is written to coverage/backend/ to avoid colliding with the
// frontend coverage/ that the `test` job uploads to Codecov.
export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/security/**/*.test.js'],
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageDirectory: '<rootDir>/coverage/backend',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!**/node_modules/**'
  ],
  // Ratcheted ~3pt below V8-measured baseline (stmts 67.2 | branches 69.1 |
  // functions 59.03 | lines 67.2). Raise as backend tests are added.
  coverageThreshold: {
    global: {
      branches: 66,
      functions: 56,
      lines: 64,
      statements: 64
    }
  },
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 20000,
  transform: {},
  verbose: true,
};
