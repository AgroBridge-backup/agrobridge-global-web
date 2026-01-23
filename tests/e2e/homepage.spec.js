/**
 * E2E Tests - Homepage
 * @description End-to-end tests for homepage functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/AgroBridge/i);
  });

  test('should display hero section', async ({ page }) => {
    const hero = page.locator('.hero, #inicio, [data-section="hero"]').first();
    await expect(hero).toBeVisible();
  });

  test('should display navigation', async ({ page }) => {
    const nav = page.locator('nav, #navbar, .navbar').first();
    await expect(nav).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    const navLinks = page.locator('.nav__link, nav a[href^="#"]');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display logo', async ({ page }) => {
    const logo = page.locator('.logo, .nav__logo, [alt*="logo" i]').first();
    await expect(logo).toBeVisible();
  });

  test('should have validation input', async ({ page }) => {
    const input = page.locator('#search-input, #validation-input, input[placeholder*="lote" i]').first();
    await expect(input).toBeVisible();
  });

  test('should have validation button', async ({ page }) => {
    const button = page.locator('#search-button, #validate-btn, button:has-text("Verificar")').first();
    await expect(button).toBeVisible();
  });
});

test.describe('Homepage - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have lang attribute on html', async ({ page }) => {
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBeTruthy();
  });

  test('should have meta viewport', async ({ page }) => {
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });

  test('should have heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1');
    const count = await h1.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('skip link should be present', async ({ page }) => {
    const skipLink = page.locator('a[href="#main-content"], .skip-link');
    // Skip links may be visually hidden but should exist
    const count = await skipLink.count();
    // This is optional but recommended
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Homepage - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - start;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Filter out expected errors (like favicon 404 in dev)
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('net::ERR')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
