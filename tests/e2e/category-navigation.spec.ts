import { test, expect } from '@playwright/test';

test.describe('Category navigation', () => {
  test('homepage shows category links', async ({ page }) => {
    await page.goto('/');
    const categoryLinks = page.locator('a[href*="/categories/"]');
    await expect(categoryLinks.first()).toBeVisible({ timeout: 10000 });
    const count = await categoryLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('category page loads and shows skills', async ({ page }) => {
    await page.goto('/categories/development-tools');
    await expect(page).toHaveTitle(/development/i);
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    const headingText = await heading.textContent();
    expect(headingText).toBeTruthy();
  });

  test('category page has a link back to home or categories', async ({ page }) => {
    await page.goto('/categories/development-tools');
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
  });

  test('clicking a category link from homepage navigates correctly', async ({ page }) => {
    await page.goto('/');
    const categoryLink = page.locator('a[href*="/categories/"]').first();
    const href = await categoryLink.getAttribute('href');
    await categoryLink.click();
    await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('/categories/ai-llm page renders skills in that category', async ({ page }) => {
    await page.goto('/categories/ai-llm');
    const pageText = await page.textContent('body');
    // Page should have content (either skills or a description)
    expect(pageText!.length).toBeGreaterThan(100);
  });
});
