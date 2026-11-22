/* eslint-disable import/no-extraneous-dependencies */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const root = path.resolve(__dirname, '../../..');
const service = 'https://gdrv.scene7.com/is/image/granddesignrv/';

async function open(page, rows, failImage = false) {
  await page.route('**/blocks/dynamic-media/**', async (route) => {
    const filename = new URL(route.request().url()).pathname;
    await route.fulfill({
      body: await readFile(path.join(root, filename)),
      contentType: filename.endsWith('.js') ? 'text/javascript' : 'text/css',
    });
  });
  await page.route('https://gdrv.scene7.com/is/**', (route) => (failImage ? route.abort() : route.fulfill({
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="700"/>',
    contentType: 'image/svg+xml',
  })));
  await page.route('**/dm-test', (route) => route.fulfill({
    body: `<link rel="stylesheet" href="/blocks/dynamic-media/dynamic-media.css">
      <main><div class="dynamic-media"></div></main>
      <script type="module">
        import decorate from '/blocks/dynamic-media/dynamic-media.js';
        const block = document.querySelector('.dynamic-media');
        ${JSON.stringify(rows)}.forEach((cells) => {
          const row = document.createElement('div');
          cells.forEach((text) => {
            const cell = document.createElement('div');
            cell.textContent = text;
            row.append(cell);
          });
          block.append(row);
        });
        decorate(block);
      </script>`,
    contentType: 'text/html',
  }));
  await page.goto('/dm-test');
}

test('asset path and query values are encoded without sending assetID as a parameter', async ({ page }) => {
  await open(page, [['assetID', 'folder/RV & road?#'], ['wid', '1200'], ['$text', 'Own & enjoy + explore?']]);
  const img = page.locator('.dynamic-media img');
  await expect(img).toHaveAttribute('src', `${service}folder/RV%20%26%20road%3F%23?wid=1200&%24text=Own+%26+enjoy+%2B+explore%3F`);
  await expect(img).toHaveAttribute('alt', 'folder/RV & road?#');
  await expect(img).toHaveJSProperty('naturalWidth', 1400);
  await page.setViewportSize({ width: 375, height: 800 });
  const bounds = await img.boundingBox();
  expect(bounds.width).toBeLessThanOrEqual(375);
  expect(bounds.height).toBeCloseTo(bounds.width / 2, 0);
});

test('duplicate rows use the last value and empty query values are retained', async ({ page }) => {
  await open(page, [['assetID', 'first'], ['ASSETID', 'second'], ['wid', '400'], ['wid', '800'], ['flag', '']]);
  await expect(page.locator('img')).toHaveAttribute('src', `${service}second?wid=800&flag=`);
});

['hero', '$hero$'].forEach((preset) => test(`image preset ${preset} uses a standalone token`, async ({ page }) => {
  await open(page, [['assetID', 'example'], ['image preset', preset], ['wid', '1200']]);
  await expect(page.locator('img')).toHaveAttribute('src', `${service}example?$hero$&wid=1200`);
}));

test('preset aliases use the last row and special characters stay inside the token', async ({ page }) => {
  await open(page, [['assetID', 'example'], ['imagePreset', 'old'], ['IMAGE-PRESET', '$RV & road?#$'], ['fmt', 'webp']]);
  await expect(page.locator('img')).toHaveAttribute('src', `${service}example?$RV%20%26%20road%3F%23$&fmt=webp`);
});

['image', 'content'].forEach((type) => test(`type ${type} selects its endpoint without a query parameter`, async ({ page }) => {
  await open(page, [['assetID', 'example'], ['type', type], ['image preset', 'hero'], ['wid', '1200']]);
  await expect(page.locator('img')).toHaveAttribute('src', `https://gdrv.scene7.com/is/${type}/granddesignrv/example?$hero$&wid=1200`);
}));

test('type aliases are case-insensitive and the last row wins', async ({ page }) => {
  await open(page, [['assetID', 'example'], ['type', 'image'], ['TYPE', ' Content ']]);
  await expect(page.locator('img')).toHaveAttribute('src', 'https://gdrv.scene7.com/is/content/granddesignrv/example');
});

[
  [],
  [['wid', '800']],
  [['assetID', '']],
  [['assetID', '../asset']],
  [['assetID', 'https://example.com/asset']],
  [['assetID', 'folder//asset']],
  [['assetID', 'asset'], ['', '800']],
  [['assetID', 'asset', 'extra']],
  [['assetID', 'asset'], ['image preset', '']],
  [['assetID', 'asset'], ['image preset', '$hero']],
  [['assetID', 'asset'], ['image preset', 'hero$']],
  [['assetID', 'asset'], ['image preset', '$$hero$$']],
  [['assetID', 'asset'], ['image preset', '$$']],
  [['assetID', 'asset'], ['type', 'video']],
  [['assetID', 'asset'], ['type', '']],
].forEach((rows, index) => test(`invalid authoring ${index + 1} shows an error without requesting an image`, async ({ page }) => {
  const images = [];
  page.on('request', (request) => {
    if (request.url().startsWith('https://gdrv.scene7.com/is/')) images.push(request.url());
  });
  await open(page, rows);
  await expect(page.getByRole('alert')).toContainText('Dynamic Media:');
  await expect(page.locator('img')).toHaveCount(0);
  expect(images).toEqual([]);
}));

test('image failures are visible instead of substituting an invented asset', async ({ page }) => {
  await open(page, [['assetID', 'unavailable']], true);
  await expect(page.getByRole('alert')).toContainText('The image could not load.');
  await expect(page.locator('img')).toHaveCount(0);
});
