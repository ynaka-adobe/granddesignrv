/* eslint-disable import/no-extraneous-dependencies */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const root = path.resolve(__dirname, '../../..');
const boot = `<script type="module">
  window.hlx = {};
  const { runExperimentation } = await import('/site/scripts/experimentation.js');
  await runExperimentation(document);
  window.ready = true;
</script>`;

test.beforeEach(async ({ page }) => {
  await page.route('**/site/**', async (route) => {
    const filename = new URL(route.request().url()).pathname.substring('/site/'.length);
    await route.fulfill({
      body: await readFile(path.join(root, filename)),
      contentType: filename.endsWith('.js') ? 'text/javascript' : 'text/html',
    });
  });
  await page.route('**/challenger', (route) => route.fulfill({
    body: '<main><div><h1>RV challenger</h1></div></main>',
    contentType: 'text/html',
  }));
});

async function open(page, html, query = '') {
  await page.route((url) => url.pathname === '/integration', (route) => route.fulfill({
    body: html,
    contentType: 'text/html',
  }));
  await page.goto(`/integration${query}`);
  await page.waitForFunction(() => window.ready);
}

test('ordinary pages do not request the experimentation engine', async ({ page }) => {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await open(page, `<main><div>RV control</div></main>${boot}`);
  expect(requests.some((url) => url.includes('/plugins/experimentation/'))).toBe(false);
  await expect(page.locator('main')).toHaveText('RV control');
});

test('page experiments swap challengers and revalidate their cache', async ({ page }) => {
  await page.addInitScript(() => {
    const originalFetch = window.fetch;
    window.fetch = (url, options) => {
      if (url === '/challenger') window.variantCache = options?.cache;
      return originalFetch(url, options);
    };
  });
  await open(page, `<meta name="experiment" content="rv-test">
    <meta name="experiment-variants" content="/challenger">
    <meta name="experiment-status" content="inactive">
    <main><div>RV control</div></main>${boot}`, '?experiment=rv-test/challenger-1');
  await expect(page.locator('main')).toHaveText('RV challenger');
  await expect(page.locator('body')).toHaveAttribute('data-variant', 'challenger-1');
  expect(await page.evaluate(() => window.variantCache)).toBe('no-cache');
});

test('inactive page experiments retain the control without forcing', async ({ page }) => {
  await open(page, `<meta name="experiment" content="rv-test">
    <meta name="experiment-variants" content="/challenger">
    <meta name="experiment-status" content="inactive">
    <main><div>RV control</div></main>${boot}`);
  await expect(page.locator('main')).toHaveText('RV control');
  await expect(page.locator('body')).toHaveAttribute('data-variant', 'control');
});

test('site loader decorates the chosen variant before existing Target runs', async ({ page }) => {
  await page.route('https://**', (route) => route.fulfill({
    body: 'export default () => {};',
    contentType: 'text/javascript',
  }));
  await page.route('**/site/deps/at/at.js', (route) => route.fulfill({
    body: `window.adobe = { target: {
      getOffers: async () => {
        window.targetSawDecoratedVariant = !!document.querySelector('main .section h1');
        return {};
      },
      applyOffers: async () => { window.targetApplied = true; }
    } };`,
    contentType: 'text/javascript',
  }));
  await page.route((url) => url.pathname === '/integration', (route) => route.fulfill({
    body: `<head><meta name="experiment" content="rv-test">
      <meta name="experiment-variants" content="/challenger">
      <meta name="target" content="true">
      <script type="module" src="/site/scripts/scripts.js"></script></head>
      <body><header></header><main><div>RV control</div></main><footer></footer></body>`,
    contentType: 'text/html',
  }));
  await page.goto('/integration?experiment=rv-test/challenger-1');
  await page.waitForFunction(() => window.targetApplied);
  await expect(page.locator('main .section h1')).toHaveText('RV challenger');
  expect(await page.evaluate(() => window.targetSawDecoratedVariant)).toBe(true);
});

test('published experiment and audience section attributes work independently', async ({ page }) => {
  await open(page, `<main>
    <div data-experiment="rv-test" data-experiment-variants="/challenger">Experiment control</div>
    <div data-audience:-desktop="/challenger">Audience control</div>
    <div>Unchanged section</div>
    </main>${boot}`, '?experiment=rv-test/challenger-1&audience=desktop');
  await expect(page.locator('main > div').nth(0)).toHaveText('RV challenger');
  await expect(page.locator('main > div').nth(1)).toHaveText('RV challenger');
  await expect(page.locator('main > div').nth(2)).toHaveText('Unchanged section');
});

test('raw DA section metadata still swaps variants', async ({ page }) => {
  await open(page, `<main><div><p>RV control</p><div class="section-metadata">
    <div><div>Experiment</div><div>rv-test</div></div>
    <div><div>Experiment Variants</div><div><a href="/challenger">Variant</a></div></div>
    </div></div></main>${boot}`, '?experiment=rv-test/challenger-1');
  await expect(page.locator('main')).toHaveText('RV challenger');
});

test('audience default simulation preserves default content', async ({ page }) => {
  const variants = [];
  page.on('request', (request) => {
    if (request.url().endsWith('/challenger')) variants.push(request.url());
  });
  await open(
    page,
    `<main><div data-audience-desktop="/challenger">RV control</div></main>${boot}`,
    '?audience=default',
  );
  await expect(page.locator('main')).toHaveText('RV control');
  expect(variants).toEqual([]);
});

test('Sidekick configuration retains existing buttons and toggles experimentation', async ({ page }) => {
  const config = JSON.parse(await readFile(path.join(root, 'tools/sidekick/config.json'), 'utf8'));
  expect(config.plugins.map(({ id }) => id)).toEqual([
    'aem-genai-variations', 'audiences', 'experimentation', 'persona',
  ]);
  const exp = config.plugins.find(({ id }) => id === 'experimentation');
  expect(exp.event).toBe('experimentation');
  await page.route('**/site/scripts/scripts.js', (route) => route.fulfill({
    body: "export const NX_ORIGIN = '/nx';",
    contentType: 'text/javascript',
  }));
  await page.route('**/nx/public/plugins/exp/exp.js', (route) => route.fulfill({
    body: `const panel = document.createElement('div');
      panel.id = 'aem-sidekick-exp'; panel.textContent = 'Experimentation'; document.body.append(panel);
      export default () => { panel.hidden = !panel.hidden; };`,
    contentType: 'text/javascript',
  }));
  await open(page, `<aem-sidekick></aem-sidekick><script type="module">
    await import('/site/scripts/sidekick.js'); window.ready = true;
    </script>`);
  await page.locator('aem-sidekick').dispatchEvent(`custom:${exp.event}`);
  await expect(page.locator('#aem-sidekick-exp')).toBeVisible();
  await page.locator('aem-sidekick').dispatchEvent(`custom:${exp.event}`);
  await expect(page.locator('#aem-sidekick-exp')).toBeHidden();
});

test(
  'Audiences palette reads published and DA metadata and preserves other URL parameters',
  async ({ page }) => {
    const config = JSON.parse(await readFile(path.join(root, 'tools/sidekick/config.json'), 'utf8'));
    const audience = config.plugins.find(({ id }) => id === 'audiences');
    expect(audience.url).toBe('/tools/audiences/audiences.html');
    expect(audience.isPalette && audience.passReferrer).toBe(true);
    await page.route('**/rv.plain.html', (route) => route.fulfill({
      body: `<div data-audience:-desktop="/challenger"><h2>RV hero</h2></div>
        <div><div class="section-metadata">
        <div><div>Audience: mobile</div><div><a href="/mobile">Mobile</a></div></div>
        </div></div>`,
      contentType: 'text/html',
    }));
    await page.route('**/tools/audiences/audiences.js', async (route) => route.fulfill({
      body: await readFile(path.join(root, 'tools/audiences/audiences.js')),
      contentType: 'text/javascript',
    }));
    await page.goto(`/site/tools/audiences/audiences.html?referrer=${
      encodeURIComponent('http://127.0.0.1:3000/rv?keep=1#hero')}`);
    await expect(page.locator('#aud-status')).toHaveText('2 section(s) with audiences.');
    await page.getByRole('button', { name: 'Preview desktop for RV hero' }).click();
    await expect(page).toHaveURL('http://127.0.0.1:3000/rv?keep=1&audience=desktop#hero');
  },
);
