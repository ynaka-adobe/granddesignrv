/* eslint-disable */
/* global WebImporter */

/**
 * cards-model-list parser.
 * Source: Travel Trailers landing page model entries. Each model is an
 * .experiencefragment containing a .dynamicmedia spin viewer, logo image,
 * MSRP / length stats, headline, description and three CTA buttons.
 * The selector matches every entry (7); the first call builds ONE block with
 * one row (card) per entry in document order and removes the remaining
 * entries; later calls return early.
 * Output (Cards convention, 2 columns) per row:
 *   [product image] [logo p, stat p x2, h2, description p..., CTA p...]
 */

const SELECTOR = '.outer-block.margin-top-medium .aem-Grid > .experiencefragment:has(.dynamicmedia)';
const CONSUMED_ATTR = 'data-cards-model-list-consumed';
const SCENE7_BASE = 'https://gdrv.scene7.com/is/image/';

function hasText(el) {
  return !!(el && el.textContent.replace(/ /g, ' ').trim());
}

function cleanText(el) {
  return el.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

function relativize(href) {
  if (!href) return href;
  const m = href.match(/^https?:\/\/(?:www\.)?granddesignrv\.com(\/[^#]*)?(#.*)?$/i);
  if (!m) return href;
  return `${m[1] || '/'}${m[2] || ''}`;
}

function inModal(el) {
  return !!el.closest('form, .cmp-button__modal, .cmp-form');
}

function titleCase(slug) {
  return slug.split('-').filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getModelName(entry) {
  const explore = Array.from(entry.querySelectorAll('a.cmp-button[href]'))
    .find((a) => !inModal(a)
      && /^(?:https?:\/\/[^/]+)?\/travel-trailers\//i.test(a.getAttribute('href')));
  if (!explore) return '';
  const aria = explore.getAttribute('aria-label') || '';
  const m = aria.match(/Explore the (.+?) Travel Trailers?/i);
  if (m) return m[1].trim();
  const path = relativize(explore.getAttribute('href')).split(/[?#]/)[0];
  return titleCase(path.replace(/\/+$/, '').split('/').pop() || '');
}

function buildRow(document, entry) {
  const model = getModelName(entry);

  // Cell 1: product image from the Dynamic Media asset path (spin set first frame).
  // Viewer sprites inside the spin viewer are ignored.
  let productCell = '';
  // Live DOM: data-asset-path sits on div.s7dm-dynamic-media inside .dynamicmedia
  const dm = entry.querySelector('.dynamicmedia[data-asset-path], .dynamicmedia [data-asset-path]');
  const assetPath = dm ? (dm.getAttribute('data-asset-path') || '').trim() : '';
  if (assetPath) {
    const server = (dm.getAttribute('data-imageserver') || '').trim();
    const base = /^https:\/\/[^/]*scene7\.com\/is\/image\/$/i.test(server) ? server : SCENE7_BASE;
    const img = document.createElement('img');
    img.src = `${base}${assetPath.replace(/^\/+/, '')}`;
    img.alt = model ? `${model} travel trailer` : '';
    productCell = img;
  }

  const content = [];

  // Logo: first .image img outside the spin viewer (source alts are wrong)
  const logoSrc = Array.from(entry.querySelectorAll('.image img.cmp-image__image'))
    .find((img) => !img.closest('.dynamicmedia'));
  if (logoSrc) {
    const src = logoSrc.getAttribute('src') || logoSrc.getAttribute('data-src') || '';
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = model ? `${model} logo` : (logoSrc.getAttribute('alt') || '').trim();
      const p = document.createElement('p');
      p.append(img);
      content.push(p);
    }
  }

  // Stats: red overline label (h2) + value (h3 in the next .title sibling)
  entry.querySelectorAll('.title.gdrv-title.red').forEach((labelWrap) => {
    const label = labelWrap.querySelector('h2');
    if (!label || !hasText(label)) return;
    let valueWrap = labelWrap.nextElementSibling;
    while (valueWrap && !valueWrap.classList.contains('title')) valueWrap = valueWrap.nextElementSibling;
    const value = valueWrap && valueWrap.querySelector('h3');
    const p = document.createElement('p');
    p.append(document.createTextNode(cleanText(label)));
    if (value && hasText(value)) {
      p.append(document.createTextNode(' '));
      const strong = document.createElement('strong');
      strong.textContent = cleanText(value);
      p.append(strong);
    }
    content.push(p);
  });

  // Headline
  const headline = entry.querySelector('.title-font-aktiv-grotesk-bold h2');
  if (headline && hasText(headline)) {
    const h2 = document.createElement('h2');
    h2.textContent = cleanText(headline);
    content.push(h2);
  }

  // Description (skip empty / &nbsp;-only and modal/form content)
  entry.querySelectorAll('.text .cmp-text p').forEach((p) => {
    if (inModal(p) || !hasText(p)) return;
    const np = document.createElement('p');
    np.innerHTML = p.innerHTML.trim();
    np.querySelectorAll('a[href]').forEach((a) => {
      a.setAttribute('href', relativize(a.getAttribute('href')));
    });
    content.push(np);
  });

  // CTAs (Explore More, Find A Dealer, Brochure Download / Request)
  entry.querySelectorAll('.button a.cmp-button[href]').forEach((link) => {
    if (inModal(link) || !hasText(link)) return;
    const a = document.createElement('a');
    a.href = relativize(link.getAttribute('href'));
    a.textContent = cleanText(link);
    const p = document.createElement('p');
    p.append(a);
    content.push(p);
  });

  if (!productCell && !content.length) return null;
  return [productCell, content.length ? content : ''];
}

// Remove an entry; if it sits alone inside a .container.responsivegrid wrapper,
// remove that wrapper too.
function removeEntry(entry, outer) {
  const wrapper = entry.parentElement && entry.parentElement.closest('.container.responsivegrid');
  if (wrapper && wrapper !== outer && outer && outer.contains(wrapper)
    && !wrapper.classList.contains('outer-block')
    && cleanText(wrapper) === cleanText(entry)
    && wrapper.querySelectorAll('img').length === entry.querySelectorAll('img').length) {
    wrapper.remove();
  }
  // Always detach the entry itself so later parser calls see parentNode === null
  entry.remove();
}

export default function parse(element, { document }) {
  if (!element.isConnected) return;
  const doc = element.ownerDocument || document;
  const marker = doc.body || doc.documentElement;
  if (marker.hasAttribute(CONSUMED_ATTR)) return;
  marker.setAttribute(CONSUMED_ATTR, 'true');

  let entries = Array.from(doc.querySelectorAll(SELECTOR)).filter((e) => e.isConnected);
  if (!entries.includes(element)) entries.push(element);
  entries = entries.filter((e) => !entries.some((o) => o !== e && o.contains(e)));
  // jsdom can return :has() matches out of document order
  entries.sort((a, b) => {
    if (a === b) return 0;
    return (a.compareDocumentPosition(b) & 4) ? -1 : 1; // 4 = DOCUMENT_POSITION_FOLLOWING
  });

  const cells = [];
  entries.forEach((entry) => {
    const row = buildRow(document, entry);
    if (row) cells.push(row);
  });

  const outer = entries[0].closest('.outer-block.margin-top-medium');
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-model-list', cells });

  // Separators' hr.cmp-separator__horizontal-rule would become section breaks
  if (outer) outer.querySelectorAll('.separator').forEach((sep) => sep.remove());

  const [first, ...rest] = entries;
  rest.forEach((entry) => removeEntry(entry, outer));
  first.replaceWith(block);
}
