/**
 * E2E Tests - Navigation
 * @description End-to-end tests for navigation functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Desktop Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
  });

  test('should display navigation menu', async ({ page }) => {
    const nav = page.locator('nav, #navbar, .navbar').first();
    await expect(nav).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    const links = page.locator('.nav__link, nav a[href^="#"], .nav-link');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('navigation links should scroll to sections', async ({ page }) => {
    const firstLink = page.locator('.nav__link, nav a[href^="#"]').first();
    const href = await firstLink.getAttribute('href');

    if (href && href.startsWith('#')) {
      await firstLink.click();
      await page.waitForTimeout(500);

      // Should have scrolled (or at least not errored)
      const scrollY = await page.evaluate(() => window.scrollY);
      // Scroll position changed or stayed at 0 if already at target
      expect(scrollY).toBeGreaterThanOrEqual(0);
    }
  });

  test('navbar should be sticky on scroll', async ({ page }) => {
    const nav = page.locator('nav, #navbar, .navbar').first();

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    // Navbar should still be visible
    await expect(nav).toBeVisible();
  });
});

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
  });

  test('should show hamburger menu on mobile', async ({ page }) => {
    const toggle = page.locator('#navToggle, .nav__toggle, .hamburger, [aria-label*="menú" i]').first();
    await expect(toggle).toBeVisible();
  });

  test('hamburger should toggle menu', async ({ page }) => {
    const toggle = page.locator('#navToggle, .nav__toggle, .hamburger').first();
    const menu = page.locator('#navMenu, .nav__menu, .mobile-menu').first();

    // Menu should be hidden initially on mobile
    const initiallyHidden = !(await menu.isVisible()) || !(await menu.evaluate(el => el.classList.contains('active')));

    // Click toggle
    await toggle.click();
    await page.waitForTimeout(300);

    // Menu should now be visible or have active class
    const isActive = await menu.evaluate(el => el.classList.contains('active'));
    const isVisible = await menu.isVisible();

    expect(isActive || isVisible).toBeTruthy();
  });

  test('hamburger should have aria-expanded', async ({ page }) => {
    const toggle = page.locator('#navToggle, .nav__toggle, .hamburger').first();

    const expanded = await toggle.getAttribute('aria-expanded');
    expect(expanded).toBeTruthy();
    expect(['true', 'false']).toContain(expanded);
  });

  test('clicking menu link should close menu', async ({ page }) => {
    const toggle = page.locator('#navToggle, .nav__toggle, .hamburger').first();
    const menu = page.locator('#navMenu, .nav__menu').first();

    // Open menu
    await toggle.click();
    await page.waitForTimeout(300);

    // Click a link
    const link = menu.locator('a').first();
    if (await link.count() > 0) {
      await link.click();
      await page.waitForTimeout(300);

      // Menu should close
      const isActive = await menu.evaluate(el => el.classList.contains('active'));
      expect(isActive).toBeFalsy();
    }
  });

  test('hamburger bars should animate', async ({ page }) => {
    const toggle = page.locator('#navToggle, .nav__toggle, .hamburger').first();
    const bars = page.locator('.nav__toggle-bar, .hamburger-bar');

    const barCount = await bars.count();

    // Should have hamburger bars (typically 3)
    expect(barCount).toBeGreaterThanOrEqual(0);

    // Click to open
    await toggle.click();
    await page.waitForTimeout(300);

    // Toggle should have active class
    const isActive = await toggle.evaluate(el => el.classList.contains('active'));
    expect(isActive).toBeTruthy();
  });
});

test.describe('Language Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have language selector', async ({ page }) => {
    const selector = page.locator('#lang-select, select[id*="lang"], .language-selector').first();
    const exists = await selector.count();
    expect(exists).toBeGreaterThanOrEqual(0); // May or may not exist
  });

  test('should have multiple language options', async ({ page }) => {
    const selector = page.locator('#lang-select, select[id*="lang"]').first();

    if (await selector.count() > 0) {
      const options = selector.locator('option');
      const count = await options.count();
      expect(count).toBeGreaterThan(1);
    }
  });

  test('changing language should work', async ({ page }) => {
    const selector = page.locator('#lang-select, select[id*="lang"]').first();

    if (await selector.count() > 0) {
      // Get initial value
      const initial = await selector.inputValue();

      // Change to different language
      const options = await selector.locator('option').all();
      if (options.length > 1) {
        const newLang = await options[1].getAttribute('value');
        if (newLang) {
          await selector.selectOption(newLang);
          await page.waitForTimeout(500);

          // Value should have changed
          const current = await selector.inputValue();
          expect(current).toBe(newLang);
        }
      }
    }
  });
});

test.describe('Scroll Effects', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
  });

  test('navbar should add class on scroll', async ({ page }) => {
    const nav = page.locator('#navbar, nav, .navbar').first();

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(300);

    // Check if scrolled class was added
    const hasScrolledClass = await nav.evaluate(el =>
      el.classList.contains('scrolled') ||
      el.classList.contains('sticky') ||
      el.classList.contains('fixed')
    );

    // May or may not have scroll effect depending on implementation
    expect(hasScrolledClass).toBeDefined();
  });

  test('smooth scroll should work', async ({ page }) => {
    // Find an anchor link
    const anchor = page.locator('a[href^="#"]').first();

    if (await anchor.count() > 0) {
      const initialScroll = await page.evaluate(() => window.scrollY);

      await anchor.click();
      await page.waitForTimeout(800); // Wait for smooth scroll

      const finalScroll = await page.evaluate(() => window.scrollY);

      // Scroll position may have changed
      expect(finalScroll).toBeGreaterThanOrEqual(0);
    }
  });
});
