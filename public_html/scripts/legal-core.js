/**
 * AgroBridge Legal Pages - Core Module
 * Shared functionality for all legal pages
 * Version: 1.0.0
 */

class LegalCore {
  constructor() {
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
    
    console.log('[LegalCore] Initialized for page:', this.currentPage);
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
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById('main-content');
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
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

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * Setup smooth scroll for anchor links
   */
  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
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
      });
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

      header.addEventListener('click', () => {
        const isExpanded = section.classList.contains('expanded');
        
        // Close all other sections (optional - remove for multiple open)
        // sections.forEach(s => {
        //   if (s !== section) {
        //     s.classList.remove('expanded');
        //     s.querySelector('.legal-section__header')?.setAttribute('aria-expanded', 'false');
        //   }
        // });
        
        // Toggle current section
        section.classList.toggle('expanded');
        header.setAttribute('aria-expanded', !isExpanded);
        
        // Track interaction
        this.trackEvent('section_toggle', {
          section: header.textContent.trim(),
          expanded: !isExpanded
        });
      });

      // Keyboard support
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
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
        tab.addEventListener('click', () => {
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
        });
      });
    });
  }

  /**
   * Setup print handler
   */
  setupPrintHandler() {
    // Add print button functionality
    document.querySelectorAll('[data-action="print"]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.print();
        this.trackEvent('print_page');
      });
    });

    // Handle before/after print events
    window.addEventListener('beforeprint', () => {
      document.body.classList.add('printing');
      this.trackEvent('print_initiated');
    });

    window.addEventListener('afterprint', () => {
      document.body.classList.remove('printing');
    });
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
      
      modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      });
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
    announcement.textContent = `Página cargada: ${document.title}`;
    
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
    
    // Console log for debugging
    if (window.location.hostname === 'localhost') {
      console.log('[LegalCore] Event:', eventName, data);
    }
  }

  /**
   * Utility: Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Utility: Throttle function
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
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
