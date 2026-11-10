/* eslint-disable */
/* global WebImporter */

/**
 * carousel-hero parser.
 * Source: AEM Core carousel (.carousel.panelcontainer) with .cmp-carousel__item slides.
 * Each slide: background image in .dynamic-media-container__image, text in
 * .cmp-herov2 (title / text / button) or .cmp-text + .cmp-button.
 * Output: one row per slide: [image, text (heading, paragraph(s), CTA link)].
 * Empty headings / paragraphs (e.g. &nbsp; spacers) are skipped.
 */

function hasText(el) {
  return !!(el && el.textContent.replace(/ /g, ' ').trim());
}

function cleanImageSrc(src) {
  // drop the "$Mobile$" Scene7 preset so the full-size rendition is used
  return (src || '').replace(/[?&]\$Mobile\$$/, '').replace(/\?\$Mobile\$&/, '?');
}

function buildImage(document, slide) {
  const srcImg = slide.querySelector('.dynamic-media-container__image img')
    || slide.querySelector('picture img, img');
  if (!srcImg) return null;
  const src = srcImg.getAttribute('src') || srcImg.getAttribute('data-src') || '';
  if (!src) return null;
  const img = document.createElement('img');
  img.src = cleanImageSrc(src);
  img.alt = (srcImg.getAttribute('alt') || srcImg.getAttribute('title') || '').trim();
  return img;
}

function buildText(document, slide) {
  const content = [];
  const nodes = slide.querySelectorAll(
    'h1, h2, h3, h4, h5, h6, .cmp-herov2__text, .cmp-text > p, a[href]',
  );
  nodes.forEach((node) => {
    if (node.closest('.dynamic-media-container__image')) return;
    if (node.matches('a[href]')) {
      // links inside a text paragraph are carried by that paragraph
      if (node.closest('.cmp-herov2__text, .cmp-text > p')) return;
      if (!hasText(node)) return;
      const a = document.createElement('a');
      a.href = node.getAttribute('href');
      a.textContent = node.textContent.replace(/\s+/g, ' ').trim();
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
      return;
    }
    if (!hasText(node)) return;
    if (/^H[1-6]$/.test(node.tagName)) {
      const h = document.createElement(node.tagName.toLowerCase());
      h.textContent = node.textContent.replace(/\s+/g, ' ').trim();
      content.push(h);
      return;
    }
    const p = document.createElement('p');
    p.innerHTML = node.innerHTML.trim();
    content.push(p);
  });
  return content;
}

export default function parse(element, { document }) {
  const cells = [];
  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (!slides.length) slides = Array.from(element.querySelectorAll('.dynamic-media-container'));

  slides.forEach((slide) => {
    const img = buildImage(document, slide);
    const text = buildText(document, slide);
    if (!img && !text.length) return;
    cells.push([img || '', text.length ? text : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
