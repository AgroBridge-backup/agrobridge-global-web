/**
 * AgroBridge Legal Pages i18n
 * Lightweight ES/EN translator for legal page chrome and hero content.
 */
(function() {
    'use strict';

    var reviewLangs = ['zh', 'ar', 'ja'];
    var pageByPath = [
        { match: 'privacidad', page: 'privacy' },
        { match: 'terminos', page: 'terms' },
        { match: 'cookies', page: 'cookies' },
        { match: 'datos', page: 'dpa' }
    ];

    var translations = {
        es: {
            'legal.skip': 'Saltar al contenido principal',
            'legal.nav.aria': 'Navegación legal',
            'legal.nav.privacy': 'Privacidad',
            'legal.nav.terms': 'Términos',
            'legal.nav.cookies': 'Cookies',
            'legal.nav.data': 'Datos',
            'legal.downloadPdf': 'Descargar PDF',
            'legal.footer.legal': 'Legal',
            'legal.footer.contact': 'Contacto',
            'legal.cookies.actions.rejectOnly': 'Solo esenciales',
            'legal.cookies.actions.save': 'Guardar preferencias',
            'legal.cookies.confirm.savedTitle': '✓ Preferencias guardadas',
            'legal.cookies.confirm.savedBody': 'Sus preferencias de cookies han sido actualizadas exitosamente.',
            'legal.cookies.confirm.essentialTitle': '✓ Solo cookies esenciales activadas',
            'legal.cookies.confirm.essentialBody': 'Puede volver a activar cookies opcionales cuando lo necesite.',

            'legal.page.privacy.printTitle': 'Política de Privacidad',
            'legal.page.privacy.badge': 'Transparencia Radical',
            'legal.page.privacy.titleMain': 'Su Confianza,',
            'legal.page.privacy.titleAccent': 'Nuestra Responsabilidad',
            'legal.page.privacy.subtitle': 'Protegemos su información con el mismo cuidado que nuestros productos. Cada dato está cifrado con estándares militares y respaldado por TrustChain™.',
            'legal.page.privacy.dateLabel': 'Última actualización:',

            'legal.page.terms.printTitle': 'Términos y Condiciones de Servicio',
            'legal.page.terms.badge': 'Marco Contractual',
            'legal.page.terms.titleMain': 'Términos y',
            'legal.page.terms.titleAccent': 'Condiciones',
            'legal.page.terms.subtitle': 'Establecemos relaciones comerciales claras y justas. Nuestros términos protegen tanto a nuestros clientes como a nuestros productores.',
            'legal.page.terms.dateLabel': 'Última actualización:',

            'legal.page.cookies.printTitle': 'Política de Cookies',
            'legal.page.cookies.badge': 'Transparencia Tecnológica',
            'legal.page.cookies.titleMain': 'Cookies con',
            'legal.page.cookies.titleAccent': 'Propósito',
            'legal.page.cookies.subtitle': 'Utilizamos cookies de forma responsable para mejorar su experiencia. Usted tiene el control total sobre qué cookies desea permitir.',
            'legal.page.cookies.dateLabel': 'Última actualización:',

            'legal.page.dpa.printTitle': 'Acuerdo de Tratamiento de Datos',
            'legal.page.dpa.badge': 'Acuerdo Empresarial',
            'legal.page.dpa.titleMain': 'Acuerdo de',
            'legal.page.dpa.titleAccent': 'Tratamiento de Datos',
            'legal.page.dpa.subtitle': 'Marco contractual para el procesamiento de datos personales en relaciones B2B. Cumplimiento con LFPDPPP, GDPR y estándares internacionales.',
            'legal.page.dpa.dateLabel': 'Vigente desde:',

            'legal.section.privacy.summary': 'Resumen Ejecutivo',
            'legal.section.privacy.collection': 'Datos que Recopilamos',
            'legal.section.privacy.usage': 'Cómo Usamos sus Datos',
            'legal.section.privacy.rights': 'Sus Derechos',
            'legal.section.privacy.security': 'Seguridad de la Información',
            'legal.section.privacy.contact': 'Contacto del DPO',

            'legal.section.cookies.preferences': 'Centro de Preferencias',
            'legal.section.cookies.what': '¿Qué son las Cookies?',
            'legal.section.cookies.manage': 'Cómo Gestionar Cookies',
            'legal.section.cookies.dnt': 'Señal de No Rastrear (DNT)',
            'legal.section.cookies.updates': 'Actualizaciones de esta Política',

            'legal.section.dpa.scope': '1. Alcance y Definiciones',
            'legal.section.dpa.responsibilities': '2. Responsabilidades',
            'legal.section.dpa.security': '3. Medidas de Seguridad',
            'legal.section.dpa.subprocessors': '4. Subcontratistas',
            'legal.section.dpa.incidents': '5. Incidentes de Seguridad',
            'legal.section.dpa.audit': '6. Auditoría',
            'legal.section.dpa.termination': '7. Terminación'
        },
        en: {
            'legal.skip': 'Skip to main content',
            'legal.nav.aria': 'Legal navigation',
            'legal.nav.privacy': 'Privacy',
            'legal.nav.terms': 'Terms',
            'legal.nav.cookies': 'Cookies',
            'legal.nav.data': 'Data Rights',
            'legal.downloadPdf': 'Download PDF',
            'legal.footer.legal': 'Legal',
            'legal.footer.contact': 'Contact',
            'legal.cookies.actions.rejectOnly': 'Essential only',
            'legal.cookies.actions.save': 'Save preferences',
            'legal.cookies.confirm.savedTitle': '✓ Preferences saved',
            'legal.cookies.confirm.savedBody': 'Your cookie preferences have been updated successfully.',
            'legal.cookies.confirm.essentialTitle': '✓ Only essential cookies are active',
            'legal.cookies.confirm.essentialBody': 'You can re-enable optional cookies at any time.',

            'legal.page.privacy.printTitle': 'Privacy Policy',
            'legal.page.privacy.badge': 'Radical Transparency',
            'legal.page.privacy.titleMain': 'Your Trust,',
            'legal.page.privacy.titleAccent': 'Our Responsibility',
            'legal.page.privacy.subtitle': 'We protect your information with the same care we apply to our products. Every data point is encrypted with military-grade standards and backed by TrustChain™.',
            'legal.page.privacy.dateLabel': 'Last update:',

            'legal.page.terms.printTitle': 'Terms and Conditions of Service',
            'legal.page.terms.badge': 'Contract Framework',
            'legal.page.terms.titleMain': 'Terms and',
            'legal.page.terms.titleAccent': 'Conditions',
            'legal.page.terms.subtitle': 'We establish clear and fair commercial relationships. Our terms protect both our clients and our producers.',
            'legal.page.terms.dateLabel': 'Last update:',

            'legal.page.cookies.printTitle': 'Cookie Policy',
            'legal.page.cookies.badge': 'Technology Transparency',
            'legal.page.cookies.titleMain': 'Cookies with',
            'legal.page.cookies.titleAccent': 'Purpose',
            'legal.page.cookies.subtitle': 'We use cookies responsibly to improve your experience. You have full control over which cookies you allow.',
            'legal.page.cookies.dateLabel': 'Last update:',

            'legal.page.dpa.printTitle': 'Data Processing Agreement',
            'legal.page.dpa.badge': 'Enterprise Agreement',
            'legal.page.dpa.titleMain': 'Data Processing',
            'legal.page.dpa.titleAccent': 'Agreement',
            'legal.page.dpa.subtitle': 'Contract framework for personal data processing in B2B relationships. Compliant with LFPDPPP, GDPR, and international standards.',
            'legal.page.dpa.dateLabel': 'Effective since:',

            'legal.section.privacy.summary': 'Executive Summary',
            'legal.section.privacy.collection': 'Data We Collect',
            'legal.section.privacy.usage': 'How We Use Your Data',
            'legal.section.privacy.rights': 'Your Rights',
            'legal.section.privacy.security': 'Information Security',
            'legal.section.privacy.contact': 'DPO Contact',

            'legal.section.cookies.preferences': 'Preference Center',
            'legal.section.cookies.what': 'What Are Cookies?',
            'legal.section.cookies.manage': 'How to Manage Cookies',
            'legal.section.cookies.dnt': 'Do Not Track (DNT) Signal',
            'legal.section.cookies.updates': 'Updates to This Policy',

            'legal.section.dpa.scope': '1. Scope and Definitions',
            'legal.section.dpa.responsibilities': '2. Responsibilities',
            'legal.section.dpa.security': '3. Security Measures',
            'legal.section.dpa.subprocessors': '4. Subprocessors',
            'legal.section.dpa.incidents': '5. Security Incidents',
            'legal.section.dpa.audit': '6. Audit',
            'legal.section.dpa.termination': '7. Termination'
        }
    };

    function detectPage() {
        var path = (window.location.pathname || '').toLowerCase();
        for (var i = 0; i < pageByPath.length; i++) {
            if (path.indexOf(pageByPath[i].match) !== -1) {
                return pageByPath[i].page;
            }
        }
        var explicit = document.documentElement.getAttribute('data-legal-page');
        return explicit || 'privacy';
    }

    function resolveLanguage() {
        var params = new URLSearchParams(window.location.search || '');
        var fromQuery = params.get('lang');
        if (fromQuery === 'es' || fromQuery === 'en') {
            return fromQuery;
        }

        try {
            var stored = window.localStorage ? window.localStorage.getItem('agrobridge-lang') : null;
            if (stored === 'es' || stored === 'en') {
                return stored;
            }
            if (reviewLangs.indexOf(stored) !== -1) {
                return 'en';
            }
        } catch (error) {
            // Ignore storage-restricted mode.
        }

        return document.documentElement.lang === 'en' ? 'en' : 'es';
    }

    function t(lang, key) {
        return (translations[lang] && translations[lang][key]) ||
            (translations.es && translations.es[key]) ||
            key;
    }

    function sanitizeHtml(html) {
        return html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/\bon\w+\s*=/gi, 'data-blocked=');
    }

    function applyTranslation(lang) {
        var page = detectPage();
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('data-ui-language', lang);

        document.querySelectorAll('[data-legal-i18n]').forEach(function(node) {
            var key = node.getAttribute('data-legal-i18n');
            var resolvedKey = key.indexOf('{page}') !== -1 ? key.replace('{page}', page) : key;
            node.textContent = t(lang, resolvedKey);
        });

        document.querySelectorAll('[data-legal-i18n-html]').forEach(function(node) {
            var key = node.getAttribute('data-legal-i18n-html');
            var resolvedKey = key.indexOf('{page}') !== -1 ? key.replace('{page}', page) : key;
            node.innerHTML = sanitizeHtml(t(lang, resolvedKey));
        });

        document.querySelectorAll('[data-legal-i18n-aria-label]').forEach(function(node) {
            var key = node.getAttribute('data-legal-i18n-aria-label');
            var resolvedKey = key.indexOf('{page}') !== -1 ? key.replace('{page}', page) : key;
            node.setAttribute('aria-label', t(lang, resolvedKey));
        });
    }

    window.AgroBridgeLegalI18n = {
        resolveLanguage: resolveLanguage,
        applyTranslation: applyTranslation,
        t: t
    };

    document.addEventListener('DOMContentLoaded', function() {
        applyTranslation(resolveLanguage());
    });
})();
