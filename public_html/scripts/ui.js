/**
 * AgroBridge UI Module
 * @description Mobile menu, slideshow, example chips, notifications, animations
 * @version 3.0.0
 */

window.AgroBridgeUI = (function() {
    'use strict';

    var utils = window.AgroBridgeUtils;

    // ============================================
    // MOBILE MENU (Bug #7 Fix)
    // ============================================

    function initMobileMenu(app) {
        var navToggle = utils.getElement('navToggle');
        var navMenu = utils.getElement('navMenu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function() {
                var isActive = navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
                navToggle.setAttribute('aria-expanded', isActive.toString());

                if (isActive) {
                    document.addEventListener('click', function outsideClick(e) {
                        handleOutsideClick(e);
                    }, { once: true });
                }
            });

            navMenu.querySelectorAll('.nav__link').forEach(function(link) {
                link.addEventListener('click', function() {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }

    function handleOutsideClick(e) {
        var navToggle = utils.getElement('navToggle');
        var navMenu = utils.getElement('navMenu');

        if (navToggle && navMenu && !navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    }

    // ============================================
    // SLIDESHOW
    // ============================================

    function initSlideshow() {
        var slideshow = utils.getElement('heroSlideshow');
        if (!slideshow) return;

        var slides = slideshow.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;

        var currentSlide = 0;

        setInterval(function() {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // ============================================
    // EXAMPLE CHIPS (Quick Demo Access)
    // ============================================

    function initExampleChips(app) {
        document.querySelectorAll('.example-chip').forEach(function(chip) {
            chip.addEventListener('click', function(e) {
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

        var notification = document.createElement('div');
        notification.className = 'agrobridge-notification agrobridge-notification--' + type;

        var icons = {
            success: '\u2705',
            error: '\u274c',
            warning: '\u26a0\ufe0f',
            info: '\u2139\ufe0f'
        };

        notification.innerHTML =
            '<span class="notification-icon">' + (icons[type] || icons.info) + '</span>' +
            '<span class="notification-message">' + utils.escapeHtml(message) + '</span>' +
            '<button class="notification-close" aria-label="Cerrar">\u00d7</button>';

        ensureNotificationStyles();

        document.body.appendChild(notification);

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
        if (document.getElementById('agrobridge-notification-styles')) return;

        var styles = document.createElement('style');
        styles.id = 'agrobridge-notification-styles';
        styles.textContent =
            '.agrobridge-notification {' +
            '  position: fixed; top: 20px; right: 20px; padding: 16px 20px;' +
            '  border-radius: 12px; background: white; box-shadow: 0 10px 40px rgba(0,0,0,0.2);' +
            '  display: flex; align-items: center; gap: 12px; z-index: 10000;' +
            '  transform: translateX(120%); transition: transform 0.3s ease, opacity 0.3s ease;' +
            '  max-width: 400px; font-family: "Inter", sans-serif;' +
            '}' +
            '.agrobridge-notification.visible { transform: translateX(0); }' +
            '.agrobridge-notification.hiding { transform: translateX(120%); opacity: 0; }' +
            '.agrobridge-notification--success { border-left: 4px solid #22c55e; }' +
            '.agrobridge-notification--error { border-left: 4px solid #ef4444; }' +
            '.agrobridge-notification--warning { border-left: 4px solid #f59e0b; }' +
            '.agrobridge-notification--info { border-left: 4px solid #3b82f6; }' +
            '.notification-icon { font-size: 1.25rem; }' +
            '.notification-message { flex: 1; color: #1f2937; font-size: 0.95rem; }' +
            '.notification-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #9ca3af; padding: 0; line-height: 1; }' +
            '.notification-close:hover { color: #4b5563; }' +
            '@media (max-width: 480px) { .agrobridge-notification { left: 10px; right: 10px; max-width: none; } }';
        document.head.appendChild(styles);
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

    async function showScanningSteps(currentLang) {
        var scanningStep = utils.getElement('scanning-step');
        if (!scanningStep) return;

        var steps = currentLang === 'es' ? [
            'Conectando con TrustChain\u2122...',
            'Verificando hash SHA-256...',
            'Consultando registro de origen...',
            'Validando cadena de fr\u00edo...',
            'Generando certificado...'
        ] : [
            'Connecting to TrustChain\u2122...',
            'Verifying SHA-256 hash...',
            'Querying origin registry...',
            'Validating cold chain...',
            'Generating certificate...'
        ];

        for (var i = 0; i < steps.length; i++) {
            scanningStep.textContent = steps[i];
            await utils.delay(500);
        }
    }

    return {
        initMobileMenu: initMobileMenu,
        handleOutsideClick: handleOutsideClick,
        initSlideshow: initSlideshow,
        initExampleChips: initExampleChips,
        showNotification: showNotification,
        ensureNotificationStyles: ensureNotificationStyles,
        triggerSuccess: triggerSuccess,
        showScanningSteps: showScanningSteps
    };
})();
