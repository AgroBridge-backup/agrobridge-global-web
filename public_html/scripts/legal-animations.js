/**
 * AgroBridge Legal Pages - Animations Module
 * Interaction choreography and scroll animations
 * Version: 1.1.0
 *
 * Load order: 3 of 5. Depends on: window.AgroBridgeUtils (from utils.js).
 * Auto-initializes on DOMContentLoaded -> window.legalAnimations
 */

class LegalAnimations {
  constructor() {
    this._boundHandlers = {};
    this._elementHandlers = [];
    this._observers = [];

    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.init();
  }

  init() {
    this.setupScrollAnimations();
    this.setupStaggerAnimations();
    this.setupParallaxEffects();
    this.setupHoverEffects();
    this.setupCounterAnimations();

    if (window.AgroBridgeUtils && window.AgroBridgeUtils.log) {
      window.AgroBridgeUtils.log('LegalAnimations initialized');
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
   * Setup Intersection Observer for scroll-triggered animations
   */
  setupScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.classList.add('animate-in');
      });
      return;
    }

    this._scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');

          // Stagger children if present
          const children = entry.target.querySelectorAll('.stagger-child');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('animate-in');
            }, index * 100);
          });
        }
      });
    }, this.observerOptions);
    this._observers.push(this._scrollObserver);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      this._scrollObserver.observe(el);
    });
  }

  /**
   * Setup stagger animations for lists and grids
   */
  setupStaggerAnimations() {
    const staggerContainers = document.querySelectorAll('[data-stagger]');

    staggerContainers.forEach(container => {
      const children = container.children;
      const delay = parseInt(container.dataset.stagger) || 100;

      Array.from(children).forEach((child, index) => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(20px)';
        child.style.transition = `opacity 0.5s ease ${index * delay}ms, transform 0.5s ease ${index * delay}ms`;

        // Trigger animation after a small delay
        setTimeout(() => {
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
        }, 100);
      });
    });
  }

  /**
   * Setup parallax effects
   */
  setupParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    if (parallaxElements.length === 0) return;

    let ticking = false;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;

      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });

      ticking = false;
    };

    this._boundHandlers.parallaxScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };
    this._trackListener(window, 'scroll', this._boundHandlers.parallaxScroll, { passive: true });
  }

  /**
   * Setup hover effects with CSS class toggling
   */
  setupHoverEffects() {
    // Magnetic button effect
    const magneticButtons = document.querySelectorAll('.btn--magnetic');

    magneticButtons.forEach(btn => {
      const moveHandler = (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      };

      const leaveHandler = () => {
        btn.style.transform = '';
      };

      this._trackListener(btn, 'mousemove', moveHandler);
      this._trackListener(btn, 'mouseleave', leaveHandler);
    });

    // Card tilt effect
    const tiltCards = document.querySelectorAll('.card--tilt');

    tiltCards.forEach(card => {
      const moveHandler = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      };

      const leaveHandler = () => {
        card.style.transform = '';
      };

      this._trackListener(card, 'mousemove', moveHandler);
      this._trackListener(card, 'mouseleave', leaveHandler);
    });
  }

  /**
   * Setup counter animations for statistics
   */
  setupCounterAnimations() {
    const counters = document.querySelectorAll('[data-counter]');

    if (counters.length === 0) return;

    const animateCounter = (counter) => {
      const target = parseInt(counter.dataset.counter);
      const duration = parseInt(counter.dataset.duration) || 2000;
      const start = 0;
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);

        counter.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toLocaleString();
        }
      };

      requestAnimationFrame(updateCounter);
    };

    // Use Intersection Observer to trigger counter animation
    if ('IntersectionObserver' in window) {
      this._counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            this._counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      this._observers.push(this._counterObserver);

      counters.forEach(counter => this._counterObserver.observe(counter));
    } else {
      // Fallback
      counters.forEach(counter => animateCounter(counter));
    }
  }

  /**
   * Animate element with custom animation
   */
  animate(element, animationName, duration = 500) {
    return new Promise((resolve) => {
      element.style.animation = `${animationName} ${duration}ms ease-out`;

      const handleAnimationEnd = () => {
        element.style.animation = '';
        element.removeEventListener('animationend', handleAnimationEnd);
        resolve();
      };

      element.addEventListener('animationend', handleAnimationEnd);
    });
  }

  /**
   * Fade in element
   */
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-out`;

    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
  }

  /**
   * Fade out element
   */
  fadeOut(element, duration = 300) {
    element.style.transition = `opacity ${duration}ms ease-out`;
    element.style.opacity = '0';

    return new Promise((resolve) => {
      setTimeout(() => {
        element.style.display = 'none';
        resolve();
      }, duration);
    });
  }

  /**
   * Slide in element from direction
   */
  slideIn(element, direction = 'left', duration = 500) {
    const transforms = {
      left: 'translateX(-50px)',
      right: 'translateX(50px)',
      up: 'translateY(50px)',
      down: 'translateY(-50px)'
    };

    element.style.opacity = '0';
    element.style.transform = transforms[direction];
    element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;

    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translate(0)';
    });
  }

  /**
   * Create ripple effect on element
   */
  createRipple(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  /**
   * Reveal text character by character
   */
  typewriter(element, text, speed = 50) {
    return new Promise((resolve) => {
      element.textContent = '';
      let i = 0;

      const type = () => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
        } else {
          resolve();
        }
      };

      type();
    });
  }

  /**
   * Shake element (for error feedback)
   */
  shake(element, intensity = 10) {
    const keyframes = [
      { transform: 'translateX(0)' },
      { transform: `translateX(-${intensity}px)` },
      { transform: `translateX(${intensity}px)` },
      { transform: `translateX(-${intensity}px)` },
      { transform: `translateX(${intensity}px)` },
      { transform: 'translateX(0)' }
    ];

    element.animate(keyframes, {
      duration: 400,
      easing: 'ease-in-out'
    });
  }

  /**
   * Pulse element (for attention)
   */
  pulse(element, duration = 1000) {
    element.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' }
    ], {
      duration: duration,
      iterations: Infinity
    });
  }

  /**
   * Stop all animations on element
   */
  stop(element) {
    element.style.animation = 'none';
    element.style.transition = 'none';

    // Force reflow
    void element.offsetWidth;

    element.style.animation = '';
    element.style.transition = '';
  }

  /**
   * Remove all event listeners, disconnect observers, and clean up resources
   */
  destroy() {
    // Remove all tracked element listeners
    this._elementHandlers.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this._elementHandlers = [];
    this._boundHandlers = {};

    // Disconnect all Intersection Observers
    this._observers.forEach(observer => {
      observer.disconnect();
    });
    this._observers = [];
    this._scrollObserver = null;
    this._counterObserver = null;

    if (window.AgroBridgeUtils && window.AgroBridgeUtils.log) {
      window.AgroBridgeUtils.log('LegalAnimations destroyed');
    }
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.legalAnimations = new LegalAnimations();
  });
} else {
  window.legalAnimations = new LegalAnimations();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LegalAnimations;
}
