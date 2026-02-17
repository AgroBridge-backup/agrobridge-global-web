/**
 * AgroBridge UI Module
 * @description Mobile menu, slideshow, example chips, notifications, animations
 * @version 4.0.0
 */

window.AgroBridgeUI = (function() {
    'use strict';

    var utils = window.AgroBridgeUtils;
    var i18n = window.AgroBridgeI18n;
    if (!utils) { console.warn('AgroBridgeUtils not loaded'); return {}; }

    // ============================================
    // MOBILE MENU (Bug #7 Fix)
    // ============================================

    function trapFocus(container) {
        var focusable = container.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        container.addEventListener('keydown', function(e) {
            if (e.key !== 'Tab') return;
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        });
    }

    function setMobileMenuState(navToggle, navMenu, isActive) {
        if (!navToggle || !navMenu) return;
        navMenu.classList.toggle('active', isActive);
        navToggle.classList.toggle('active', isActive);
        navToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        navMenu.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    }

    function initMobileMenu(app) {
        var navToggle = utils.getElement('navToggle');
        var navMenu = utils.getElement('navMenu');

        if (navToggle && navMenu) {
            app._trackListener(navToggle, 'click', function() {
                var shouldOpen = !navMenu.classList.contains('active');
                setMobileMenuState(navToggle, navMenu, shouldOpen);
                if (shouldOpen) {
                    trapFocus(navMenu);
                    var firstFocusable = navMenu.querySelector('a[href], button, [tabindex]:not([tabindex="-1"])');
                    if (firstFocusable) firstFocusable.focus();
                } else {
                    navToggle.focus();
                }
            });

            app._trackListener(document, 'click', function(e) {
                if (!navMenu.classList.contains('active')) {
                    return;
                }
                if (navToggle.contains(e.target) || navMenu.contains(e.target)) {
                    return;
                }
                setMobileMenuState(navToggle, navMenu, false);
                navToggle.focus();
            });

            app._trackListener(document, 'keydown', function(e) {
                if (e.key !== 'Escape') return;
                if (!navMenu.classList.contains('active')) return;
                setMobileMenuState(navToggle, navMenu, false);
                navToggle.focus();
            });

            navMenu.querySelectorAll('.nav__link').forEach(function(link) {
                app._trackListener(link, 'click', function() {
                    setMobileMenuState(navToggle, navMenu, false);
                    navToggle.focus();
                });
            });
        }
    }

    // ============================================
    // SLIDESHOW
    // ============================================

    var slideshowInterval = null;

    function initSlideshow() {
        var slideshow = utils.getElement('heroSlideshow');
        if (!slideshow) return;

        var slides = slideshow.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;

        var currentSlide = 0;

        if (slideshowInterval) {
            clearInterval(slideshowInterval);
        }

        slideshowInterval = setInterval(function() {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    function destroySlideshow() {
        if (slideshowInterval) {
            clearInterval(slideshowInterval);
            slideshowInterval = null;
        }
    }

    // ============================================
    // EXAMPLE CHIPS (Quick Demo Access)
    // ============================================

    function initExampleChips(app) {
        document.querySelectorAll('.example-chip').forEach(function(chip) {
            app._trackListener(chip, 'click', function(e) {
                var code = e.currentTarget.dataset.code;
                var input = utils.getElement('search-input') || utils.getElement('validation-input');
                var chipElement = e.currentTarget;

                if (input && code) {
                    chipElement.classList.add('chip-clicked');
                    setTimeout(function() {
                        if (chipElement && chipElement.classList) {
                            chipElement.classList.remove('chip-clicked');
                        }
                    }, 200);

                    input.value = code;
                    input.focus();

                    setTimeout(function() { app.validateLot(); }, 300);
                }
            });
        });
    }

    // ============================================
    // NOTIFICATIONS
    // ============================================

    function showNotification(message, type) {
        if (type === undefined) type = 'info';

        var existing = document.querySelector('.agrobridge-notification');
        if (existing) existing.remove();

        var htmlLang = document.documentElement.getAttribute('data-ui-language') ||
            document.documentElement.lang || 'es';

        var notification = document.createElement('div');
        notification.className = 'agrobridge-notification agrobridge-notification--' + type;
        notification.setAttribute('role', type === 'error' ? 'alert' : 'status');
        notification.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        notification.setAttribute('aria-atomic', 'true');
        notification.tabIndex = -1;

        var icons = {
            success: '✓',
            error: '!',
            warning: '!',
            info: 'i'
        };

        notification.innerHTML =
            '<span class="notification-icon">' + (icons[type] || icons.info) + '</span>' +
            '<span class="notification-message">' + utils.escapeHtml(message) + '</span>' +
            '<button class="notification-close" aria-label="' +
            utils.escapeHtml(i18n.t(htmlLang, 'notification.close')) + '">\u00d7</button>';

        ensureNotificationStyles();

        document.body.appendChild(notification);
        notification.focus({ preventScroll: true });

        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.classList.add('hiding');
            setTimeout(function() { notification.remove(); }, 300);
        });

        setTimeout(function() {
            if (notification.parentNode) {
                notification.classList.add('hiding');
                setTimeout(function() { notification.remove(); }, 300);
            }
        }, 5000);

        requestAnimationFrame(function() {
            notification.classList.add('visible');
        });
    }

    function ensureNotificationStyles() {
        // Styles are served from external CSS to avoid inline style CSP exceptions.
        return;
    }

    // ============================================
    // SUCCESS ANIMATION
    // ============================================

    function triggerSuccess(app) {
        if (typeof confetti !== 'undefined' && !app.hasShownConfetti) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#34d399', '#6ee7b7', '#d4af37', '#fbbf24']
            });
            app.hasShownConfetti = true;
        }

        var sealIcon = document.querySelector('.seal-icon');
        if (sealIcon) {
            sealIcon.style.transform = 'scale(0)';
            setTimeout(function() {
                sealIcon.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                sealIcon.style.transform = 'scale(1)';
            }, 100);
        }

        var verificationSeal = document.querySelector('.verification-seal');
        if (verificationSeal) {
            verificationSeal.classList.add('success-pulse');
            setTimeout(function() {
                verificationSeal.classList.remove('success-pulse');
            }, 2000);
        }
    }

    // ============================================
    // SCANNING STEPS ANIMATION
    // ============================================

    async function showScanningSteps(currentLang, options) {
        var scanningStep = utils.getElement('scanning-step');
        if (!scanningStep) return;
        var shouldStop = options && typeof options.shouldStop === 'function'
            ? options.shouldStop
            : function() { return false; };
        var stepDelay = options && typeof options.stepDelay === 'number'
            ? Math.max(80, options.stepDelay)
            : 320;

        var steps = [
            i18n.t(currentLang, 'validation.scan.step.connect'),
            i18n.t(currentLang, 'validation.scan.step.hash'),
            i18n.t(currentLang, 'validation.scan.step.origin'),
            i18n.t(currentLang, 'validation.scan.step.cold'),
            i18n.t(currentLang, 'validation.scan.step.certificate')
        ];

        for (var i = 0; i < steps.length; i++) {
            if (shouldStop()) {
                break;
            }
            scanningStep.textContent = steps[i];
            await utils.delay(stepDelay);
        }
    }

    return {
        initMobileMenu: initMobileMenu,
        initSlideshow: initSlideshow,
        destroySlideshow: destroySlideshow,
        initExampleChips: initExampleChips,
        showNotification: showNotification,
        ensureNotificationStyles: ensureNotificationStyles,
        triggerSuccess: triggerSuccess,
        showScanningSteps: showScanningSteps
    };
})();
