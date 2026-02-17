(function() {
  'use strict';

  var ALLOWED_BRAND_ROUTES = ['institutional-tech', 'editorial-luxury', 'agro-heritage-modern'];
  var SENTRY_DSN_PLACEHOLDER = 'https://xxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxx';

  function applyBrandRoute() {
    var queryRoute = new URLSearchParams(window.location.search).get('brandRoute');
    var safeQueryRoute = ALLOWED_BRAND_ROUTES.indexOf(queryRoute) > -1 ? queryRoute : null;
    var selectedRoute = safeQueryRoute || document.documentElement.getAttribute('data-brand-route') || 'institutional-tech';

    try {
      if (safeQueryRoute) {
        localStorage.setItem('agrobridge.brandRoute', safeQueryRoute);
      } else {
        var savedRoute = localStorage.getItem('agrobridge.brandRoute');
        if (ALLOWED_BRAND_ROUTES.indexOf(savedRoute) > -1) {
          selectedRoute = savedRoute;
        }
      }
    } catch (_error) {
      // Ignore storage restrictions (private mode, disabled storage).
    }

    if (ALLOWED_BRAND_ROUTES.indexOf(selectedRoute) === -1) {
      selectedRoute = 'institutional-tech';
    }

    document.documentElement.setAttribute('data-brand-route', selectedRoute);
  }

  function applyRuntimeDefaults() {
    var isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    var defaultApiBase = isLocalhost ? 'http://localhost:3000/v2' : 'https://api.agrobridge.global/v2';

    if (!window.AGROBRIDGE_API_BASE || isLocalhost) {
      window.AGROBRIDGE_API_BASE = defaultApiBase;
    }

    if (typeof window.AGROBRIDGE_USE_DEMO === 'undefined') {
      window.AGROBRIDGE_USE_DEMO = false;
    }

    if (!window.AGROBRIDGE_RECAPTCHA_ACTION) {
      window.AGROBRIDGE_RECAPTCHA_ACTION = 'enterprise_lead';
    }

    if (!window.AGROBRIDGE_ENV) {
      window.AGROBRIDGE_ENV = isLocalhost ? 'development' : 'production';
    }
  }

  function buildRuntimeConfig() {
    window.AGROBRIDGE_CONFIG = {
      apiBase: window.AGROBRIDGE_API_BASE,
      useDemo: window.AGROBRIDGE_USE_DEMO,
      recaptchaSiteKey: window.AGROBRIDGE_RECAPTCHA_SITE_KEY || '',
      sentryDsn: window.AGROBRIDGE_SENTRY_DSN || '',
      sentryEnvironment: window.AGROBRIDGE_ENV || 'production',
      release: '2.0.0',
      gitCommit: 'unknown'
    };

    return window.AGROBRIDGE_CONFIG;
  }

  function installSentryFallback() {
    if (window.Sentry) {
      return;
    }

    window.Sentry = {
      init: function() {},
      captureException: function() {},
      captureMessage: function() {},
      addBreadcrumb: function() {},
      withScope: function(callback) {
        if (typeof callback === 'function') {
          callback(this);
        }
      },
      setTag: function() {},
      setUser: function() {},
      configureScope: function(callback) {
        if (typeof callback === 'function') {
          callback(this);
        }
      },
      BrowserTracing: function() {},
      Replay: function() {}
    };
  }

  function initializeSentry(config) {
    window.__SENTRY_INITIALIZED__ = false;

    var isSentryConfigured = Boolean(config.sentryDsn && config.sentryDsn !== SENTRY_DSN_PLACEHOLDER);
    if (!isSentryConfigured) {
      return;
    }

    var sentryScript = document.createElement('script');
    sentryScript.src = 'https://browser.sentry-cdn.com/8.15.0/bundle.tracing.min.js';
    sentryScript.crossOrigin = 'anonymous';
    sentryScript.async = true;

    sentryScript.onload = function() {
      if (!window.Sentry || typeof window.Sentry.init !== 'function') {
        console.warn('Sentry script loaded but Sentry not available');
        return;
      }

      try {
        window.Sentry.init({
          dsn: config.sentryDsn,
          environment: config.sentryEnvironment,
          release: config.release + '@' + config.gitCommit,
          integrations: [
            new window.Sentry.BrowserTracing({
              tracingOrigins: ['api.agrobridge.global', 'staging-api.agrobridge.global', 'localhost', /^\//]
            }),
            new window.Sentry.Replay({
              maskAllText: true,
              blockAllMedia: true
            })
          ],
          tracesSampleRate: 0.1,
          replaysSessionSampleRate: 0.01,
          replaysOnErrorSampleRate: 1,
          beforeSend: function(event) {
            if (!event.request) {
              return event;
            }

            delete event.request.cookies;

            var headers = {};
            var requestHeaders = event.request.headers || {};
            Object.keys(requestHeaders).forEach(function(key) {
              if (key !== 'authorization' && key !== 'cookie') {
                headers[key] = requestHeaders[key];
              }
            });

            event.request.headers = headers;
            return event;
          }
        });

        window.__SENTRY_INITIALIZED__ = true;
      } catch (error) {
        console.warn('Failed to initialize Sentry:', error);
      }
    };

    sentryScript.onerror = function() {
      console.warn('Failed to load Sentry SDK');
    };

    document.head.appendChild(sentryScript);
  }

  applyBrandRoute();
  applyRuntimeDefaults();
  var runtimeConfig = buildRuntimeConfig();
  installSentryFallback();
  initializeSentry(runtimeConfig);
})();
