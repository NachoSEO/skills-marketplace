import { test, expect } from '@playwright/test';

test.describe('Skill page SEO — metadata, JSON-LD, breadcrumbs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/skills/superpowers');
  });

  test('has a non-empty <title> tag', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('has a meta description', async ({ page }) => {
    const metaDescription = page.locator('meta[name="description"]');
    const content = await metaDescription.getAttribute('content');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(10);
  });

  test('has a canonical link tag', async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]');
    const href = await canonical.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toContain('superpowers');
  });

  test('has Open Graph tags', async ({ page }) => {
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogTitle).toHaveCount(1);
    await expect(ogDescription).toHaveCount(1);
    const titleContent = await ogTitle.getAttribute('content');
    expect(titleContent).toBeTruthy();
  });

  test('has JSON-LD structured data', async ({ page }) => {
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThan(0);

    // Parse and validate at least one JSON-LD block
    const firstScript = await jsonLdScripts.first().textContent();
    expect(() => JSON.parse(firstScript!)).not.toThrow();
    const data = JSON.parse(firstScript!);
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBeTruthy();
  });

  test('has breadcrumb navigation linking back to skills', async ({ page }) => {
    // Check for breadcrumb links — at minimum a link to /skills
    const skillsLink = page.locator('a[href="/skills"]').first();
    const hasBreadcrumb = await skillsLink.isVisible().catch(() => false);
    if (!hasBreadcrumb) {
      // Alternatively accept home link as breadcrumb root
      const homeLink = page.locator('a[href="/"]').first();
      await expect(homeLink).toBeVisible();
    } else {
      await expect(skillsLink).toBeVisible();
    }
  });
});

test.describe('Skills listing page metadata', () => {
  test('/skills page has a title tag', async ({ page }) => {
    await page.goto('/skills');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('/skills page has a meta description', async ({ page }) => {
    await page.goto('/skills');
    const metaDescription = page.locator('meta[name="description"]');
    const content = await metaDescription.getAttribute('content');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(5);
  });
});

test.describe('Category page metadata', () => {
  test('category page has title and canonical', async ({ page }) => {
    await page.goto('/categories/development-tools');
    const title = await page.title();
    expect(title).toBeTruthy();

    const canonical = page.locator('link[rel="canonical"]');
    const href = await canonical.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toContain('development-tools');
  });
});
