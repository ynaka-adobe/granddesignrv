/* eslint-disable */
/* global WebImporter */

/**
 * cards-promo parser.
 * Source: aem-Grid row of three promo cards (Quality, Innovation, Connection).
 * Each card .cmp-container holds .cmp-image, .cmp-title, .cmp-text and .cmp-button.
 * Output: one row per card: [image, title heading + description + CTA link].
 */

function hasText(el) {
  return !!(el && el.textContent.replace(/ /g, ' ').trim());
}

function getImage(document, card) {
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
    const card = title.closest('.cmp-container') || title.parentElement;
    const content = [];

    const titleText = title.textContent.replace(/\s+/g, ' ').trim();
    if (titleText) {
      const h = document.createElement('h3');
      h.textContent = titleText;
      content.push(h);
    }

    card.querySelectorAll('.cmp-text > p').forEach((p) => {
      if (!hasText(p)) return;
      const np = document.createElement('p');
      np.innerHTML = p.innerHTML.trim();
      content.push(np);
    });

    card.querySelectorAll('a.cmp-button[href], .button a[href]').forEach((link, i, all) => {
      if (Array.prototype.indexOf.call(all, link) !== i) return;
      if (!hasText(link)) return;
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.replace(/\s+/g, ' ').trim();
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
    });

    const img = getImage(document, card);
    if (!img && !content.length) return;
    cells.push([img || '', content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
