/**
 * AgroBridge Global - Main Application Controller
 * @version 2.0.0
 * @description Core functionality for ZTD verification system
 * @author AgroBridge Engineering Team
 *
 * CHANGELOG v2.0.0:
 * - Fixed: API connection with real backend + demo fallback
 * - Fixed: Null pointer exceptions in validateLot()
 * - Fixed: Standardized lot code format (AB-XXXX-YYYY-NNN)
 * - Fixed: XSS sanitization for all user inputs
 * - Fixed: Rate limiting on validation requests
 * - Added: Proper error handling and user feedback
 * - Added: Mobile hamburger menu support
 * - Added: Contact form submission
 */

(function() {
    const AgroBridgeApp = window.AgroBridge.App;

    // ============================================
    // CONSTRUCTOR
    // ============================================

    AgroBridgeApp.prototype._construct = function() {
        this._boundHandlers = {};
        this._elementHandlers = [];
        this._performanceObserver = null;
        this.currentLang = 'es';
        const globalConfig = typeof window !== 'undefined' ? window : {};
        this.apiBase = this.normalizeApiBase(
            globalConfig.AGROBRIDGE_API_BASE || 'https://api.agrobridge.global/v2'
        );
        this.validationApi = this.apiBase + '/verify';
        this.contactApi = this.apiBase + '/leads';
        this.recaptchaSiteKey = (globalConfig.AGROBRIDGE_RECAPTCHA_SITE_KEY || '').trim();
        this.recaptchaAction = globalConfig.AGROBRIDGE_RECAPTCHA_ACTION || 'enterprise_lead';
        this.recaptchaReady = null;
        this.isValidating = false;
        this.lastValidationTime = 0;
        this.RATE_LIMIT_MS = 500; // 500ms between validations (reduced for demo)
        this.USE_DEMO_MODE = globalConfig.AGROBRIDGE_USE_DEMO === true;
        this.hasShownConfetti = false; // Confetti cooldown - only show once per session
        this.init();
    };

    /**
     * Track an element event listener for cleanup
     */
    AgroBridgeApp.prototype._trackListener = function(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        this._elementHandlers.push({ element, event, handler, options });
    };

    // ============================================
    // INITIALIZATION
    // ============================================

    AgroBridgeApp.prototype.init = function() {
        this.setupEventListeners();
        this.initLanguageSystem();
        this.initSlideshow();
        this.initValidationSystem();
        this.initContactForm();
        this.initMobileMenu();
        this.initExampleChips();
        this.initResetButton();
        this.setupErrorHandling();
        this.setupPerformanceMonitoring();
        console.log('[AgroBridge] App initialized v2.2.0 - Enhanced Demo with P0/P1 Fixes');
    };

    // ============================================
    // EVENT LISTENERS
    // ============================================

    AgroBridgeApp.prototype.setupEventListeners = function() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            const handler = (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    // Close mobile menu if open
                    const navMenu = this.getElement('navMenu');
                    const navToggle = this.getElement('navToggle');
                    if (navMenu) navMenu.classList.remove('active');
                    if (navToggle) {
                        navToggle.classList.remove('active');
                        navToggle.setAttribute('aria-expanded', 'false');
                    }

                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            };
            this._trackListener(anchor, 'click', handler);
        });

        // Language switching
        document.querySelectorAll('select[id*="lang-select"]').forEach(select => {
            const handler = (e) => {
                this.switchLanguage(e.target.value);
            };
            this._trackListener(select, 'change', handler);
        });

        // Navbar scroll effect
        this._boundHandlers.navScroll = () => {
            const nav = this.getElement('navbar');
            if (nav) {
                if (window.scrollY > 100) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
            }
        };
        this._trackListener(window, 'scroll', this._boundHandlers.navScroll);
    };

    // ============================================
    // ERROR HANDLING & MONITORING
    // ============================================

    AgroBridgeApp.prototype.setupErrorHandling = function() {
        this._boundHandlers.globalError = (e) => {
            console.error('[AgroBridge] Global error:', e.error);
            if (window.__SENTRY_INITIALIZED__ && window.Sentry && window.Sentry.captureException) {
                window.Sentry.captureException(e.error);
            }
        };
        this._trackListener(window, 'error', this._boundHandlers.globalError);

        this._boundHandlers.unhandledRejection = (e) => {
            console.error('[AgroBridge] Unhandled promise rejection:', e.reason);
            if (window.__SENTRY_INITIALIZED__ && window.Sentry && window.Sentry.captureException) {
                window.Sentry.captureException(e.reason instanceof Error ? e.reason : new Error(String(e.reason)));
            }
            e.preventDefault();
        };
        this._trackListener(window, 'unhandledrejection', this._boundHandlers.unhandledRejection);
    };

    AgroBridgeApp.prototype.setupPerformanceMonitoring = function() {
        if ('PerformanceObserver' in window) {
            try {
                this._performanceObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        // Log Core Web Vitals
                        if (entry.name === 'first-contentful-paint' ||
                            entry.name === 'largest-contentful-paint' ||
                            entry.entryType === 'first-input') {
                            console.log('[AgroBridge] Performance: ' + entry.name + ':',
                                entry.value || entry.startTime);
                        }
                    }
                });

                this._performanceObserver.observe({
                    entryTypes: ['paint', 'largest-contentful-paint', 'first-input']
                });
            } catch (e) {
                // PerformanceObserver not fully supported
            }
        }
    };

    // ============================================
    // CLEANUP
    // ============================================

    /**
     * Remove all event listeners and clean up resources.
     * Call this before discarding the app instance.
     */
    AgroBridgeApp.prototype.destroy = function() {
        // Remove tracked element listeners
        if (this._elementHandlers) {
            this._elementHandlers.forEach(({ element, event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
            this._elementHandlers = [];
        }
        if (this._boundHandlers) {
            this._boundHandlers = {};
        }

        // Disconnect performance observer
        if (this._performanceObserver) {
            this._performanceObserver.disconnect();
            this._performanceObserver = null;
        }

        console.log('[AgroBridge] App destroyed');
    };

    // ============================================
    // BOOTSTRAP
    // ============================================

    // Initialize app when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        const app = new AgroBridgeApp();
        app._construct();
        window.agroBridgeApp = app;
    });

    // Export for testing (CommonJS compatibility)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AgroBridgeApp;
    }
})();
