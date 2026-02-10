/**
 * AgroBridge Contact Module
 * @description Contact form submission and reCAPTCHA integration
 * @version 3.0.0
 */

window.AgroBridgeContact = (function() {
    'use strict';

    var utils = window.AgroBridgeUtils;
    var ui = window.AgroBridgeUI;
    var i18n = window.AgroBridgeI18n;

    function showNotification(app, message, type) {
        if (app && typeof app.showNotification === 'function') {
            app.showNotification(message, type);
            return;
        }
        ui.showNotification(message, type);
    }

    // ============================================
    // CONTACT FORM (Bug #2 Fix)
    // ============================================

    function initContactForm(app) {
        var contactForm = utils.getElement('enterprise-form') || document.querySelector('.contact-form');

        if (contactForm) {
            app._trackListener(contactForm, 'submit', function(e) { handleContactSubmit(app, e); });
        }
    }

    function mapInquiryType(value) {
        var lookup = {
            cotizacion: 'product',
            partnership: 'partnership',
            informacion: 'other',
            product: 'product',
            support: 'support',
            other: 'other'
        };
        return lookup[value] || 'other';
    }

    function buildLeadMessage(app, data, inquiryType) {
        var phone = data.phone ? ' ' + data.phone : '';
        var company = data.company ? ' ' + data.company : '';
        var inquiryLabels = {
            product: app.currentLang === 'es' ? 'Cotizaci\u00f3n Enterprise' : 'Enterprise Quote',
            partnership: app.currentLang === 'es' ? 'Partnership / Alianza Comercial' : 'Partnership',
            support: app.currentLang === 'es' ? 'Soporte' : 'Support',
            other: app.currentLang === 'es' ? 'Informaci\u00f3n General' : 'General Information'
        };
        var inquiryLabel = inquiryLabels[inquiryType] || inquiryType;

        if (app.currentLang === 'es') {
            return 'Solicitud enterprise desde el sitio web.\nEmpresa:' + company + '\nTelefono:' + phone + '\nTipo:' + inquiryLabel;
        }

        return 'Enterprise request from website.\nCompany:' + company + '\nPhone:' + phone + '\nType:' + inquiryLabel;
    }

    function loadRecaptchaScript(app) {
        if (app.recaptchaReady) return app.recaptchaReady;
        if (!app.recaptchaSiteKey || app.recaptchaSiteKey.indexOf('REPLACE_WITH') !== -1) {
            app.recaptchaReady = Promise.resolve(null);
            return app.recaptchaReady;
        }

        if (typeof window === 'undefined') {
            app.recaptchaReady = Promise.resolve(null);
            return app.recaptchaReady;
        }

        if (window.grecaptcha && typeof window.grecaptcha.execute === 'function') {
            app.recaptchaReady = new Promise(function(resolve) {
                window.grecaptcha.ready(function() { resolve(window.grecaptcha); });
            });
            return app.recaptchaReady;
        }

        app.recaptchaReady = new Promise(function(resolve) {
            var script = document.createElement('script');
            script.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(app.recaptchaSiteKey);
            script.async = true;
            script.defer = true;
            script.onload = function() {
                if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
                    window.grecaptcha.ready(function() { resolve(window.grecaptcha); });
                } else {
                    resolve(null);
                }
            };
            script.onerror = function() { resolve(null); };
            document.head.appendChild(script);
        });

        return app.recaptchaReady;
    }

    async function getRecaptchaToken(app, action) {
        if (!app.recaptchaSiteKey || app.recaptchaSiteKey.indexOf('REPLACE_WITH') !== -1) {
            return null;
        }

        var recaptcha = await loadRecaptchaScript(app);
        if (!recaptcha || typeof recaptcha.execute !== 'function') {
            return null;
        }

        try {
            return await recaptcha.execute(app.recaptchaSiteKey, { action: action });
        } catch (error) {
            utils.warn('reCAPTCHA execute failed:', error);
            return null;
        }
    }

    async function handleContactSubmit(app, e) {
        e.preventDefault();

        var form = e.target;
        var submitBtn = form.querySelector('button[type="submit"]');
        var originalBtnText = submitBtn ? submitBtn.textContent : '';

        var formData = new FormData(form);
        var data = Object.fromEntries(formData.entries());

        if (!data.name || !data.email || !data.company || !data.phone || !data.inquiry_type) {
            showNotification(
                app,
                app.currentLang === 'es'
                    ? 'Por favor complete todos los campos requeridos.'
                    : 'Please fill in all required fields.',
                'error'
            );
            return;
        }

        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showNotification(
                app,
                app.currentLang === 'es'
                    ? 'Por favor ingrese un email v\u00e1lido.'
                    : 'Please enter a valid email.',
                'error'
            );
            return;
        }

        var inquiryType = mapInquiryType(data.inquiry_type);
        var userMessage = data.message ? data.message.trim() : '';
        var finalMessage = userMessage.length >= 10
            ? userMessage
            : buildLeadMessage(app, data, inquiryType);

        if (!finalMessage || finalMessage.trim().length < 10) {
            showNotification(
                app,
                app.currentLang === 'es'
                    ? 'Por favor ingrese un mensaje m\u00e1s detallado.'
                    : 'Please provide a more detailed message.',
                'error'
            );
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = i18n.t(app.currentLang, 'form.sending');
        }

        try {
            if (app.USE_DEMO_MODE) {
                await utils.delay(1500);
                showNotification(app, i18n.t(app.currentLang, 'form.success'), 'success');
                form.reset();
            } else {
                var recaptchaToken = await app.getRecaptchaToken(app.recaptchaAction);
                if (!recaptchaToken) {
                    throw new Error(i18n.t(app.currentLang, 'form.recaptcha'));
                }

                var payload = {
                    name: data.name.trim(),
                    email: data.email.trim().toLowerCase(),
                    phone: data.phone.trim(),
                    company: data.company.trim(),
                    message: finalMessage,
                    inquiryType: inquiryType,
                    source: 'website',
                    recaptchaToken: recaptchaToken,
                    honeypot: data.honeypot || ''
                };

                if (data.lotCode) {
                    payload.lotCode = data.lotCode.trim();
                }

                var response = await window.AgroBridgeUtils.fetchWithTimeout(app.contactApi, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-Language': app.currentLang
                    },
                    body: JSON.stringify(payload)
                }, 10000);

                if (!response.ok) {
                    var errorMessage = i18n.t(app.currentLang, 'form.error');
                    try {
                        var errorPayload = await response.json();
                        errorMessage = (errorPayload && errorPayload.message) ||
                            (errorPayload && errorPayload.errors && errorPayload.errors[0] && errorPayload.errors[0].message) ||
                            errorMessage;
                    } catch (err) {
                        errorMessage = i18n.t(app.currentLang, 'form.error');
                    }
                    throw new Error(errorMessage);
                }

                showNotification(app, i18n.t(app.currentLang, 'form.success'), 'success');
                form.reset();
            }
        } catch (error) {
            utils.error('Contact form error:', error);
            var message;
            if (error.message === 'REQUEST_TIMEOUT') {
                message = i18n.t(app.currentLang, 'error.timeout') ||
                    (app.currentLang === 'es'
                        ? 'La solicitud ha expirado. Por favor intente de nuevo.'
                        : 'Request timed out. Please try again.');
            } else {
                message = (error && error.message) ? error.message : i18n.t(app.currentLang, 'form.error');
            }
            showNotification(app, message, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText || i18n.t(app.currentLang, 'form.submit');
            }
        }
    }

    return {
        initContactForm: initContactForm,
        mapInquiryType: mapInquiryType,
        buildLeadMessage: buildLeadMessage,
        loadRecaptchaScript: loadRecaptchaScript,
        getRecaptchaToken: getRecaptchaToken,
        handleContactSubmit: handleContactSubmit
    };
})();
