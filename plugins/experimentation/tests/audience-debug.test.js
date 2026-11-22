/* eslint-disable import/no-extraneous-dependencies */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const root = path.resolve(__dirname, '../../..');

async function open(page, query = '', failVariant = false) {
  await page.route('**/site/**', async (route) => {
    const filename = new URL(route.request().url()).pathname.substring('/site/'.length);
    await route.fulfill({
      body: filename === 'scripts/scripts.js'
        ? 'export const NX_ORIGIN = "https://da.live";'
        : await readFile(path.join(root, filename)),
      contentType: filename.endsWith('.css') ? 'text/css' : 'text/javascript',
    });
  });
  await page.route('**/tools/audiences/audiences.html', (route) => route.fulfill({ body: '<p>Audiences</p>' }));
  await page.route('**/variant', (route) => route.fulfill(failVariant
    ? { status: 404 } : { body: '<main><div><h1>Matched hero</h1></div></main>', contentType: 'text/html' }));
  await page.route((url) => url.pathname === '/debug-test', (route) => route.fulfill({
    body: `<main><div data-audience:-shopper="/variant" data-audience:-owner="/variant"
      data-audience:-lifecycle="/variant"><h1>Default hero</h1></div><div>Uncontrolled</div></main>
      <aem-sidekick></aem-sidekick>
      <script type="module">
        import { runExperimentation } from '/site/scripts/experimentation.js';
        window.hlx = {};
        await runExperimentation(document);
        const sidekick = document.querySelector('aem-sidekick');
        const shell = sidekick.attachShadow({mode: 'open'});
        const host = document.createElement('palette-container');
        shell.append(host);
        const root = host.attachShadow({mode: 'open'});
        root.innerHTML = '<style>.hidden { display: none; }</style><div class="hidden" id="palette"><iframe src="/tools/audiences/audiences.html"></iframe></div>';
        window.palette = root.querySelector('#palette');
        window.frame = root.querySelector('iframe');
        await import('/site/scripts/sidekick.js');
        window.ready = true;
      </script>`,
    contentType: 'text/html',
  }));
  await page.goto(`/debug-test${query}`);
  await page.waitForFunction(() => window.ready);
}

async function toggle(page, enabled) {
  await page.evaluate((value) => window.palette.classList.toggle('hidden', !value), enabled);
  await expect(page.locator('body')).toHaveClass(enabled ? /audience-debug/ : /^(?!.*audience-debug)/);
}

test('default debug is scoped to controlled content and never changes selection or layout after closing', async ({ page }) => {
  await open(page);
  const section = page.locator('main > div').first();
  const bounds = await section.boundingBox();
  await toggle(page, true);
  await expect(section).toHaveAttribute('data-audience-debug', 'default');
  await expect(section).toHaveCSS('outline-style', 'dashed');
  expect(await section.evaluate((element) => getComputedStyle(element, '::after').content))
    .toContain('Default (no audience matched)');
  await expect(page.locator('main > div').nth(1)).not.toHaveCSS('outline-style', 'dashed');
  expect(new URL(page.url()).search).toBe('');
  await toggle(page, false);
  await expect(page.locator('[data-audience-debug]')).toHaveCount(0);
  await expect(section).toHaveCSS('outline-style', 'none');
  expect(await section.boundingBox()).toEqual(bounds);
  await expect(page.locator('link[href$="audience-debug.css"]')).toHaveCount(0);
  await toggle(page, true);
  await expect(section).toHaveCSS('outline-style', 'dashed');
});

['shopper', 'owner', 'lifecycle'].forEach((audience) => test(`debug shows resolved ${audience}`, async ({ page }) => {
  await open(page, `?audience=${audience}`);
  await toggle(page, true);
  const section = page.locator('main > div').first();
  await expect(section).toHaveAttribute('data-audience', audience);
  await expect(section).toContainText('Matched hero');
  expect(await section.evaluate((element) => getComputedStyle(element, '::after').content)).toContain(audience);
}));

test('failed variant load shows the actual default, not the requested audience', async ({ page }) => {
  await open(page, '?audience=owner', true);
  await toggle(page, true);
  await expect(page.locator('main > div').first()).toHaveAttribute('data-audience', 'default');
  await expect(page.locator('main > div').first()).toContainText('Default hero');
});

test('normal page stays unstyled and switching palettes or removing Sidekick cleans up', async ({ page }) => {
  await open(page, '?audience=owner');
  await expect(page.locator('link[href$="audience-debug.css"]')).toHaveCount(0);
  await toggle(page, true);
  await page.evaluate(() => { window.frame.src = '/tools/persona/persona.html'; });
  await expect(page.locator('body')).not.toHaveClass(/audience-debug/);
  await page.evaluate(() => { window.frame.src = '/tools/audiences/audiences.html'; });
  await expect(page.locator('body')).toHaveClass(/audience-debug/);
  await page.evaluate(() => document.querySelector('aem-sidekick').remove());
  await expect(page.locator('body')).not.toHaveClass(/audience-debug/);
  await expect(page.locator('link[href$="audience-debug.css"]')).toHaveCount(0);
});
