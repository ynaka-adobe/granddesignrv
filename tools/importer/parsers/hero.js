/* eslint-disable */
/* global WebImporter */

/**
 * hero parser (boilerplate hero block).
 * Source: full-width teaser band (.container.responsivegrid.full-width, e.g. gdrv-teaser-hero)
 * whose direct child is section.dynamic-media-container:
 *   .dynamic-media-container__image picture   background photo (<source> per breakpoint, the
 *                                             first / widest one is the full-size rendition;
 *                                             the <img> only carries the mobile one)
 *   .cmp-container .cmp-title                 optional overlay title (National Rally)
 * Hidden spacer separators are not authored.
 * Output (Hero convention, 1 column): row 1 (after the name row): background image;
 * row 2: title as <h1> (left empty when the band has no title, e.g. photo-only teaser heroes).
 */

function clean(text) {
  return (text || '').replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
}

function pictureSrc(picture) {
  const source = [...picture.querySelectorAll('source[srcset]')]
    .map((s) => s.getAttribute('srcset').split(',')[0].trim().split(/\s+/)[0])
    .find(Boolean);
  const img = picture.querySelector('img');
  const src = source || (img && (img.getAttribute('src') || img.getAttribute('data-src'))) || '';
  return /^(data|blob):/i.test(src) ? '' : src;
}

export default function parse(element, { document }) {
  const picture = element.querySelector('.dynamic-media-container__image picture');
  const src = picture ? pictureSrc(picture) : '';
  const title = [...element.querySelectorAll('.cmp-title')].find((t) => clean(t.textContent));
  if (!src && !title) {
    element.remove();
    return;
  }

  let image = '';
  if (src) {
    const srcImg = picture.querySelector('img');
    image = document.createElement('img');
    image.src = src;
    image.alt = clean(srcImg && srcImg.getAttribute('alt'));
  }

  let heading = '';
  if (title) {
    heading = document.createElement('h1');
    heading.textContent = clean(title.textContent);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells: [[image], [heading]] });
  element.replaceWith(block);
}
