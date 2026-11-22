/* eslint-disable import/no-extraneous-dependencies */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const root = path.resolve(__dirname, '../../..');
const origin = 'http://127.0.0.1:3000';

test.beforeEach(async ({ page }) => {
  await page.route('**/tools/persona/**', async (route) => {
    const filename = new URL(route.request().url()).pathname;
    await route.fulfill({
      body: await readFile(path.join(root, filename)),
      contentType: {
        '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html',
      }[path.extname(filename)],
    });
  });
  const head = await readFile(path.join(root, 'head.html'), 'utf8');
  const profileScript = head.match(/<script nonce="aem">[\s\S]*?<\/script>/)[0];
  await page.route((url) => url.pathname === '/rv', (route) => route.fulfill({
    body: `<head>${profileScript}</head><body><main>Grand Design RV</main></body>`,
    contentType: 'text/html',
  }));
});

async function palette(page, referrer = '/rv') {
  await page.goto(`/tools/persona/persona.html?referrer=${encodeURIComponent(origin + referrer)}`);
  await expect(page.locator('#persona-select option')).toHaveCount(3);
}

[
  ['Shopper', 'Build confidence', 'floorplans'],
  ['Owner', 'Maximize enjoyment', 'maintenance guides'],
  ['Upgrader', 'Find a better fit', 'trade-in content'],
].forEach(([name, goal, content]) => test(`lifecycle card renders ${name}`, async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 800 });
  await palette(page);
  await expect(page.locator('#persona-select option')).toHaveText(['Shopper', 'Owner', 'Upgrader']);
  await expect(page.locator('.persona-lifecycle')).toHaveText('SHOP → OWN → UPGRADE → OWN → UPGRADE');
  await page.selectOption('#persona-select', { label: name });
  await expect(page.locator('#persona-name')).toHaveText(name);
  await expect(page.locator('#persona-summary')).toContainText(goal);
  await expect(page.locator('#persona-content')).toContainText(content);
  await expect(page.locator('#persona-needs')).not.toBeEmpty();
  await expect(page.locator('#persona-context')).not.toBeEmpty();
  await expect(page.locator('#persona-activation')).not.toBeEmpty();
  await expect(page.locator('#persona-metrics')).not.toBeEmpty();
  await expect(page.locator('#persona-trajectory')).not.toBeEmpty();
  await page.locator('summary').click();
  await expect(page.locator('#persona-experience')).toContainText('Activate');
  await expect(page.locator('blockquote')).toContainText('Reflection 315RLTS');
  await expect(page.locator('.persona-explanation')).toContainText('not an identified customer');
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(fits).toBe(true);
}));

test('Apply preserves context and persists the numeric Target persona contract', async ({ page }) => {
  await palette(page, '/rv?keep=1&audience=desktop#hero');
  const before = page.url();
  await page.selectOption('#persona-select', { label: 'Upgrader' });
  await page.locator('.persona-toggle').click();
  await expect(page.locator('#persona-loggedin')).toBeChecked();
  await page.selectOption('#persona-region', 'CA');
  expect(page.url()).toBe(before);
  await page.click('#persona-apply');
  await expect(page).toHaveURL(`${origin}/rv?keep=1&audience=desktop&p=3&li=true&region=CA#hero`);
  await expect(page.locator('[data-persona-badge]')).toContainText('Persona 3: Upgrader');
  expect(await page.evaluate(() => window.targetPageParams())).toEqual({
    'profile.persona': 3,
    'profile.loggedIn': true,
    'profile.region': 'CA',
  });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('demoProfile')))).toEqual({
    persona: 3, loggedIn: true, region: 'CA',
  });
  await palette(page);
  await expect(page.locator('#persona-name')).toHaveText('Upgrader');
  await expect(page.locator('#persona-loggedin')).toBeChecked();
  await expect(page.locator('#persona-region')).toHaveValue('CA');
});

test(
  'explicit query personas override saved selections and Reset clears persisted aliases',
  async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('demoProfile', JSON.stringify({ persona: 2, loggedIn: true, region: 'CA' }));
    });
    await palette(page, '/rv?persona=3&loggedin=false&r=TX&keep=1#hero');
    await expect(page.locator('#persona-name')).toHaveText('Upgrader');
    await expect(page.locator('#persona-loggedin')).not.toBeChecked();
    await expect(page.locator('#persona-region')).toHaveValue('TX');
    await page.click('#persona-reset');
    await expect(page).toHaveURL(`${origin}/rv?keep=1#hero`);
    expect(await page.evaluate(() => window.demoProfile)).toEqual({});
    expect(await page.evaluate(() => window.targetPageParams())).toEqual({});
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('demoProfile')))).toEqual({});
    await expect(page.locator('[data-persona-badge]')).toHaveCount(0);
  },
);

test('legacy persona 4 is rejected instead of sent as an unknown Target audience', async ({ page }) => {
  await palette(page, '/rv?p=4');
  await expect(page.locator('#persona-status')).toContainText('Unsupported legacy persona');
  await page.goto('/rv?p=4&li=true&region=TX');
  await expect(page.locator('[data-persona-badge]')).toHaveCount(0);
  expect(await page.evaluate(() => window.targetPageParams())).toEqual({
    'profile.loggedIn': true,
    'profile.region': 'TX',
  });
  expect(await page.evaluate(() => window.demoProfile.persona)).toBeUndefined();
});

test('Target hero requests keep Upgrader profile values and exclude legacy persona 4', async ({ page }) => {
  await page.route('**/blocks/target-slot-hero/target-slot-hero.js', async (route) => route.fulfill({
    body: await readFile(path.join(root, 'blocks/target-slot-hero/target-slot-hero.js')),
    contentType: 'text/javascript',
  }));
  const requests = [];
  await page.route('https://acsmarketing.tt.omtrdc.net/**', (route) => {
    requests.push(route.request().postDataJSON());
    return route.fulfill({
      json: { execute: { mboxes: [{ options: [{ content: '<h1>Upgrade options</h1>' }] }] } },
    });
  });
  await page.goto('/rv?p=3&li=true&region=TX');
  await page.addScriptTag({
    type: 'module', content: `
    const { default: decorate } = await import('/blocks/target-slot-hero/target-slot-hero.js');
    const block = document.createElement('div');
    document.body.append(block);
    await decorate(block);
    window.demoProfile.persona = 4;
    await decorate(document.createElement('div'));
    window.heroDone = true;
  `,
  });
  await page.waitForFunction(() => window.heroDone);
  expect(requests).toHaveLength(1);
  expect(requests[0].execute.mboxes[0].profileParameters).toEqual({
    persona: '3', loggedIn: 'true', region: 'TX',
  });
  await expect(page.locator('[data-persona-hero] h1')).toHaveText('Upgrade options');
});
