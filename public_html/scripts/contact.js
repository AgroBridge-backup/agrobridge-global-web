/**
 * AgroBridge Contact Module
 * @description Contact form submission and reCAPTCHA integration
 * @version 4.0.0
 */

window.AgroBridgeContact = (function() {
    'use strict';

    var utils = window.AgroBridgeUtils;
    var ui = window.AgroBridgeUI;
    var i18n = window.AgroBridgeI18n;
    if (!utils) { console.warn('AgroBridgeUtils not loaded'); return {}; }

    function setFieldValidity(field, valid, message) {
        if (!field) return;

        field.classList.remove('is-valid', 'is-invalid');
        field.removeAttribute('aria-invalid');

        if (valid === true) {
            field.classList.add('is-valid');
            field.setAttribute('aria-invalid', 'false');
            field.setCustomValidity('');
            return;
        }

        if (valid === false) {
            field.classList.add('is-invalid');
            field.setAttribute('aria-invalid', 'true');
            field.setCustomValidity(message || 'Invalid field');
            return;
        }

        field.setCustomValidity('');
    }

    function setFormStatus(app, form, message, type) {
        var status = form ? form.querySelector('#contact-status') : null;
        if (!status) return;

        var variant = type || 'info';
        status.className = 'form-status form-status--' + variant;
        status.textContent = message || '';
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
        var labels = {
            product: i18n.t(app.currentLang, 'contact.inquiry.product'),
            partnership: i18n.t(app.currentLang, 'contact.inquiry.partnership'),
            support: i18n.t(app.currentLang, 'contact.inquiry.support'),
            other: i18n.t(app.currentLang, 'contact.inquiry.other')
        };

        var template = i18n.t(app.currentLang, 'contact.message.autogen');
        return template
            .replace('{company}', data.company || '-')
            .replace('{phone}', data.phone || '-')
            .replace('{inquiry}', labels[inquiryType] || labels.other);
    }

    function validateSingleField(app, field, formData) {
        if (!field) return { valid: true, message: '' };

        var value = (field.value || '').trim();
        var name = field.name;

        if (name === 'name' || name === 'company') {
            if (value.length < 2) {
                return { valid: false, message: i18n.t(app.currentLang, 'form.required') };
            }
            return { valid: true, message: '' };
        }

        if (name === 'email') {
            if (!value) {
                return { valid: false, message: i18n.t(app.currentLang, 'form.required') };
            }
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return { valid: false, message: i18n.t(app.currentLang, 'form.invalid_email') };
            }
            return { valid: true, message: '' };
        }

        if (name === 'phone') {
            if (value.replace(/\D/g, '').length < 7) {
                return { valid: false, message: i18n.t(app.currentLang, 'form.required') };
            }
            return { valid: true, message: '' };
        }

        if (name === 'inquiry_type') {
            if (!value) {
                return { valid: false, message: i18n.t(app.currentLang, 'form.required') };
            }
            return { valid: true, message: '' };
        }

        if (name === 'message') {
            var fallbackMessage = (formData && formData.message) ? formData.message.trim() : value;
            if (fallbackMessage.length > 0 && fallbackMessage.length < 10) {
                return { valid: false, message: i18n.t(app.currentLang, 'form.message_short') };
            }
            return { valid: true, message: '' };
        }

        return { valid: true, message: '' };
    }

    function validateForm(app, form, data) {
        var fields = form.querySelectorAll('input[name], select[name], textarea[name]');
        var firstInvalidField = null;
        var invalidMessage = '';

        fields.forEach(function(field) {
            if (field.name === 'honeypot') return;

            var result = validateSingleField(app, field, data);
            setFieldValidity(field, result.valid, result.message);

            if (!result.valid && !firstInvalidField) {
                firstInvalidField = field;
                invalidMessage = result.message;
            }
        });

        return {
            valid: !firstInvalidField,
            firstInvalidField: firstInvalidField,
            message: invalidMessage || i18n.t(app.currentLang, 'form.required')
        };
    }

    function clearFormValidationState(form) {
        var fields = form.querySelectorAll('input[name], select[name], textarea[name]');
        fields.forEach(function(field) {
            setFieldValidity(field, null, '');
        });
    }

    function wireRealtimeValidation(app, form) {
        var fields = form.querySelectorAll('input[name], select[name], textarea[name]');

        fields.forEach(function(field) {
            if (field.name === 'honeypot') return;

            app._trackListener(field, 'blur', function() {
                var result = validateSingleField(app, field);
                setFieldValidity(field, result.valid, result.message);
            });

            app._trackListener(field, 'input', function() {
                if (!field.classList.contains('is-invalid')) return;
                var result = validateSingleField(app, field);
                setFieldValidity(field, result.valid, result.message);
            });

            app._trackListener(field, 'change', function() {
                var result = validateSingleField(app, field);
                setFieldValidity(field, result.valid, result.message);
            });
        });
    }

    function setSubmittingState(app, form, submitBtn, isSubmitting) {
        if (submitBtn) {
            submitBtn.disabled = isSubmitting;
            submitBtn.setAttribute('aria-disabled', isSubmitting ? 'true' : 'false');
            submitBtn.setAttribute('aria-busy', isSubmitting ? 'true' : 'false');
            submitBtn.classList.toggle('is-loading', isSubmitting);
            submitBtn.textContent = isSubmitting
                ? i18n.t(app.currentLang, 'form.sending')
                : i18n.t(app.currentLang, 'form.submit');
        }

        if (form) {
            form.classList.toggle('is-submitting', isSubmitting);
            form.setAttribute('aria-busy', isSubmitting ? 'true' : 'false');
        }
    }

    // ============================================
    // CONTACT FORM
    // ============================================

    function initContactForm(app) {
        var contactForm = utils.getElement('enterprise-form') || document.querySelector('.contact-form');

        if (contactForm) {
            wireRealtimeValidation(app, contactForm);
            app._trackListener(contactForm, 'submit', function(e) { handleContactSubmit(app, e); });
        }
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

        var formData = new FormData(form);
        var data = {};
        formData.forEach(function(value, key) { data[key] = value; });

        var validation = validateForm(app, form, data);
        if (!validation.valid) {
            setFormStatus(app, form, validation.message, 'error');
            ui.showNotification(validation.message, 'error');
            if (validation.firstInvalidField) {
                validation.firstInvalidField.focus();
            }
            return;
        }

        var inquiryType = mapInquiryType(data.inquiry_type);
        var userMessage = data.message ? data.message.trim() : '';
        var finalMessage = userMessage.length >= 10 ? userMessage : buildLeadMessage(app, data, inquiryType);

        if (!finalMessage || finalMessage.trim().length < 10) {
            var messageShort = i18n.t(app.currentLang, 'form.message_short');
            setFormStatus(app, form, messageShort, 'error');
            ui.showNotification(messageShort, 'error');
            return;
        }

        setSubmittingState(app, form, submitBtn, true);
        setFormStatus(app, form, i18n.t(app.currentLang, 'form.sending'), 'info');

        try {
            if (app.USE_DEMO_MODE) {
                await utils.delay(1200);
                setFormStatus(app, form, i18n.t(app.currentLang, 'form.success'), 'success');
                ui.showNotification(i18n.t(app.currentLang, 'form.success'), 'success');
                form.reset();
                clearFormValidationState(form);
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

                setFormStatus(app, form, i18n.t(app.currentLang, 'form.success'), 'success');
                ui.showNotification(i18n.t(app.currentLang, 'form.success'), 'success');
                form.reset();
                clearFormValidationState(form);
            }
        } catch (error) {
            utils.error('Contact form error:', error);
            var message;
            if (error.message === 'REQUEST_TIMEOUT') {
                message = i18n.t(app.currentLang, 'error.timeout');
            } else {
                message = (error && error.message) ? error.message : i18n.t(app.currentLang, 'form.error');
            }
            setFormStatus(app, form, message, 'error');
            ui.showNotification(message, 'error');
        } finally {
            setSubmittingState(app, form, submitBtn, false);
        }
    }

    return {
        initContactForm: initContactForm,
        mapInquiryType: mapInquiryType,
        buildLeadMessage: buildLeadMessage,
        loadRecaptchaScript: loadRecaptchaScript,
        getRecaptchaToken: getRecaptchaToken,
        handleContactSubmit: handleContactSubmit,
        validateForm: validateForm,
        validateSingleField: validateSingleField
    };
})();
