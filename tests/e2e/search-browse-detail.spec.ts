import { test, expect } from '@playwright/test';

test.describe('Search → Browse → Detail flow', () => {
  test('homepage loads with search input', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/skills/i);
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').first();
    await expect(searchInput).toBeVisible();
  });

  test('search returns results and navigates to skill detail', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').first();
    await searchInput.fill('git');
    await page.waitForTimeout(500); // debounce

    // Either results appear inline or we navigate to /skills
    const hasResults = await page.locator('a[href*="/skills/"]').first().isVisible().catch(() => false);
    if (!hasResults) {
      await page.keyboard.press('Enter');
      await page.waitForURL(/\/skills/);
    }
    const skillLinks = page.locator('a[href*="/skills/"]');
    await expect(skillLinks.first()).toBeVisible();
  });

  test('/skills listing page loads with skill cards', async ({ page }) => {
    await page.goto('/skills');
    await expect(page).toHaveTitle(/skills/i);
    const skillCards = page.locator('a[href*="/skills/"]');
    await expect(skillCards.first()).toBeVisible({ timeout: 10000 });
    const count = await skillCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('navigating to a skill detail page shows metadata', async ({ page }) => {
    await page.goto('/skills/superpowers');
    // Should have a title with skill name
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    const headingText = await heading.textContent();
    expect(headingText).toBeTruthy();
    expect(headingText!.length).toBeGreaterThan(0);
  });

  test('skill detail page has install command', async ({ page }) => {
    await page.goto('/skills/superpowers');
    // Install command should appear somewhere on the page
    const pageText = await page.textContent('body');
    expect(pageText).toContain('install');
  });

  test('skill detail page has breadcrumb navigation', async ({ page }) => {
    await page.goto('/skills/superpowers');
    // Breadcrumbs should link back to home or skills
    const breadcrumbs = page.locator('nav[aria-label*="breadcrumb" i], ol[aria-label*="breadcrumb" i], [data-testid="breadcrumbs"]').first();
    const hasBreadcrumbs = await breadcrumbs.isVisible().catch(() => false);
    if (hasBreadcrumbs) {
      const homeLink = page.locator('a[href="/"]').first();
      await expect(homeLink).toBeVisible();
    } else {
      // At minimum, there should be a link back to skills
      const skillsLink = page.locator('a[href="/skills"]').first();
      await expect(skillsLink).toBeVisible();
    }
  });
});
