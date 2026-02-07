/**
 * AgroBridge Legal Pages - Cookie Consent Manager
 * GDPR/LFPDPPP compliant cookie consent
 * Version: 1.0.0
 */

class CookieConsentManager {
  constructor(options = {}) {
    this.STORAGE_KEY = options.storageKey || 'agrobridge_consent_v1';
    this.CATEGORIES = ['essential', 'functional', 'analytics', 'marketing'];
    this.VERSION = '1.0';
    this.EXPIRY_DAYS = 180;
    
    this.consent = null;
    this.banner = null;
    this.preferencesModal = null;
    
    this.init();
  }

  init() {
    // Check if we need to show banner
    this.consent = this.loadConsent();
    
    if (!this.consent || this.isConsentExpired()) {
      // Delay banner display for better UX
      setTimeout(() => {
        this.showBanner();
      }, 1500);
    } else {
      this.applyPreferences(this.consent.preferences);
    }
    
    // Bind events
    this.bindEvents();
    
    // Respect Do Not Track
    if (this.isDoNotTrackEnabled()) {
      this.rejectAll();
    }
    
    // Make instance globally available
    window.cookieConsentManager = this;
    
    console.log('[CookieConsent] Initialized');
  }

  /**
   * Load consent from storage
   */
  loadConsent() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[CookieConsent] Failed to load consent:', e);
    }
    return null;
  }

  /**
   * Save consent to storage
   */
  saveConsent(preferences) {
    const consent = {
      preferences,
      timestamp: new Date().toISOString(),
      version: this.VERSION,
      userAgent: navigator.userAgent.substring(0, 100)
    };
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(consent));
      this.consent = consent;
      
      // Set cookie for server-side access
      this.setCookie('agrobridge_consent', JSON.stringify(preferences), this.EXPIRY_DAYS);
      
      this.hideBanner();
      this.applyPreferences(preferences);
      this.fireEvent('consent:updated', consent);
      
      return true;
    } catch (e) {
      console.error('[CookieConsent] Failed to save consent:', e);
      return false;
    }
  }

  /**
   * Set a cookie
   */
  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  /**
   * Get a cookie
   */
  getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
      return decodeURIComponent(match[2]);
    }
    return null;
  }

  /**
   * Check if consent is expired
   */
  isConsentExpired() {
    if (!this.consent?.timestamp) return true;
    
    const consentDate = new Date(this.consent.timestamp);
    const now = new Date();
    const daysSince = (now - consentDate) / (1000 * 60 * 60 * 24);
    
    return daysSince > this.EXPIRY_DAYS;
  }

  /**
   * Check if Do Not Track is enabled
   */
  isDoNotTrackEnabled() {
    return navigator.doNotTrack === '1' || 
           navigator.doNotTrack === 'yes' ||
           window.doNotTrack === '1' ||
           navigator.msDoNotTrack === '1';
  }

  /**
   * Show cookie banner
   */
  showBanner() {
    this.banner = document.getElementById('cookie-banner');
    
    if (!this.banner) {
      this.createBanner();
    }
    
    if (this.banner) {
      this.banner.classList.add('visible');
      this.banner.setAttribute('aria-hidden', 'false');
      this.fireEvent('consent:banner:shown');
    }
  }

  /**
   * Hide cookie banner
   */
  hideBanner() {
    if (this.banner) {
      this.banner.classList.remove('visible');
      this.banner.setAttribute('aria-hidden', 'true');
      
      // Remove from DOM after animation
      setTimeout(() => {
        if (!this.banner.classList.contains('visible')) {
          this.banner.style.display = 'none';
        }
      }, 500);
    }
  }

  /**
   * Create cookie banner HTML
   */
  createBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-labelledby', 'cookie-banner-title');
    banner.setAttribute('aria-describedby', 'cookie-banner-desc');
    
    banner.innerHTML = `
      <div class="cookie-banner__container">
        <div class="cookie-banner__icon" aria-hidden="true">🍪</div>
        <div class="cookie-banner__content">
          <h2 id="cookie-banner-title" class="cookie-banner__title">Respetamos su privacidad</h2>
          <p id="cookie-banner-desc" class="cookie-banner__text">
            Utilizamos cookies esenciales para el funcionamiento del sitio y, con su consentimiento, 
            cookies analíticas para mejorar su experiencia. 
            <a href="/legal/cookies.html" class="text-primary">Más información</a>
          </p>
        </div>
        <div class="cookie-banner__actions">
          <button id="cookie-reject-optional" class="btn btn--ghost btn--small">
            Solo esenciales
          </button>
          <button id="cookie-customize" class="btn btn--secondary btn--small">
            Personalizar
          </button>
          <button id="cookie-accept-all" class="btn btn--primary btn--small">
            Aceptar todas
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    this.banner = banner;
    
    // Bind new buttons
    this.bindBannerEvents();
  }

  /**
   * Bind banner events
   */
  bindBannerEvents() {
    const acceptAllBtn = document.getElementById('cookie-accept-all');
    const rejectOptionalBtn = document.getElementById('cookie-reject-optional');
    const customizeBtn = document.getElementById('cookie-customize');
    
    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', () => this.acceptAll());
    }
    
    if (rejectOptionalBtn) {
      rejectOptionalBtn.addEventListener('click', () => this.rejectOptional());
    }
    
    if (customizeBtn) {
      customizeBtn.addEventListener('click', () => {
        window.location.href = '/legal/cookies.html#preferences';
      });
    }
  }

  /**
   * Bind global events
   */
  bindEvents() {
    // Listen for preference changes from cookies page
    document.addEventListener('cookie-preferences-changed', (e) => {
      this.saveConsent(e.detail.preferences);
    });
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.banner?.classList.contains('visible')) {
        this.rejectOptional();
      }
    });
  }

  /**
   * Accept all cookies
   */
  acceptAll() {
    const preferences = this.CATEGORIES.reduce((acc, cat) => {
      acc[cat] = true;
      return acc;
    }, {});
    
    this.saveConsent(preferences);
    this.fireEvent('consent:accept-all');
    this.showToast('Preferencias guardadas', 'success');
  }

  /**
   * Reject optional cookies (only essential)
   */
  rejectOptional() {
    const preferences = this.CATEGORIES.reduce((acc, cat) => {
      acc[cat] = cat === 'essential';
      return acc;
    }, {});
    
    this.saveConsent(preferences);
    this.fireEvent('consent:reject-optional');
    this.showToast('Solo cookies esenciales activadas', 'info');
  }

  /**
   * Customize preferences
   */
  customize(preferences) {
    // Ensure essential is always true
    preferences.essential = true;
    this.saveConsent(preferences);
    this.fireEvent('consent:customize');
    this.showToast('Preferencias personalizadas guardadas', 'success');
  }

  /**
   * Check if user has consented to a category
   */
  hasConsent(category) {
    return this.consent?.preferences?.[category] || false;
  }

  /**
   * Apply preferences (enable/disable scripts)
   */
  applyPreferences(preferences) {
    // Enable analytics if consented
    if (preferences.analytics) {
      this.loadAnalytics();
    } else {
      this.disableAnalytics();
    }
    
    // Enable functional features if consented
    if (preferences.functional) {
      this.enableFunctionalFeatures();
    } else {
      this.disableFunctionalFeatures();
    }
    
    // Marketing cookies (future use)
    if (preferences.marketing) {
      this.loadMarketing();
    }
  }

  /**
   * Load analytics scripts
   */
  loadAnalytics() {
    if (window.gtag || window.gaLoaded) return;
    
    // Google Analytics 4
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'; // Replace with actual ID
    
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() { dataLayer.push(arguments); };
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX', { 
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
    };
    
    document.head.appendChild(script);
    window.gaLoaded = true;
    
    console.log('[CookieConsent] Analytics loaded');
  }

  /**
   * Disable analytics
   */
  disableAnalytics() {
    // Disable Google Analytics
    window['ga-disable-G-XXXXXXXXXX'] = true;
    
    // Remove any existing analytics cookies
    this.deleteCookie('_ga');
    this.deleteCookie('_gid');
    this.deleteCookie('_gat');
  }

  /**
   * Enable functional features
   */
  enableFunctionalFeatures() {
    // Enable language preference storage
    // Enable accessibility settings
    // Enable form autofill
    document.body.classList.add('functional-cookies-enabled');
  }

  /**
   * Disable functional features
   */
  disableFunctionalFeatures() {
    document.body.classList.remove('functional-cookies-enabled');
  }

  /**
   * Load marketing scripts (future use)
   */
  loadMarketing() {
    // Reserved for future marketing/personalization cookies
    console.log('[CookieConsent] Marketing cookies enabled (reserved)');
  }

  /**
   * Delete a cookie
   */
  deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'status');
    const safeMessage = String(message).replace(/[&<>"'`=\/]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
      "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
    })[char]);
    toast.innerHTML = `
      <span class="toast__icon">${type === 'success' ? '✓' : 'ℹ'}</span>
      <span class="toast__message">${safeMessage}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });
    
    // Auto remove
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Fire custom event
   */
  fireEvent(eventName, detail = {}) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
    
    // Also send to dataLayer for GTM if available
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...detail
      });
    }
  }

  /**
   * Reset consent (for testing)
   */
  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.deleteCookie('agrobridge_consent');
    this.consent = null;
    location.reload();
  }

  /**
   * Get consent status for debugging
   */
  getStatus() {
    return {
      hasConsent: !!this.consent,
      isExpired: this.isConsentExpired(),
      preferences: this.consent?.preferences || null,
      timestamp: this.consent?.timestamp || null,
      version: this.consent?.version || null
    };
  }
}

// Static method to check consent from anywhere
CookieConsentManager.check = function(category) {
  const instance = window.cookieConsentManager;
  return instance ? instance.hasConsent(category) : false;
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CookieConsentManager();
  });
} else {
  new CookieConsentManager();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CookieConsentManager;
}
