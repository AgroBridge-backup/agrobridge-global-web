/**
 * AgroBridge Legal Pages - Core Module
 * Shared functionality for all legal pages
 * Version: 1.1.0
 */

class LegalCore {
  constructor() {
    this._boundHandlers = {};
    this._elementHandlers = [];
    this.currentPage = this.detectCurrentPage();
    this.init();
  }

  init() {
    this.setupSkipLink();
    this.setupHeaderScroll();
    this.setupSmoothScroll();
    this.setupProgressiveDisclosure();
    this.setupTabs();
    this.setupPrintHandler();
    this.setupAccessibility();

    if (window.AgroBridgeUtils && window.AgroBridgeUtils.log) {
      window.AgroBridgeUtils.log('LegalCore initialized for page:', this.currentPage);
    }
  }

  /**
   * Track an element event listener for cleanup
   */
  _trackListener(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    this._elementHandlers.push({ element, event, handler, options });
  }

  /**
   * Detect current legal page
   */
  detectCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('privacidad')) return 'privacy';
    if (path.includes('terminos')) return 'terms';
    if (path.includes('cookies')) return 'cookies';
    if (path.includes('datos')) return 'dpa';
    return 'unknown';
  }

  /**
   * Setup skip link functionality
   */
  setupSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      this._boundHandlers.skipLinkClick = (e) => {
        e.preventDefault();
        const target = document.getElementById('main-content');
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      };
      this._trackListener(skipLink, 'click', this._boundHandlers.skipLinkClick);
    }
  }

  /**
   * Setup header scroll effect
   */
  setupHeaderScroll() {
    const header = document.querySelector('.legal-header');
    if (!header) return;

    let ticking = false;

    const updateHeader = () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      ticking = false;
    };

    this._boundHandlers.headerScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };
    this._trackListener(window, 'scroll', this._boundHandlers.headerScroll, { passive: true });
  }

  /**
   * Setup smooth scroll for anchor links
   */
  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      const handler = (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Update URL without jumping
          history.pushState(null, '', href);
        }
      };
      this._trackListener(anchor, 'click', handler);
    });
  }

  /**
   * Setup progressive disclosure (accordion) sections
   */
  setupProgressiveDisclosure() {
    const sections = document.querySelectorAll('.legal-section');

    sections.forEach(section => {
      const header = section.querySelector('.legal-section__header');
      const content = section.querySelector('.legal-section__content');

      if (!header || !content) return;

      const clickHandler = () => {
        const isExpanded = section.classList.contains('expanded');

        // Toggle current section
        section.classList.toggle('expanded');
        header.setAttribute('aria-expanded', !isExpanded);

        // Track interaction
        this.trackEvent('section_toggle', {
          section: header.textContent.trim(),
          expanded: !isExpanded
        });
      };
      this._trackListener(header, 'click', clickHandler);

      // Keyboard support
      const keydownHandler = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      };
      this._trackListener(header, 'keydown', keydownHandler);
    });
  }

  /**
   * Setup tabbed interface
   */
  setupTabs() {
    const tabContainers = document.querySelectorAll('.tabs');

    tabContainers.forEach(container => {
      const tabs = container.querySelectorAll('.tab');
      const panels = document.querySelectorAll('.tab-panel');

      tabs.forEach(tab => {
        const handler = () => {
          const targetId = tab.getAttribute('aria-controls');

          // Deactivate all tabs
          tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
          });

          // Activate clicked tab
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');

          // Hide all panels
          panels.forEach(panel => {
            if (panel.id === targetId) {
              panel.classList.add('active');
            } else {
              panel.classList.remove('active');
            }
          });

          // Track interaction
          this.trackEvent('tab_switch', {
            tab: tab.textContent.trim()
          });
        };
        this._trackListener(tab, 'click', handler);
      });
    });
  }

  /**
   * Setup print handler
   */
  setupPrintHandler() {
    // Add print button functionality
    document.querySelectorAll('[data-action="print"]').forEach(btn => {
      const handler = () => {
        window.print();
        this.trackEvent('print_page');
      };
      this._trackListener(btn, 'click', handler);
    });

    // Handle before/after print events
    this._boundHandlers.beforePrint = () => {
      document.body.classList.add('printing');
      this.trackEvent('print_initiated');
    };
    this._boundHandlers.afterPrint = () => {
      document.body.classList.remove('printing');
    };
    this._trackListener(window, 'beforeprint', this._boundHandlers.beforePrint);
    this._trackListener(window, 'afterprint', this._boundHandlers.afterPrint);
  }

  /**
   * Setup accessibility enhancements
   */
  setupAccessibility() {
    // Focus management for modals/dialogs
    this.setupFocusManagement();

    // Announce page changes for screen readers
    this.announcePageLoad();
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Trap focus in modal containers
    const modals = document.querySelectorAll('[role="dialog"]');

    modals.forEach(modal => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      const handler = (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      };
      this._trackListener(modal, 'keydown', handler);
    });
  }

  /**
   * Announce page load to screen readers
   */
  announcePageLoad() {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'visually-hidden';
    announcement.textContent = `Pagina cargada: ${document.title}`;

    document.body.appendChild(announcement);

    setTimeout(() => {
      announcement.remove();
    }, 1000);
  }

  /**
   * Track events (placeholder for analytics integration)
   */
  trackEvent(eventName, data = {}) {
    // Dispatch custom event for analytics
    window.dispatchEvent(new CustomEvent('legal:track', {
      detail: { event: eventName, data, page: this.currentPage }
    }));

    // Debug log for development
    if (window.AgroBridgeUtils && window.AgroBridgeUtils.log) {
      window.AgroBridgeUtils.log('LegalCore Event:', eventName, data);
    }
  }

  /**
   * Utility: Debounce function (delegates to shared AgroBridgeUtils)
   */
  debounce(func, wait) {
    return window.AgroBridgeUtils.debounce(func, wait);
  }

  /**
   * Utility: Throttle function (delegates to shared AgroBridgeUtils)
   */
  throttle(func, limit) {
    return window.AgroBridgeUtils.throttle(func, limit);
  }

  /**
   * Remove all event listeners and clean up resources
   */
  destroy() {
    // Remove all tracked element listeners
    this._elementHandlers.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this._elementHandlers = [];
    this._boundHandlers = {};

    if (window.AgroBridgeUtils && window.AgroBridgeUtils.log) {
      window.AgroBridgeUtils.log('LegalCore destroyed');
    }
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.legalCore = new LegalCore();
  });
} else {
  window.legalCore = new LegalCore();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LegalCore;
}
