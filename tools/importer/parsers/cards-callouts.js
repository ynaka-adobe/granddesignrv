/* eslint-disable */
/* global WebImporter */

/**
 * cards-callouts parser.
 * Source: aem-Grid strip of icon + label items (Find a dealer, Shop Inventory,
 * Factory Tour, Ask an Expert). Each item is a .cmp-container whose link lives
 * in an onclick="location.href='...'" attribute (the inner <a class="cmp-image__link">
 * has no href). Output: one row per item: [icon image, linked label heading].
 */

const ORIGIN = 'https://www.granddesignrv.com';

// fallbacks when the onclick target is missing or is an experience-fragment path
const LABEL_LINKS = {
  'find a dealer': `${ORIGIN}/shopping-tools/find-a-dealer`,
  'shop inventory': `${ORIGIN}/shop-inventory`,
  'factory tour': `${ORIGIN}/shopping-tools/factory-tours`,
  'ask an expert': `${ORIGIN}/ask-an-expert`,
};

function normalizeAemPath(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.includes('/experience-fragments/')) return '';
  let p = path.replace(/^\/content\/granddesignrv\/us\/en/, '').replace(/\.html$/, '');
  if (!p.startsWith('/')) p = `/${p}`;
  return `${ORIGIN}${p}`;
}

function findLink(card, label) {
  let node = card;
  while (node && node.getAttribute) {
    const onclick = node.getAttribute('onclick') || '';
    const m = onclick.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
    if (m) {
      const href = normalizeAemPath(m[1]);
      if (href) return href;
      break;
    }
    const a = node.querySelector && node.querySelector('a[href]');
    if (a) return a.getAttribute('href');
    if (node.matches && node.matches('.cmp-container') && node !== card) break;
    node = node.parentElement;
  }
  return LABEL_LINKS[label.toLowerCase()] || '';
}

function getIcon(document, card) {
  const srcImg = card.querySelector('.cmp-image img, img');
  const holder = card.querySelector('.cmp-image');
  const src = (srcImg && (srcImg.getAttribute('src') || srcImg.getAttribute('data-src')))
    || (holder && holder.getAttribute('data-cmp-src'))
    || '';
  if (!src) return null;
  const img = document.createElement('img');
  img.src = src;
  img.alt = ((srcImg && (srcImg.getAttribute('alt') || srcImg.getAttribute('title'))) || '').trim();
  return img;
}

export default function parse(element, { document }) {
  const cells = [];
  const titles = Array.from(element.querySelectorAll('.cmp-title'));

  titles.forEach((title) => {
    const label = title.textContent.replace(/\s+/g, ' ').trim();
    if (!label) return;
    const card = title.closest('.cmp-container') || title.parentElement;
    const icon = getIcon(document, card);
    const href = findLink(card, label);

    const heading = document.createElement('h3');
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      heading.append(a);
    } else {
      heading.textContent = label;
    }
    cells.push([icon || '', heading]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-callouts', cells });
  element.replaceWith(block);
}
