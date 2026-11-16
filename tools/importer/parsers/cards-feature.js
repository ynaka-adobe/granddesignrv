/* eslint-disable */
/* global WebImporter */

/**
 * cards-feature parser.
 * Source: Our Story dark band ("More Than a Purchase, It's a Promise."). The matched element is
 * the full-width dark .container; inside it:
 *   .title (red display h1) + .title (white h3)      band heading + subtitle
 *   .container > ... > .container                   one per feature:
 *     .inner-block__left .cmp-image img              icon
 *     .cmp-title h1                                  feature title
 *     .cmp-text p                                    description
 * A feature card is the nearest ancestor of a feature title that holds an image and no other
 * title; titles with no such ancestor inside the band are the band heading/subtitle.
 * Output: band heading as <h2> + subtitle as <h3> (default content), then a cards-feature block
 * (Cards convention, 2 columns): one row per feature: [icon image] [h3 title + description].
 */

function clean(text) {
  return (text || '').replace(/[\u00a0\u200b]/g, ' ').replace(/\s+/g, ' ').trim();
}

function cardOf(title, element) {
  for (let n = title.parentElement; n && n !== element; n = n.parentElement) {
    if (n.querySelectorAll('.cmp-title').length > 1) return null;
    if (n.querySelector('img')) return n;
  }
  return null;
}

export default function parse(element, { document }) {
  const before = [];
  const cards = [];

  element.querySelectorAll('.cmp-title').forEach((title) => {
    const text = clean(title.textContent);
    if (!text) return;
    const card = cardOf(title, element);
    if (!card) {
      const h = document.createElement(before.length ? 'h3' : 'h2');
      h.textContent = text;
      before.push(h);
      return;
    }
    if (cards.some((c) => c.card === card)) return;
    cards.push({ card, title: text });
  });

  const cells = [];
  cards.forEach(({ card, title }) => {
    // column 1: icon image
    const srcImg = card.querySelector('.cmp-image img, img');
    const src = srcImg && (srcImg.getAttribute('src') || srcImg.getAttribute('data-src'));
    if (!src) return;
    const img = document.createElement('img');
    img.src = src;
    img.alt = clean(srcImg.getAttribute('alt') || srcImg.getAttribute('title'));

    // column 2: title heading + description
    const content = [];
    const h3 = document.createElement('h3');
    h3.textContent = title;
    content.push(h3);
    card.querySelectorAll('.cmp-text p').forEach((p) => {
      if (!clean(p.textContent)) return;
      const np = document.createElement('p');
      np.innerHTML = p.innerHTML.trim();
      content.push(np);
    });

    cells.push([img, content]);
  });

  if (!cells.length) {
    element.replaceWith(...before);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(...before, block);
}
