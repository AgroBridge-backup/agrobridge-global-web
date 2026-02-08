/**
 * AgroBridge Global - Main Application Controller
 * @version 3.0.0
 * @description Core orchestrator for ZTD verification system
 * @author AgroBridge Engineering Team
 *
 * This file creates the AgroBridgeApp class which delegates to
 * focused modules: utils, demo-data, i18n, ui, validation, contact.
 * All modules must be loaded before this file via <script defer>.
 */

(function() {
    'use strict';

    var utils = window.AgroBridgeUtils;
    var demoDataModule = window.AgroBridgeDemoData;
    var i18nModule = window.AgroBridgeI18n;
    var uiModule = window.AgroBridgeUI;
    var validationModule = window.AgroBridgeValidation;
    var contactModule = window.AgroBridgeContact;

    // ============================================
    // AGROBRIDGE APP CLASS
    // ============================================

    window.AgroBridge = window.AgroBridge || {};

    function AgroBridgeApp() {}

    // ============================================
    // CONSTRUCTOR
    // ============================================

    AgroBridgeApp.prototype._construct = function() {
        this._boundHandlers = {};
        this._trackedListeners = [];
        this._performanceObserver = null;
        this.currentLang = 'es';
        var globalConfig = typeof window !== 'undefined' ? window : {};
        this.apiBase = utils.normalizeApiBase(
            globalConfig.AGROBRIDGE_API_BASE || 'https://api.agrobridge.global/v2'
        );
        this.validationApi = this.apiBase + '/verify';
        this.contactApi = this.apiBase + '/leads';
        this.recaptchaSiteKey = (globalConfig.AGROBRIDGE_RECAPTCHA_SITE_KEY || '').trim();
        this.recaptchaAction = globalConfig.AGROBRIDGE_RECAPTCHA_ACTION || 'enterprise_lead';
        this.recaptchaReady = null;
        this.isValidating = false;
        this.lastValidationTime = 0;
        this.RATE_LIMIT_MS = 500;
        this.USE_DEMO_MODE = globalConfig.AGROBRIDGE_USE_DEMO === true;
        this.hasShownConfetti = false;
        this.init();
    };

    AgroBridgeApp.prototype._trackListener = function(target, event, handler, options) {
        if (!target || typeof target.addEventListener !== 'function') {
            return;
        }

        target.addEventListener(event, handler, options);
        this._trackedListeners.push({
            target: target,
            event: event,
            handler: handler,
            options: options
        });
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
        utils.log('App initialized v2.2.0 - Enhanced Demo with P0/P1 Fixes');
    };

    // ============================================
    // DELEGATE TO UTILS
    // ============================================

    AgroBridgeApp.prototype.escapeHtml = function(str) {
        return utils.escapeHtml(str);
    };

    AgroBridgeApp.prototype.getElement = function(id) {
        return utils.getElement(id);
    };

    AgroBridgeApp.prototype.setStyle = function(id, property, value) {
        utils.setStyle(id, property, value);
    };

    AgroBridgeApp.prototype.setText = function(id, text) {
        utils.setText(id, text);
    };

    AgroBridgeApp.prototype.setHtml = function(id, html) {
        utils.setHtml(id, html);
    };

    AgroBridgeApp.prototype.normalizeApiBase = function(base) {
        return utils.normalizeApiBase(base);
    };

    AgroBridgeApp.prototype.delay = function(ms) {
        return utils.delay(ms);
    };

    AgroBridgeApp.prototype.generateHash = function() {
        return utils.generateHash();
    };

    AgroBridgeApp.prototype.formatDateTime = function(date) {
        return utils.formatDateTime(date);
    };

    // ============================================
    // DELEGATE TO I18N
    // ============================================

    AgroBridgeApp.prototype.initLanguageSystem = function() {
        i18nModule.initLanguageSystem(this);
    };

    AgroBridgeApp.prototype.t = function(key) {
        return i18nModule.t(this.currentLang, key);
    };

    AgroBridgeApp.prototype.switchLanguage = function(lang) {
        i18nModule.switchLanguage(this, lang);
    };

    // ============================================
    // DELEGATE TO DEMO DATA
    // ============================================

    AgroBridgeApp.prototype.getDemoData = function(lotCode) {
        return demoDataModule.getDemoData(lotCode);
    };

    AgroBridgeApp.prototype.generateDemoData = function(lotCode) {
        return demoDataModule.generateDemoData(lotCode);
    };

    // ============================================
    // DELEGATE TO UI
    // ============================================

    AgroBridgeApp.prototype.initMobileMenu = function() {
        uiModule.initMobileMenu(this);
    };

    AgroBridgeApp.prototype.handleOutsideClick = function(e) {
        uiModule.handleOutsideClick(e);
    };

    AgroBridgeApp.prototype.initSlideshow = function() {
        uiModule.initSlideshow();
    };

    AgroBridgeApp.prototype.initExampleChips = function() {
        uiModule.initExampleChips(this);
    };

    AgroBridgeApp.prototype.showNotification = function(message, type) {
        uiModule.showNotification(message, type);
    };

    AgroBridgeApp.prototype.ensureNotificationStyles = function() {
        uiModule.ensureNotificationStyles();
    };

    AgroBridgeApp.prototype.triggerSuccess = function() {
        uiModule.triggerSuccess(this);
    };

    AgroBridgeApp.prototype.showScanningSteps = function() {
        return uiModule.showScanningSteps(this.currentLang);
    };

    // ============================================
    // DELEGATE TO VALIDATION
    // ============================================

    AgroBridgeApp.prototype.initValidationSystem = function() {
        validationModule.initValidationSystem(this);
    };

    AgroBridgeApp.prototype.runDemo = function() {
        return validationModule.runDemo(this);
    };

    AgroBridgeApp.prototype.isValidLotCode = function(code) {
        return validationModule.isValidLotCode(code);
    };

    AgroBridgeApp.prototype.validateLot = function() {
        return validationModule.validateLot(this);
    };

    AgroBridgeApp.prototype.fetchValidationData = function(lotCode) {
        return validationModule.fetchValidationData(this, lotCode);
    };

    AgroBridgeApp.prototype.normalizeVerificationResponse = function(payload, lotCode) {
        return validationModule.normalizeVerificationResponse(payload, lotCode);
    };

    AgroBridgeApp.prototype.displayValidationResult = function(data) {
        return validationModule.displayValidationResult(this, data);
    };

    AgroBridgeApp.prototype.buildDetailsHtml = function(data) {
        return validationModule.buildDetailsHtml(this, data);
    };

    AgroBridgeApp.prototype.updateValidationResults = function(data) {
        return validationModule.updateValidationResults(this, data);
    };

    AgroBridgeApp.prototype.updateCertificationBadges = function(certifications) {
        return validationModule.updateCertificationBadges(certifications);
    };

    AgroBridgeApp.prototype.showValidationError = function(message, type) {
        return validationModule.showValidationError(this, message, type);
    };

    AgroBridgeApp.prototype.initResetButton = function() {
        validationModule.initResetButton(this);
    };

    AgroBridgeApp.prototype.resetValidation = function() {
        validationModule.resetValidation(this);
    };

    // ============================================
    // DELEGATE TO CONTACT
    // ============================================

    AgroBridgeApp.prototype.initContactForm = function() {
        contactModule.initContactForm(this);
    };

    AgroBridgeApp.prototype.mapInquiryType = function(value) {
        return contactModule.mapInquiryType(value);
    };

    AgroBridgeApp.prototype.buildLeadMessage = function(data, inquiryType) {
        return contactModule.buildLeadMessage(this, data, inquiryType);
    };

    AgroBridgeApp.prototype.loadRecaptchaScript = function() {
        return contactModule.loadRecaptchaScript(this);
    };

    AgroBridgeApp.prototype.getRecaptchaToken = function(action) {
        return contactModule.getRecaptchaToken(this, action);
    };

    AgroBridgeApp.prototype.handleContactSubmit = function(e) {
        return contactModule.handleContactSubmit(this, e);
    };

    // ============================================
    // EVENT LISTENERS
    // ============================================

    AgroBridgeApp.prototype.setupEventListeners = function() {
        var self = this;

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            var handler = function(e) {
                e.preventDefault();
                var targetId = anchor.getAttribute('href');
                var target = document.querySelector(targetId);
                if (target) {
                    var navMenu = utils.getElement('navMenu');
                    var navToggle = utils.getElement('navToggle');
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
            self._trackListener(anchor, 'click', handler);
        });

        // Language switching
        document.querySelectorAll('select[id*="lang-select"]').forEach(function(select) {
            var handler = function(e) {
                self.switchLanguage(e.target.value);
            };
            self._trackListener(select, 'change', handler);
        });

        // Navbar scroll effect
        this._boundHandlers.navScroll = function() {
            var nav = utils.getElement('navbar');
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
        this._boundHandlers.globalError = function(e) {
            utils.error('Global error:', e.error);
        };
        this._trackListener(window, 'error', this._boundHandlers.globalError);

        this._boundHandlers.unhandledRejection = function(e) {
            utils.error('Unhandled promise rejection:', e.reason);
            e.preventDefault();
        };
        this._trackListener(window, 'unhandledrejection', this._boundHandlers.unhandledRejection);
    };

    AgroBridgeApp.prototype.setupPerformanceMonitoring = function() {
        if ('PerformanceObserver' in window) {
            try {
                this._performanceObserver = new PerformanceObserver(function(list) {
                    var entries = list.getEntries();
                    for (var i = 0; i < entries.length; i++) {
                        var entry = entries[i];
                        if (entry.name === 'first-contentful-paint' ||
                            entry.name === 'largest-contentful-paint' ||
                            entry.entryType === 'first-input') {
                            utils.log('Performance: ' + entry.name + ':', entry.value || entry.startTime);
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

    AgroBridgeApp.prototype.destroy = function() {
        if (Array.isArray(this._trackedListeners)) {
            this._trackedListeners.forEach(function(binding) {
                if (!binding || !binding.target || typeof binding.target.removeEventListener !== 'function') {
                    return;
                }

                binding.target.removeEventListener(binding.event, binding.handler, binding.options);
            });
            this._trackedListeners = [];
        }

        if (this._performanceObserver) {
            this._performanceObserver.disconnect();
            this._performanceObserver = null;
        }

        this._boundHandlers = {};
        utils.log('App destroyed');
    };

    // ============================================
    // REGISTER CLASS
    // ============================================

    window.AgroBridge.App = AgroBridgeApp;

    // ============================================
    // BOOTSTRAP
    // ============================================

    document.addEventListener('DOMContentLoaded', function() {
        var app = new AgroBridgeApp();
        app._construct();
        window.agroBridgeApp = app;
    });

    // Export for testing (CommonJS compatibility)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AgroBridgeApp;
    }
})();
