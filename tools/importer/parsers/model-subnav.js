/* eslint-disable */
/* global WebImporter */

/**
 * model-subnav parser.
 * Source: sticky model sub-navigation (.subnavigation > nav.gdrv-subnavigation):
 *   .subnav-left__item__title                 model name
 *   #floorplan-panel .option-card--floorplan  floorplan cards (thumbnail, name, Hitch / UVW /
 *                                             Length specs, "DEALER STOCK ONLY" flag)
 *   .subnav-left a[href^="#"]                 in-page section links
 *   .subnav-right .request-brochure           "Download Brochure" (a JS button: the PDF URL
 *                                             comes from a link when present, else from the
 *                                             page's <meta name="cludo:BrochureLink">)
 * "Ask an Expert" (lightbox form) is not authored.
 * Output (2 columns):
 *   [model name | Download Brochure link]
 *   [Floorplans | <ul>, one <li> per card: img, br, name link, br, "Hitch 3,500", br, ...]
 *   [Links      | <ul> of in-page links]
 */

const ORIGIN_RE = /^https?:\/\/(?:www\.)?granddesignrv\.com/i;

function clean(text) {
  return (text || '').replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
}

/* site page links become relative; DAM assets (PDFs, images) stay absolute */
function relativize(href) {
  if (!href) return '';
  const h = href.trim();
  if (!ORIGIN_RE.test(h)) return h;
  if (/^https?:\/\/[^/]+\/content\/dam\//i.test(h)) return h;
  const path = h.replace(ORIGIN_RE, '')
    .replace(/^\/content\/granddesignrv\/us\/en/, '')
    .replace(/\.html(?=$|[?#])/, '');
  return path || '/';
}

function absolute(href) {
  if (!href) return '';
  if (/^(https?:)?\/\//i.test(href)) return href;
  return `https://www.granddesignrv.com${href.startsWith('/') ? '' : '/'}${href}`;
}

function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  if (src && !/^(data|blob):/i.test(src)) return src;
  return img.getAttribute('data-src') || '';
}

function brochureLink(element, document) {
  const link = [...element.querySelectorAll('a[href]')]
    .find((a) => /\.pdf|brochure/i.test(a.getAttribute('href') || '') && /brochure/i.test(a.textContent));
  const meta = document.querySelector('meta[name="cludo:BrochureLink"]');
  const href = link ? link.getAttribute('href') : (meta && meta.getAttribute('content'));
  if (!href) return null;
  const labelEl = element.querySelector('.request-brochure .cmp-button__text');
  const a = document.createElement('a');
  a.href = /\/content\/dam\//i.test(href) ? absolute(href) : relativize(href);
  a.textContent = clean(link ? link.textContent : (labelEl && labelEl.textContent)) || 'Download Brochure';
  return a;
}

function floorplanItem(card, document) {
  const li = document.createElement('li');
  const parts = [];

  const name = clean((card.querySelector('.option-card__spec__name') || {}).textContent)
    || clean(card.getAttribute('title')).toUpperCase();

  const thumb = card.querySelector('.option-card__thumbnail img, img');
  if (thumb && imgSrc(thumb)) {
    const img = document.createElement('img');
    img.src = imgSrc(thumb);
    img.alt = name ? `${name} floorplan` : '';
    parts.push(img);
  }

  const href = card.getAttribute('href') || (card.querySelector('a[href]') || { getAttribute: () => '' }).getAttribute('href');
  if (name) {
    if (href) {
      const a = document.createElement('a');
      a.href = relativize(href);
      a.textContent = name;
      parts.push(a);
    } else {
      parts.push(document.createTextNode(name));
    }
  }

  card.querySelectorAll('.option-card__spec__item').forEach((item) => {
    const title = clean((item.querySelector('.option-card__spec__title') || {}).textContent);
    const value = clean((item.querySelector('.option-card__spec__value:not(.option-card__spec__name)') || {}).textContent);
    if (!title || !value) return;
    parts.push(document.createTextNode(`${title}: ${value}`));
  });

  const gridItem = card.closest('.grid__item');
  if (card.querySelector('.dealer-stock-text') || (gridItem && gridItem.classList.contains('dealer-stock'))) {
    parts.push(document.createTextNode('Dealer stock only'));
  }

  parts.forEach((part, i) => {
    if (i) li.append(document.createElement('br'));
    li.append(part);
  });
  return parts.length ? li : null;
}

export default function parse(element, { document }) {
  const cells = [];

  // Row 1: model name | brochure
  const nameEl = element.querySelector('.subnav-left__item__title, .subnav-left__items__brand');
  const modelName = clean(nameEl && nameEl.textContent)
    || clean((document.title || '').split('|').pop());
  const brochure = brochureLink(element, document);
  cells.push([modelName, brochure || '']);

  // Row 2: floorplan cards
  const cards = [...element.querySelectorAll('.option-card--floorplan')];
  const list = document.createElement('ul');
  cards.forEach((card) => {
    const li = floorplanItem(card, document);
    if (li) list.append(li);
  });
  if (list.children.length) cells.push(['Floorplans', list]);

  // Row 3: in-page section links
  const links = document.createElement('ul');
  element.querySelectorAll('.subnav-left a[href^="#"]').forEach((link) => {
    const label = clean(link.textContent) || clean(link.getAttribute('title'));
    if (!label || /ask an expert/i.test(label)) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.textContent = label;
    li.append(a);
    links.append(li);
  });
  if (links.children.length) cells.push(['Links', links]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'model-subnav', cells });
  element.replaceWith(block);
}
