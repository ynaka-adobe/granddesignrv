/* eslint-disable import/no-extraneous-dependencies */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const root = path.resolve(__dirname, '../../..');
const customOrigin = 'https://granddesignrv.xsc.demo.adobe.com';
const previewOrigin = 'https://main--granddesignrv--ynaka-adobe.aem.page';
const headers = { 'content-type': 'application/json', 'cache-control': 'private, no-store' };

async function open(page, options = {}) {
  const {
    origin = customOrigin, query = '', profile = { city: 'san francisco', country: 'US', source: 'cdn' },
    responseHeaders = headers, status = 200, body, abort = false, delay = 0, declared = true,
    raw = false,
    demoAudience,
  } = options;
  const requests = [];
  const warnings = [];
  page.on('console', (message) => {
    if (message.type() === 'warning') warnings.push(message.text());
  });
  await page.route('**/site/**', async (route) => {
    const filename = new URL(route.request().url()).pathname.substring('/site/'.length);
    await route.fulfill({ body: await readFile(path.join(root, filename)), contentType: 'text/javascript' });
  });
  await page.route('**/api/visitor-profile', async (route) => {
    requests.push(route.request());
    if (abort) return route.abort();
    if (delay) await new Promise((resolve) => { setTimeout(resolve, delay); });
    return route.fulfill({
      status, headers: responseHeaders, body: body ?? JSON.stringify(profile),
    });
  });
  await page.route('**/city-variant-*', (route) => route.fulfill({
    body: `<main><div><h1>${new URL(route.request().url()).pathname.slice('/city-variant-'.length)}</h1></div></main>`,
    contentType: 'text/html',
  }));
  let attributes = '';
  if (declared === 'persona') attributes = 'data-audience:-owner="/city-variant-owner"';
  else if (declared && !raw) attributes = 'data-audience:-san-francisco="/city-variant-san-francisco" data-audience:-chicago="/city-variant-chicago" data-audience:-los-angeles="/city-variant-los-angeles"';
  await page.route((url) => url.pathname === '/city-test', (route) => route.fulfill({
    body: `<main><div ${attributes}><h1>Original hero</h1>
      ${raw ? '<div class="section-metadata"><div><div>Audience: san-francisco</div><div>/city-variant-san-francisco</div></div></div>' : ''}
      </div></main>
      <script type="module">
        import { runExperimentation } from '/site/scripts/experimentation.js';
        import matchesCity from '/site/scripts/city-audiences.js';
        window.hlx = {};
        window.demoProfile = ${JSON.stringify(demoAudience ? { audience: demoAudience } : {})};
        window.matchesCity = matchesCity;
        const fetch = window.fetch.bind(window);
        window.fetch = (url, options) => {
          if (url === '/api/visitor-profile') {
            window.profileFetch = {
              cache: options.cache, credentials: options.credentials,
              mode: options.mode, redirect: options.redirect
            };
          }
          return fetch(url, options);
        };
        await runExperimentation(document);
        window.ready = true;
      </script>`,
    contentType: 'text/html',
  }));
  await page.goto(`${origin}/city-test${query}`);
  await page.waitForFunction(() => window.ready);
  return { requests, warnings };
}

[
  ['san francisco', 'san-francisco'],
  ['Chicago', 'chicago'],
  ['  LOS   ANGELES  ', 'los-angeles'],
].forEach(([city, audience]) => test(`exact normalized city ${city} matches ${audience}`, async ({ page }) => {
  const { requests } = await open(page, { profile: { city, country: ' us ', source: 'cdn' } });
  await expect(page.locator('h1')).toHaveText(audience);
  await expect(page.locator('main > div')).toHaveAttribute('data-audience', audience);
  expect(requests).toHaveLength(1);
  expect(requests[0].url()).toBe(`${customOrigin}/api/visitor-profile`);
  expect(requests[0].method()).toBe('GET');
  expect(await page.evaluate(() => window.profileFetch)).toEqual({
    cache: 'no-store', credentials: 'omit', mode: 'same-origin', redirect: 'error',
  });
  expect(await page.evaluate(() => ({
    storage: localStorage.length, cookie: document.cookie,
  }))).toEqual({ storage: 0, cookie: '' });
  await page.evaluate(() => Promise.all([
    window.matchesCity('san francisco'), window.matchesCity('chicago'), window.matchesCity('los angeles'),
  ]));
  expect(requests).toHaveLength(1);
}));

[
  { city: 'oakland', country: 'US', source: 'cdn' },
  { city: 'san francisco bay area', country: 'US', source: 'cdn' },
  { city: 'chicago', country: 'CA', source: 'cdn' },
].forEach((profile, index) => test(`valid nonmatching location ${index + 1} retains control`, async ({ page }) => {
  await open(page, { profile });
  await expect(page.locator('h1')).toHaveText('Original hero');
}));

[
  { profile: {} },
  { profile: { city: 'chicago', source: 'cdn' } },
  { profile: { city: '', country: 'US', source: 'cdn' } },
  { profile: { city: 123, country: 'US', source: 'cdn' } },
  { profile: { city: 'chicago', country: 'US', source: 'untrusted' } },
  { body: 'not json' },
  { responseHeaders: { ...headers, 'cache-control': 'public, max-age=60' } },
  { responseHeaders: { ...headers, 'cache-control': 'private' } },
  { responseHeaders: { ...headers, 'content-type': 'text/html' } },
  { status: 404 },
  { status: 302, responseHeaders: { ...headers, location: 'https://example.com/profile' } },
  { abort: true },
  { delay: 2500 },
].forEach((options, index) => test(`unavailable or invalid profile ${index + 1} fails closed with private diagnostics`, async ({ page }) => {
  const { requests, warnings } = await open(page, options);
  await expect(page.locator('h1')).toHaveText('Original hero');
  expect(requests).toHaveLength(1);
  expect(warnings.filter((message) => message.startsWith('AEM city audiences unavailable:'))).toHaveLength(1);
  expect(warnings.join(' ')).not.toMatch(/san francisco|chicago|los angeles|latitude|longitude/i);
}));

test('ordinary pages never request the visitor endpoint', async ({ page }) => {
  const { requests } = await open(page, { declared: false });
  expect(requests).toHaveLength(0);
});

test('unrelated audience rules do not request a city profile', async ({ page }) => {
  const { requests } = await open(page, { declared: 'persona' });
  expect(requests).toHaveLength(0);
});

test('raw DA audience names retain hyphenated city IDs', async ({ page }) => {
  await open(page, { raw: true });
  await expect(page.locator('h1')).toHaveText('san-francisco');
});

test('manual default on the custom domain also bypasses city lookup', async ({ page }) => {
  const { requests } = await open(page, { query: '?audience=default' });
  await expect(page.locator('h1')).toHaveText('Original hero');
  expect(requests).toHaveLength(0);
});

['san-francisco', 'chicago', 'los-angeles'].forEach((audience) => test(`saved manual ${audience} takes precedence over CDN city without lookup`, async ({ page }) => {
  const { requests } = await open(page, { demoAudience: audience });
  await expect(page.locator('h1')).toHaveText(audience);
  expect(requests).toHaveLength(0);
}));

test('a saved lifecycle audience is exclusive with city simulation', async ({ page }) => {
  const { requests } = await open(page, { demoAudience: 'owner' });
  await expect(page.locator('h1')).toHaveText('Original hero');
  expect(requests).toHaveLength(0);
});

test('provider preview does not fetch or automatically match a city', async ({ page }) => {
  const { requests, warnings } = await open(page, { origin: previewOrigin });
  await expect(page.locator('h1')).toHaveText('Original hero');
  expect(requests).toHaveLength(0);
  expect(warnings).toContain('AEM city audiences are unavailable outside the custom-domain site.');
});

['san-francisco', 'chicago', 'los-angeles', 'default'].forEach((audience) => test(`manual preview ${audience} bypasses lookup`, async ({ page }) => {
  const { requests } = await open(page, { origin: previewOrigin, query: `?audience=${audience}` });
  await expect(page.locator('h1')).toHaveText(audience === 'default' ? 'Original hero' : audience);
  expect(requests).toHaveLength(0);
}));
