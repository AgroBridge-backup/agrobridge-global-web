(function() {
  'use strict';

  function initCookiePreferencesPage() {
    var saveButton = document.getElementById('btn-save');
    var rejectButton = document.getElementById('btn-reject-all');
    var functionalToggle = document.getElementById('toggle-functional');
    var analyticsToggle = document.getElementById('toggle-analytics');

    if (!saveButton || !rejectButton || !functionalToggle || !analyticsToggle) {
      return;
    }

    var manager = window.cookieConsentManager;
    var legalI18n = window.AgroBridgeLegalI18n;
    var currentLang = legalI18n && typeof legalI18n.resolveLanguage === 'function'
      ? legalI18n.resolveLanguage()
      : (document.documentElement.lang === 'en' ? 'en' : 'es');

    function legalText(key, fallback) {
      if (legalI18n && typeof legalI18n.t === 'function') {
        var translated = legalI18n.t(currentLang, key);
        if (translated && translated !== key) {
          return translated;
        }
      }

      return fallback;
    }

    function updateConfirmation(titleKey, bodyKey) {
      var confirmation = document.getElementById('save-confirmation');
      if (!confirmation) {
        return;
      }

      var titleElement = confirmation.querySelector('.info-box__title');
      var bodyElement = confirmation.querySelector('p');

      if (titleElement) {
        titleElement.textContent = legalText(titleKey, titleElement.textContent);
      }

      if (bodyElement) {
        bodyElement.textContent = legalText(bodyKey, bodyElement.textContent);
      }

      confirmation.style.display = 'block';
      setTimeout(function() {
        confirmation.style.display = 'none';
      }, 3000);
    }

    if (manager && manager.consent && manager.consent.preferences) {
      functionalToggle.checked = Boolean(manager.consent.preferences.functional);
      analyticsToggle.checked = Boolean(manager.consent.preferences.analytics);
    }

    saveButton.addEventListener('click', function() {
      var preferences = {
        essential: true,
        functional: functionalToggle.checked,
        analytics: analyticsToggle.checked,
        marketing: false
      };

      if (manager) {
        manager.customize(preferences);
        updateConfirmation('legal.cookies.confirm.savedTitle', 'legal.cookies.confirm.savedBody');
      }
    });

    rejectButton.addEventListener('click', function() {
      functionalToggle.checked = false;
      analyticsToggle.checked = false;

      if (manager) {
        manager.rejectOptional();
        updateConfirmation('legal.cookies.confirm.essentialTitle', 'legal.cookies.confirm.essentialBody');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookiePreferencesPage);
  } else {
    initCookiePreferencesPage();
  }
})();
