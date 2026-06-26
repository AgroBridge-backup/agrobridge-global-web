module.exports = {
  root: true,
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    'public_html/dist/',
    'playwright-report/',
  ],
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
  },
  overrides: [
    {
      files: ['src/**/*.js', 'jest*.js', '.github/**/*.js', 'playwright.config.js', 'scripts/**/*.mjs'],
      env: {
        node: true,
        es2022: true,
      },
      parserOptions: {
        sourceType: 'module',
      },
    },
    {
      files: ['public_html/**/*.js'],
      env: {
        browser: true,
        es2022: true,
      },
      parserOptions: {
        sourceType: 'script',
      },
      globals: {
        confetti: 'readonly',
        dataLayer: 'readonly',
        grecaptcha: 'readonly',
        Sentry: 'readonly',
        gtag: 'readonly',
        module: 'readonly',
      },
    },
    {
      files: ['tests/**/*.js'],
      env: {
        node: true,
        jest: true,
        browser: true,
        es2022: true,
      },
      parserOptions: {
        sourceType: 'module',
      },
      globals: {
        global: 'readonly',
      },
      rules: {
        'no-unused-vars': 'off',
      },
    },
  ],
  rules: {
    'no-console': 'off',
    'no-useless-escape': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
};
