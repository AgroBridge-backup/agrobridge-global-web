/**
 * AgroBridge Legal Pages - Utilities
 * Helper functions for legal pages
 * Version: 1.1.0
 */

const LegalUtils = {
  /**
   * Internal: tracked event listeners for cleanup
   */
  _elementHandlers: [],
  _boundHandlers: {},

  /**
   * Track an element event listener for cleanup
   */
  _trackListener: function(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    this._elementHandlers.push({ element, event, handler, options });
  },

  /**
   * Download page as PDF
   */
  downloadPDF: function(pageType) {
    const pageNames = {
      'privacy': 'Politica-de-Privacidad',
      'terms': 'Terminos-y-Condiciones',
      'cookies': 'Politica-de-Cookies',
      'dpa': 'Acuerdo-de-Tratamiento-de-Datos'
    };

    const filename = `${pageNames[pageType] || 'Documento'}-AgroBridge.pdf`;

    // Trigger print dialog with PDF option
    window.print();

    // Track event
    this.trackEvent('pdf_download', { page: pageType });
  },

  /**
   * Copy text to clipboard
   */
  copyToClipboard: async function(text, buttonElement) {
    try {
      await navigator.clipboard.writeText(text);

      // Visual feedback
      if (buttonElement) {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Copiado!';
        buttonElement.classList.add('btn--success');

        setTimeout(() => {
          buttonElement.textContent = originalText;
          buttonElement.classList.remove('btn--success');
        }, 2000);
      }

      return true;
    } catch (err) {
      if (window.AgroBridgeUtils && window.AgroBridgeUtils.error) {
        window.AgroBridgeUtils.error('Failed to copy:', err);
      } else {
        console.error('[AgroBridge] Failed to copy:', err);
      }
      return false;
    }
  },

  /**
   * Format date for display
   */
  formatDate: function(date, locale = 'es-MX') {
    const d = new Date(date);
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Format date for legal documents (formal)
   */
  formatLegalDate: function(date) {
    const d = new Date(date);
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
  },

  /**
   * Sanitize HTML to prevent XSS
   */
  sanitizeHTML: function(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  },

  /**
   * Debounce function (delegates to shared AgroBridgeUtils)
   */
  debounce: function(func, wait) {
    return window.AgroBridgeUtils.debounce(func, wait);
  },

  /**
   * Throttle function (delegates to shared AgroBridgeUtils)
   */
  throttle: function(func, limit) {
    return window.AgroBridgeUtils.throttle(func, limit);
  },

  /**
   * Track event (analytics wrapper)
   */
  trackEvent: function(eventName, data = {}) {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('legal:track', {
      detail: { event: eventName, data }
    }));

    // Send to dataLayer for GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...data
      });
    }

    // Debug log for development
    if (window.AgroBridgeUtils && window.AgroBridgeUtils.log) {
      window.AgroBridgeUtils.log('LegalUtils Event:', eventName, data);
    }
  },

  /**
   * Get URL parameters
   */
  getUrlParams: function() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },

  /**
   * Scroll to element smoothly
   */
  scrollTo: function(selector, offset = 80) {
    const element = document.querySelector(selector);
    if (element) {
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  },

  /**
   * Check if element is in viewport
   */
  isInViewport: function(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * Get reading time estimate
   */
  getReadingTime: function(text, wordsPerMinute = 200) {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  },

  /**
   * Format reading time for display
   */
  formatReadingTime: function(minutes) {
    if (minutes < 1) return 'Menos de 1 minuto';
    if (minutes === 1) return '1 minuto';
    return `${minutes} minutos`;
  },

  /**
   * Generate table of contents from headings
   */
  generateTOC: function(containerSelector, headingSelector = 'h2, h3') {
    const container = document.querySelector(containerSelector);
    if (!container) return [];

    const headings = container.querySelectorAll(headingSelector);
    const toc = [];

    headings.forEach((heading, index) => {
      const id = heading.id || `section-${index}`;
      heading.id = id;

      toc.push({
        id,
        text: heading.textContent,
        level: parseInt(heading.tagName.charAt(1)),
        element: heading
      });
    });

    return toc;
  },

  /**
   * Render table of contents
   */
  renderTOC: function(toc, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container || toc.length === 0) return;

    const ul = document.createElement('ul');
    ul.className = 'toc-list';

    toc.forEach(item => {
      const li = document.createElement('li');
      li.className = `toc-item toc-item--level-${item.level}`;

      const a = document.createElement('a');
      a.href = `#${item.id}`;
      a.textContent = item.text;
      a.className = 'toc-link';

      const handler = (e) => {
        e.preventDefault();
        this.scrollTo(`#${item.id}`);
        history.pushState(null, '', `#${item.id}`);
      };
      this._trackListener(a, 'click', handler);

      li.appendChild(a);
      ul.appendChild(li);
    });

    container.innerHTML = '';
    container.appendChild(ul);
  },

  /**
   * Highlight active section in TOC on scroll
   */
  highlightActiveTOC: function(tocContainerSelector, offset = 100) {
    const tocContainer = document.querySelector(tocContainerSelector);
    if (!tocContainer) return;

    const links = tocContainer.querySelectorAll('.toc-link');
    const sections = [];

    links.forEach(link => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        sections.push({ link, target });
      }
    });

    const onScroll = this.throttle(() => {
      const scrollPos = window.pageYOffset + offset;

      sections.forEach(({ link, target }) => {
        const top = target.offsetTop;
        const bottom = top + target.offsetHeight;

        if (scrollPos >= top && scrollPos < bottom) {
          links.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, 100);

    this._boundHandlers.tocScroll = onScroll;
    this._trackListener(window, 'scroll', onScroll, { passive: true });
    onScroll(); // Initial check
  },

  /**
   * Validate email format
   */
  isValidEmail: function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Format number with locale
   */
  formatNumber: function(num, locale = 'es-MX') {
    return new Intl.NumberFormat(locale).format(num);
  },

  /**
   * Format bytes to human readable
   */
  formatBytes: function(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  /**
   * Detect user's preferred color scheme
   */
  getPreferredColorScheme: function() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  },

  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: function() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Local storage wrapper with error handling
   */
  storage: {
    get: function(key) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        if (window.AgroBridgeUtils && window.AgroBridgeUtils.warn) {
          window.AgroBridgeUtils.warn('Storage get error:', e);
        }
        return null;
      }
    },

    set: function(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        if (window.AgroBridgeUtils && window.AgroBridgeUtils.warn) {
          window.AgroBridgeUtils.warn('Storage set error:', e);
        }
        return false;
      }
    },

    remove: function(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        if (window.AgroBridgeUtils && window.AgroBridgeUtils.warn) {
          window.AgroBridgeUtils.warn('Storage remove error:', e);
        }
        return false;
      }
    }
  },

  /**
   * Initialize all utility features
   */
  init: function() {
    // Reset tracked handlers from any previous init
    this._elementHandlers = [];
    this._boundHandlers = {};

    // Add print button handlers
    document.querySelectorAll('[data-action="print"]').forEach(btn => {
      const handler = () => window.print();
      this._trackListener(btn, 'click', handler);
    });

    // Add copy button handlers
    document.querySelectorAll('[data-action="copy"]').forEach(btn => {
      const handler = () => {
        const text = btn.dataset.copyText;
        if (text) {
          this.copyToClipboard(text, btn);
        }
      };
      this._trackListener(btn, 'click', handler);
    });

    if (window.AgroBridgeUtils && window.AgroBridgeUtils.log) {
      window.AgroBridgeUtils.log('LegalUtils initialized');
    }
  },

  /**
   * Remove all event listeners and clean up resources
   */
  destroy: function() {
    // Remove all tracked element listeners
    this._elementHandlers.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this._elementHandlers = [];
    this._boundHandlers = {};

    if (window.AgroBridgeUtils && window.AgroBridgeUtils.log) {
      window.AgroBridgeUtils.log('LegalUtils destroyed');
    }
  }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    LegalUtils.init();
  });
} else {
  LegalUtils.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LegalUtils;
}
