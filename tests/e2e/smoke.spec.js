/**
 * Pre-merge E2E smoke
 * @description Fast chromium-only gate that runs on every PR BEFORE deploy,
 * against the local static server (no backend, no secrets). Catches the
 * "blank/broken page" regression class early. Also covers the brandRoute
 * URL-param validation that jsdom unit tests cannot reach (real navigation).
 */
import { test, expect } from '@playwright/test';

test.describe('Pre-merge smoke', () => {
  test('homepage boots with title, hero, nav and footer and no uncaught errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto('/');
    await expect(page).toHaveTitle(/AgroBridge/i);
    await expect(page.locator('.hero, #inicio').first()).toBeVisible();
    await expect(page.locator('nav').first()).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('runtime-bootstrap applies a valid brandRoute from the URL and persists it', async ({ page }) => {
    await page.goto('/?brandRoute=editorial-luxury');
    expect(await page.locator('html').getAttribute('data-brand-route')).toBe('editorial-luxury');
    const persisted = await page.evaluate(() => localStorage.getItem('agrobridge.brandRoute'));
    expect(persisted).toBe('editorial-luxury');
  });

  test('runtime-bootstrap rejects an invalid brandRoute and falls back to default', async ({ page }) => {
    await page.goto('/?brandRoute=%3Cscript%3Ealert(1)%3C/script%3E');
    const route = await page.locator('html').getAttribute('data-brand-route');
    expect(['institutional-tech', 'editorial-luxury', 'agro-heritage-modern']).toContain(route);
    expect(route).toBe('institutional-tech');
  });

  test('legal page renders its compliance scaffold', async ({ page }) => {
    await page.goto('/legal/privacidad.html');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('critical frontend scripts are served (no 404 on the bootstrap chain)', async ({ page }) => {
    const failed = [];
    page.on('response', resp => {
      if (resp.url().includes('/scripts/') && resp.status() === 404) failed.push(resp.url());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(failed).toEqual([]);
  });
});
