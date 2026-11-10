/* eslint-disable */
/* global WebImporter */

/**
 * columns-image-text parser.
 * Source: intro row of the Travel Trailers landing page. The matched element is
 * the .inner-block__left column (image); its next sibling .inner-block__right
 * holds the H1, the red H2 subtitle and the .cmp-text body paragraphs.
 * Output (Columns convention): one row, two columns: [image] [h1, h2, p...].
 */

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

export default function parse(element, { document }) {
  const next = element.nextElementSibling;
  const right = next && next.classList.contains('inner-block__right') ? next : null;

  // Column 1: image (drop the empty a.cmp-image__link wrapper)
  let imgCell = '';
  const srcImg = element.querySelector('img.cmp-image__image') || element.querySelector('img');
  if (srcImg) {
    const src = srcImg.getAttribute('src') || srcImg.getAttribute('data-src') || '';
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = (srcImg.getAttribute('alt') || srcImg.getAttribute('title') || '').trim();
      imgCell = img;
    }
  }

  // Column 2: H1, H2 subtitle, body paragraphs
  const content = [];
  if (right) {
    const h1 = right.querySelector('h1');
    if (h1 && hasText(h1)) {
      const nh = document.createElement('h1');
      nh.textContent = cleanText(h1);
      content.push(nh);
    }
    const h2 = right.querySelector('h2');
    if (h2 && hasText(h2)) {
      const nh = document.createElement('h2');
      nh.textContent = cleanText(h2);
      content.push(nh);
    }
    right.querySelectorAll('.cmp-text p').forEach((p) => {
      if (!hasText(p)) return;
      const np = document.createElement('p');
      np.innerHTML = p.innerHTML.trim();
      np.querySelectorAll('a[href]').forEach((a) => {
        a.setAttribute('href', relativize(a.getAttribute('href')));
      });
      content.push(np);
    });
  }

  const cells = [[imgCell, content.length ? content : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-image-text', cells });

  // Remove the hidden separator in the same grid (its hr would become a section break).
  const grid = element.parentElement;
  if (grid) {
    Array.from(grid.children).forEach((child) => {
      if (child.classList.contains('separator')
        && (child.classList.contains('cmp-separator--hidden') || child.querySelector('.cmp-separator--hidden'))) {
        child.remove();
      }
    });
  }

  if (right) right.remove();
  element.replaceWith(block);
}
