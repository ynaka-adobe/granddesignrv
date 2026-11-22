/* eslint-disable import/no-extraneous-dependencies */
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const root = path.resolve(__dirname, '../../..');
const drafts = JSON.parse(readFileSync(
  path.join(__dirname, 'fixtures/persona-carousels.json'),
  'utf8',
));
const headings = {
  shopper: 'Find the RV that fits your kind of adventure',
  owner: 'Get more from the RV you own',
  lifecycle: 'Your next chapter may look different',
  control: 'THE BEST VIEWS ARE THE ONES YOU SHARE',
};
const personaNames = { 1: 'Shopper', 2: 'Owner', 3: 'Upgrader' };

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/site/**', async (route) => {
    const filename = new URL(route.request().url()).pathname.substring('/site/'.length);
    try {
      await route.fulfill({
        body: await readFile(path.join(root, filename)),
        contentType: filename.endsWith('.js') ? 'text/javascript' : 'text/css',
      });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await route.fulfill({ status: 404 });
    }
  });
  await page.route('https://**', (route) => {
    if (route.request().resourceType() === 'image') {
      return route.fulfill({
        body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRFkAAAAASUVORK5CYII=', 'base64'),
        contentType: 'image/png',
      });
    }
    return route.fulfill({ body: 'export default () => {};', contentType: 'text/javascript' });
  });
  await page.route('**/fragments/carousel-hero-*', (route) => {
    const audience = new URL(route.request().url()).pathname.split('carousel-hero-')[1];
    return route.fulfill({ body: drafts[audience], contentType: 'text/html' });
  });
  const head = await readFile(path.join(root, 'head.html'), 'utf8');
  const profileScript = head.match(/<script nonce="aem">[\s\S]*?<\/script>/)[0];
  await page.route((url) => url.pathname === '/integration', (route) => route.fulfill({
    body: `<head>${profileScript}<script type="module" src="/site/scripts/scripts.js"></script></head>${
      drafts.control.replace(/<div><div class="metadata">[\s\S]*?<\/main>/, '</main>')}`,
    contentType: 'text/html',
  }));
});

async function renderedCarousel(page, query, audience) {
  await page.goto(`/integration${query}`);
  await expect(page.locator('.carousel-hero-slide')).toHaveCount(2);
  await expect(page.locator('.carousel-hero-slide h1')).toHaveText(headings[audience]);
  await expect(page.locator('.carousel-hero-slide-image picture img')).toHaveCount(2);
  await expect(page.locator('.carousel-hero-slide-content')).toHaveCount(2);
  await expect(page.locator('main > .section').nth(1))
    .toContainText('One relationship. Different next steps.');
  await expect(page.locator('.carousel-hero-slide-indicator button')).toHaveCount(2);
}

[
  ['1', 'shopper'], ['2', 'owner'], ['3', 'lifecycle'],
].forEach(([persona, audience]) => test(
  `Persona ${persona} renders ${audience} carousel`,
  async ({ page }) => {
    await renderedCarousel(page, `?audience=${audience}&p=4`, audience);
    await expect(page.locator('main > .section').first()).toHaveAttribute('data-audience', audience);
    await expect(page.locator('[data-persona-badge]'))
      .toContainText(personaNames[persona]);
    await page.locator('.carousel-hero-slide-indicator button').nth(1).click();
    await expect(page.locator('.carousel-hero')).toHaveAttribute('data-active-slide', '1');
  },
));

test('no persona and invalid legacy persona keep the original hero', async ({ page }) => {
  await renderedCarousel(page, '', 'control');
  await renderedCarousel(page, '?p=4', 'control');
});

test('manual audience preview overrides Persona and can force the control', async ({ page }) => {
  await renderedCarousel(page, '?p=3&audience=owner', 'owner');
  await expect(page.locator('[data-persona-badge]')).toContainText('Owner');
  await renderedCarousel(page, '?p=3&audience=default', 'control');
  await expect(page.locator('[data-persona-badge]')).toHaveCount(0);
  await renderedCarousel(page, '', 'control');
});

test('saved Persona selection is used after navigation without query parameters', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('demoProfile', JSON.stringify({
      audience: 'owner', persona: 3, loggedIn: true, region: 'CA',
    }));
  });
  await renderedCarousel(page, '', 'owner');
});

test('explicit Persona alias wins over saved selection', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('demoProfile', JSON.stringify({ persona: 2 }));
  });
  await renderedCarousel(page, '?persona=3', 'lifecycle');
});

test('reset clears the audience as well as the Persona profile', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('demoProfile', JSON.stringify({ persona: 3 }));
  });
  await renderedCarousel(page, '?demo-profile-reset=1', 'control');
  expect(await page.evaluate(() => window.demoProfile)).toEqual({});
});

test(
  'cookie-only DA previews resolve the audience when page profile initialization is absent',
  async ({ page }) => {
    await page.route((url) => url.pathname === '/integration', (route) => route.fulfill({
      body: `<script type="module">
        window.hlx = {};
        const { runExperimentation } = await import('/site/scripts/experimentation.js');
        await runExperimentation(document);
        window.ready = true;
        </script>${drafts.control}`,
      contentType: 'text/html',
    }));
    await page.context().addCookies([{
      name: 'demoProfile',
      value: encodeURIComponent(JSON.stringify({ persona: 1 })),
      url: 'http://127.0.0.1:3000',
    }]);
    await page.goto('/integration');
    await page.waitForFunction(() => window.ready);
    await expect(page.locator('main > div').first()).toHaveAttribute('data-audience', 'shopper');
    await expect(page.locator('main h1')).toHaveText(headings.shopper);
  },
);
