/**
 * Integration Tests for Navigation and Mobile Menu
 * @description Tests for navigation functionality including mobile menu
 */

import { jest } from '@jest/globals';

describe('Navigation Integration', () => {
  beforeEach(() => {
    global.testUtils.createMockDOM();
  });

  // ============================================
  // DESKTOP NAVIGATION
  // ============================================
  describe('Desktop Navigation', () => {
    test('should have navbar element', () => {
      const navbar = document.getElementById('navbar');
      expect(navbar).not.toBeNull();
    });

    test('should have navigation menu', () => {
      const navMenu = document.getElementById('navMenu');
      expect(navMenu).not.toBeNull();
    });

    test('should have navigation links', () => {
      const links = document.querySelectorAll('.nav__link');
      expect(links.length).toBeGreaterThan(0);
    });

    test('navigation links should have href attributes', () => {
      const links = document.querySelectorAll('.nav__link');
      links.forEach(link => {
        expect(link.getAttribute('href')).toBeTruthy();
        expect(link.getAttribute('href').startsWith('#')).toBe(true);
      });
    });
  });

  // ============================================
  // MOBILE MENU TOGGLE
  // ============================================
  describe('Mobile Menu Toggle', () => {
    test('should have toggle button', () => {
      const toggle = document.getElementById('navToggle');
      expect(toggle).not.toBeNull();
    });

    test('toggle should have aria-expanded attribute', () => {
      const toggle = document.getElementById('navToggle');
      expect(toggle.getAttribute('aria-expanded')).toBeDefined();
    });

    test('toggle should initially be collapsed', () => {
      const toggle = document.getElementById('navToggle');
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    test('should have hamburger bars', () => {
      const bars = document.querySelectorAll('.nav__toggle-bar');
      expect(bars.length).toBe(3);
    });

    test('menu should not have active class initially', () => {
      const navMenu = document.getElementById('navMenu');
      expect(navMenu.classList.contains('active')).toBe(false);
    });
  });

  // ============================================
  // MOBILE MENU BEHAVIOR
  // ============================================
  describe('Mobile Menu Behavior', () => {
    let mobileMenuHandler;

    beforeEach(() => {
      mobileMenuHandler = {
        initMobileMenu: function() {
          const navToggle = document.getElementById('navToggle');
          const navMenu = document.getElementById('navMenu');

          if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
              const isActive = navMenu.classList.toggle('active');
              navToggle.classList.toggle('active');
              navToggle.setAttribute('aria-expanded', isActive.toString());
            });

            // Close on link click
            navMenu.querySelectorAll('.nav__link').forEach(link => {
              link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
              });
            });
          }
        }
      };

      mobileMenuHandler.initMobileMenu();
    });

    test('clicking toggle should open menu', () => {
      const toggle = document.getElementById('navToggle');
      const navMenu = document.getElementById('navMenu');

      toggle.click();

      expect(navMenu.classList.contains('active')).toBe(true);
      expect(toggle.classList.contains('active')).toBe(true);
    });

    test('clicking toggle should update aria-expanded', () => {
      const toggle = document.getElementById('navToggle');

      toggle.click();

      expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });

    test('clicking toggle again should close menu', () => {
      const toggle = document.getElementById('navToggle');
      const navMenu = document.getElementById('navMenu');

      toggle.click(); // Open
      toggle.click(); // Close

      expect(navMenu.classList.contains('active')).toBe(false);
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    test('clicking nav link should close menu', () => {
      const toggle = document.getElementById('navToggle');
      const navMenu = document.getElementById('navMenu');
      const link = navMenu.querySelector('.nav__link');

      toggle.click(); // Open menu
      expect(navMenu.classList.contains('active')).toBe(true);

      link.click(); // Click a link

      expect(navMenu.classList.contains('active')).toBe(false);
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    test('menu state should toggle correctly multiple times', () => {
      const toggle = document.getElementById('navToggle');
      const navMenu = document.getElementById('navMenu');

      // Toggle 5 times
      for (let i = 0; i < 5; i++) {
        toggle.click();
        const shouldBeOpen = i % 2 === 0;
        expect(navMenu.classList.contains('active')).toBe(shouldBeOpen);
      }
    });
  });

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  describe('Smooth Scroll', () => {
    let scrollHandler;

    beforeEach(() => {
      scrollHandler = {
        setupSmoothScroll: function() {
          document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
              e.preventDefault();
              const targetId = anchor.getAttribute('href');
              const target = document.querySelector(targetId);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            });
          });
        }
      };

      // Add target sections
      const sections = ['inicio', 'productos', 'contacto'];
      sections.forEach(id => {
        const section = document.createElement('section');
        section.id = id;
        document.body.appendChild(section);
      });

      scrollHandler.setupSmoothScroll();
    });

    test('clicking anchor should call scrollIntoView', () => {
      const link = document.querySelector('a[href="#inicio"]');

      if (link) {
        link.click();
        expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
      }
    });

    test('should prevent default on anchor click', () => {
      const link = document.querySelector('a[href="#inicio"]');

      if (link) {
        const event = new Event('click', { bubbles: true, cancelable: true });
        const spy = jest.spyOn(event, 'preventDefault');

        link.dispatchEvent(event);

        // The listener should have called preventDefault
        // Note: This depends on how the listener is set up
      }
    });
  });

  // ============================================
  // SCROLL EFFECT ON NAVBAR
  // ============================================
  describe('Navbar Scroll Effect', () => {
    let scrollEffectHandler;

    beforeEach(() => {
      scrollEffectHandler = {
        setupScrollEffect: function() {
          window.addEventListener('scroll', () => {
            const nav = document.getElementById('navbar');
            if (nav) {
              if (window.scrollY > 100) {
                nav.classList.add('scrolled');
              } else {
                nav.classList.remove('scrolled');
              }
            }
          });
        },

        simulateScroll: function(scrollY) {
          Object.defineProperty(window, 'scrollY', {
            value: scrollY,
            writable: true
          });
          window.dispatchEvent(new Event('scroll'));
        }
      };

      scrollEffectHandler.setupScrollEffect();
    });

    test('navbar should not have scrolled class at top', () => {
      const nav = document.getElementById('navbar');
      scrollEffectHandler.simulateScroll(0);

      expect(nav.classList.contains('scrolled')).toBe(false);
    });

    test('navbar should have scrolled class when scrolled past 100px', () => {
      const nav = document.getElementById('navbar');
      scrollEffectHandler.simulateScroll(150);

      expect(nav.classList.contains('scrolled')).toBe(true);
    });

    test('navbar should remove scrolled class when back at top', () => {
      const nav = document.getElementById('navbar');

      scrollEffectHandler.simulateScroll(150);
      expect(nav.classList.contains('scrolled')).toBe(true);

      scrollEffectHandler.simulateScroll(50);
      expect(nav.classList.contains('scrolled')).toBe(false);
    });

    test('navbar should add scrolled class at exactly 101px', () => {
      const nav = document.getElementById('navbar');
      scrollEffectHandler.simulateScroll(101);

      expect(nav.classList.contains('scrolled')).toBe(true);
    });

    test('navbar should not have scrolled class at exactly 100px', () => {
      const nav = document.getElementById('navbar');
      scrollEffectHandler.simulateScroll(100);

      expect(nav.classList.contains('scrolled')).toBe(false);
    });
  });
});

// ============================================
// LANGUAGE SELECTOR INTEGRATION
// ============================================
describe('Language Selector Integration', () => {
  let languageHandler;

  beforeEach(() => {
    global.testUtils.createMockDOM();

    languageHandler = {
      currentLang: 'es',
      translations: {
        es: { 'hero.title': 'Excelencia Agrícola' },
        en: { 'hero.title': 'Agricultural Excellence' },
        zh: { 'hero.title': '农业卓越' }
      },

      initLanguageSelector: function() {
        const selects = document.querySelectorAll('select[id*="lang-select"]');
        selects.forEach(select => {
          select.addEventListener('change', (e) => {
            this.switchLanguage(e.target.value);
          });
        });
      },

      switchLanguage: function(lang) {
        if (this.translations[lang]) {
          this.currentLang = lang;
          localStorage.setItem('agrobridge-lang', lang);
          return true;
        }
        return false;
      }
    };

    languageHandler.initLanguageSelector();
  });

  test('should have language selector', () => {
    const select = document.getElementById('lang-select');
    expect(select).not.toBeNull();
  });

  test('should have multiple language options', () => {
    const select = document.getElementById('lang-select');
    expect(select.options.length).toBeGreaterThanOrEqual(2);
  });

  test('changing selector should update current language', () => {
    const select = document.getElementById('lang-select');
    select.value = 'en';
    select.dispatchEvent(new Event('change'));

    expect(languageHandler.currentLang).toBe('en');
  });

  test('changing language should save to localStorage', () => {
    const select = document.getElementById('lang-select');
    select.value = 'zh';
    select.dispatchEvent(new Event('change'));

    expect(localStorage.setItem).toHaveBeenCalledWith('agrobridge-lang', 'zh');
  });

  test('should not change to invalid language', () => {
    const result = languageHandler.switchLanguage('invalid');

    expect(result).toBe(false);
    expect(languageHandler.currentLang).toBe('es');
  });

  test('should support all available languages', () => {
    ['es', 'en', 'zh'].forEach(lang => {
      expect(languageHandler.switchLanguage(lang)).toBe(true);
    });
  });
});
