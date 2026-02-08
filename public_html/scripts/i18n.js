/**
 * AgroBridge Internationalization (i18n) Module
 * @description Translation system with multi-language support
 * @version 3.0.0
 */

window.AgroBridgeI18n = (function() {
    'use strict';

    var utils = window.AgroBridgeUtils;

    var translations = {
        es: {
            'hero.title': 'Excelencia Agr\u00edcola',
            'hero.unique': 'Primer sistema ZTD en M\u00e9xico 100% desarrollado por Mexicanos',
            'search.button': 'VERIFICAR ORIGEN',
            'search.placeholder': 'Ingrese c\u00f3digo (Ej: AGR-2024-001)',
            'title.initial': 'VERIFICACI\u00d3N ZTD',
            'status.ready': 'Listo para verificar',
            'status.verifying': 'Verificando...',
            'status.verified': 'Origen Verificado',
            'error.empty': 'Por favor ingrese un c\u00f3digo de lote',
            'error.format': 'Formato inv\u00e1lido. Use letras, n\u00fameros y guiones.',
            'error.connection': 'Error de conexi\u00f3n. Intente nuevamente.',
            'error.notfound': 'Lote no encontrado en el sistema.',
            'error.ratelimit': 'Espere un momento antes de verificar nuevamente.',
            'form.sending': 'Enviando...',
            'form.success': '\u00a1Solicitud enviada! Nos contactaremos pronto.',
            'form.error': 'Error al enviar. Intente nuevamente.',
            'form.recaptcha': 'reCAPTCHA no configurado. Intente m\u00e1s tarde.',
            'form.submit': 'Solicitar Cotizaci\u00f3n Enterprise'
        },
        en: {
            'hero.title': 'Agricultural Excellence',
            'hero.unique': 'First ZTD System in Mexico 100% Developed by Mexicans',
            'search.button': 'VERIFY ORIGIN',
            'search.placeholder': 'Enter code (Ex: AGR-2024-001)',
            'title.initial': 'ZTD VERIFICATION',
            'status.ready': 'Ready to verify',
            'status.verifying': 'Verifying...',
            'status.verified': 'Origin Verified',
            'error.empty': 'Please enter a lot code',
            'error.format': 'Invalid format. Use letters, numbers, and dashes.',
            'error.connection': 'Connection error. Please try again.',
            'error.notfound': 'Lot not found in the system.',
            'error.ratelimit': 'Please wait before verifying again.',
            'form.sending': 'Sending...',
            'form.success': 'Request sent! We will contact you soon.',
            'form.error': 'Error sending. Please try again.',
            'form.recaptcha': 'reCAPTCHA is not configured. Please try later.',
            'form.submit': 'Request Enterprise Quote'
        },
        zh: {
            'hero.title': '\u519c\u4e1a\u5353\u8d8a',
            'hero.unique': '\u58a8\u897f\u54e5\u9996\u4e2a100%\u7531\u58a8\u897f\u54e5\u4eba\u5f00\u53d1\u7684ZTD\u7cfb\u7edf',
            'search.button': '\u9a8c\u8bc1\u6765\u6e90',
            'search.placeholder': '\u8f93\u5165\u4ee3\u7801 (\u4f8b: AGR-2024-001)',
            'title.initial': 'ZTD\u9a8c\u8bc1',
            'status.ready': '\u51c6\u5907\u9a8c\u8bc1',
            'status.verifying': '\u9a8c\u8bc1\u4e2d...',
            'status.verified': '\u6765\u6e90\u5df2\u9a8c\u8bc1',
            'error.empty': '\u8bf7\u8f93\u5165\u6279\u6b21\u4ee3\u7801',
            'error.format': '\u683c\u5f0f\u65e0\u6548\u3002\u8bf7\u4f7f\u7528\u5b57\u6bcd\u3001\u6570\u5b57\u548c\u8fde\u5b57\u7b26\u3002',
            'error.connection': '\u8fde\u63a5\u9519\u8bef\u3002\u8bf7\u91cd\u8bd5\u3002',
            'error.notfound': '\u7cfb\u7edf\u4e2d\u672a\u627e\u5230\u6279\u6b21\u3002',
            'error.ratelimit': '\u8bf7\u7a0d\u7b49\u518d\u9a8c\u8bc1\u3002',
            'form.sending': '\u53d1\u9001\u4e2d...',
            'form.success': '\u8bf7\u6c42\u5df2\u53d1\u9001\uff01\u6211\u4eec\u4f1a\u5c3d\u5feb\u8054\u7cfb\u60a8\u3002',
            'form.error': '\u53d1\u9001\u9519\u8bef\u3002\u8bf7\u91cd\u8bd5\u3002',
            'form.recaptcha': 'reCAPTCHA \u672a\u914d\u7f6e\u3002\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002',
            'form.submit': '\u8bf7\u6c42\u4f01\u4e1a\u62a5\u4ef7'
        },
        ar: {
            'hero.title': '\u0627\u0644\u062a\u0645\u064a\u0632 \u0627\u0644\u0632\u0631\u0627\u0639\u064a',
            'hero.unique': '\u0623\u0648\u0644 \u0646\u0638\u0627\u0645 ZTD \u0641\u064a \u0627\u0644\u0645\u0643\u0633\u064a\u0643 \u062a\u0645 \u062a\u0637\u0648\u064a\u0631\u0647 100% \u0628\u0648\u0627\u0633\u0637\u0629 \u0627\u0644\u0645\u0643\u0633\u064a\u0643\u064a\u064a\u0646',
            'search.button': '\u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0635\u062f\u0631',
            'search.placeholder': '\u0623\u062f\u062e\u0644 \u0627\u0644\u0631\u0645\u0632 (\u0645\u062b\u0627\u0644: AGR-2024-001)',
            'title.initial': '\u0627\u0644\u062a\u062d\u0642\u0642 ZTD',
            'status.ready': '\u062c\u0627\u0647\u0632 \u0644\u0644\u062a\u062d\u0642\u0642',
            'status.verifying': '\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u062d\u0642\u0642...',
            'status.verified': '\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0635\u062f\u0631',
            'error.empty': '\u0627\u0644\u0631\u062c\u0627\u0621 \u0625\u062f\u062e\u0627\u0644 \u0631\u0645\u0632 \u0627\u0644\u062f\u0641\u0639\u0629',
            'error.format': '\u062a\u0646\u0633\u064a\u0642 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d. \u0627\u0633\u062a\u062e\u062f\u0645 \u0623\u062d\u0631\u0641\u064b\u0627 \u0648\u0623\u0631\u0642\u0627\u0645\u064b\u0627 \u0648\u0634\u0631\u0637\u0627\u062a.',
            'error.connection': '\u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u0627\u062a\u0635\u0627\u0644. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
            'error.notfound': '\u0627\u0644\u062f\u0641\u0639\u0629 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629 \u0641\u064a \u0627\u0644\u0646\u0638\u0627\u0645.',
            'error.ratelimit': '\u064a\u0631\u062c\u0649 \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631 \u0642\u0628\u0644 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
            'form.sending': '\u062c\u0627\u0631\u064a \u0627\u0644\u0625\u0631\u0633\u0627\u0644...',
            'form.success': '\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628! \u0633\u0646\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0642\u0631\u064a\u0628\u0627\u064b.',
            'form.error': '\u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u0625\u0631\u0633\u0627\u0644. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
            'form.recaptcha': 'reCAPTCHA \u063a\u064a\u0631 \u0645\u0647\u064a\u0623. \u062d\u0627\u0648\u0644 \u0644\u0627\u062d\u0642\u0627\u064b.',
            'form.submit': '\u0637\u0644\u0628 \u0639\u0631\u0636 \u0623\u0633\u0639\u0627\u0631 \u0644\u0644\u0634\u0631\u0643\u0627\u062a'
        },
        ja: {
            'hero.title': '\u8fb2\u696d\u306e\u5353\u8d8a\u6027',
            'hero.unique': '\u30e1\u30ad\u30b7\u30b3\u4eba\u306b\u3088\u3063\u3066100\uff05\u958b\u767a\u3055\u308c\u305f\u30e1\u30ad\u30b7\u30b3\u521d\u306eZTD\u30b7\u30b9\u30c6\u30e0',
            'search.button': '\u7523\u5730\u3092\u78ba\u8a8d',
            'search.placeholder': '\u30b3\u30fc\u30c9\u3092\u5165\u529b (\u4f8b: AGR-2024-001)',
            'title.initial': 'ZTD\u691c\u8a3c',
            'status.ready': '\u691c\u8a3c\u6e96\u5099\u5b8c\u4e86',
            'status.verifying': '\u691c\u8a3c\u4e2d...',
            'status.verified': '\u7523\u5730\u78ba\u8a8d\u6e08\u307f',
            'error.empty': '\u30ed\u30c3\u30c8\u30b3\u30fc\u30c9\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044',
            'error.format': '\u7121\u52b9\u306a\u5f62\u5f0f\u3067\u3059\u3002\u82f1\u6570\u5b57\u3068\u30cf\u30a4\u30d5\u30f3\u3092\u4f7f\u7528\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
            'error.connection': '\u63a5\u7d9a\u30a8\u30e9\u30fc\u3002\u3082\u3046\u4e00\u5ea6\u304a\u8a66\u3057\u304f\u3060\u3055\u3044\u3002',
            'error.notfound': '\u30b7\u30b9\u30c6\u30e0\u306b\u30ed\u30c3\u30c8\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3002',
            'error.ratelimit': '\u518d\u5ea6\u78ba\u8a8d\u3059\u308b\u524d\u306b\u304a\u5f85\u3061\u304f\u3060\u3055\u3044\u3002',
            'form.sending': '\u9001\u4fe1\u4e2d...',
            'form.success': '\u30ea\u30af\u30a8\u30b9\u30c8\u304c\u9001\u4fe1\u3055\u308c\u307e\u3057\u305f\uff01\u3059\u3050\u306b\u3054\u9023\u7d61\u3044\u305f\u3057\u307e\u3059\u3002',
            'form.error': '\u9001\u4fe1\u30a8\u30e9\u30fc\u3002\u3082\u3046\u4e00\u5ea6\u304a\u8a66\u3057\u304f\u3060\u3055\u3044\u3002',
            'form.recaptcha': 'reCAPTCHA \u304c\u8a2d\u5b9a\u3055\u308c\u3066\u3044\u307e\u305b\u3093\u3002\u5f8c\u3067\u304a\u8a66\u3057\u304f\u3060\u3055\u3044\u3002',
            'form.submit': '\u4f01\u696d\u898b\u7a4d\u3082\u308a\u3092\u30ea\u30af\u30a8\u30b9\u30c8'
        }
    };

    /**
     * Get translated string
     * @param {string} currentLang - Current language code
     * @param {string} key - Translation key
     * @returns {string} Translated string or key if not found
     */
    function t(currentLang, key) {
        return (translations[currentLang] && translations[currentLang][key]) ||
               (translations['es'] && translations['es'][key]) ||
               key;
    }

    /**
     * Initialize language system, loading saved preference
     * @param {Object} app - The app instance
     */
    function initLanguageSystem(app) {
        app.translations = translations;

        var savedLang = localStorage.getItem('agrobridge-lang');
        if (savedLang && translations[savedLang]) {
            switchLanguage(app, savedLang);
        }
    }

    /**
     * Switch language and update UI
     * @param {Object} app - The app instance
     * @param {string} lang - Language code
     */
    function switchLanguage(app, lang) {
        if (!translations[lang]) return;

        app.currentLang = lang;
        localStorage.setItem('agrobridge-lang', lang);

        // Update all language selects
        document.querySelectorAll('select[id*="lang-select"]').forEach(function(select) {
            select.value = lang;
        });

        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(function(element) {
            var key = element.getAttribute('data-i18n');
            var translation = t(lang, key);
            if (translation !== key) {
                element.textContent = translation;
            }
        });

        // Update search input placeholder
        var searchInputs = document.querySelectorAll('#search-input, #validation-input');
        searchInputs.forEach(function(input) {
            if (input) {
                input.placeholder = t(lang, 'search.placeholder');
            }
        });

        // Update status text
        utils.setText('status-text', t(lang, 'status.ready'));
    }

    return {
        translations: translations,
        t: t,
        initLanguageSystem: initLanguageSystem,
        switchLanguage: switchLanguage
    };
})();
