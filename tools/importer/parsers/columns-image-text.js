/* eslint-disable */
/* global WebImporter */

/**
 * columns-image-text parser.
 * Source: intro row of the Travel Trailers landing page. The matched element is
 * the .inner-block__left column (image); its next sibling .inner-block__right
 * holds the H1, the red H2 subtitle and the .cmp-text body paragraphs.
 * Output (Columns convention): one row, two columns: [image] [h1, h2, p...].
 * A second, text-first layout (Careers: H1 + copy + CTA on the left, photo on the right) is
 * handled by parseTextFirst and keeps source order: [text] [image].
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

function imageFrom(container, document) {
  const srcImg = container.querySelector('img.cmp-image__image') || container.querySelector('img');
  if (!srcImg) return '';
  const src = srcImg.getAttribute('src') || srcImg.getAttribute('data-src') || '';
  if (!src) return '';
  const img = document.createElement('img');
  img.src = src;
  img.alt = (srcImg.getAttribute('alt') || srcImg.getAttribute('title') || '').trim();
  return img;
}

function removeHiddenSeparators(grid) {
  if (!grid) return;
  Array.from(grid.children).forEach((child) => {
    if (child.classList.contains('separator')
      && (child.classList.contains('cmp-separator--hidden') || child.querySelector('.cmp-separator--hidden'))) {
      child.remove();
    }
  });
}

/*
 * Text-first layout (Careers): .inner-block__left holds the H1, the .cmp-text copy and a
 * .button CTA; the next sibling .inner-block__right holds the photo.
 * Output: one row, two cells in source order: [h1, (h2), p..., CTA] [image].
 * The CTA (a solid source button) is emitted as <p><strong><a></a></strong></p>.
 */
function parseTextFirst(element, right, document) {
  const content = [];
  element.querySelectorAll('.cmp-title h1, .cmp-title h2, .cmp-title h3, .cmp-title h4, .cmp-text p, .cmp-text h2, .cmp-text h3, .cmp-text h4, .button a.cmp-button[href]')
    .forEach((el) => {
      if (!hasText(el)) return;
      if (el.closest('.cmp-title')) {
        const isH1 = el.tagName === 'H1';
        if (!isH1 && !content.some((n) => n.tagName === 'H1')) return;
        const nh = document.createElement(isH1 ? 'h1' : 'h2');
        nh.textContent = cleanText(el);
        content.push(nh);
      } else if (el.tagName === 'A') {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        const a = document.createElement('a');
        a.setAttribute('href', relativize(el.getAttribute('href')));
        a.textContent = cleanText(el);
        strong.append(a);
        p.append(strong);
        content.push(p);
      } else {
        const isHeading = /^H\d$/.test(el.tagName);
        const np = document.createElement(isHeading ? 'h3' : 'p');
        np.innerHTML = el.innerHTML.trim();
        np.querySelectorAll('a[href]').forEach((a) => {
          a.setAttribute('href', relativize(a.getAttribute('href')));
        });
        content.push(np);
      }
    });

  const cells = [[content.length ? content : '', imageFrom(right, document)]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-image-text', cells });
  removeHiddenSeparators(element.parentElement);
  right.remove();
  element.replaceWith(block);
}

/*
 * Plain grid row (Rally Calendar intro): no inner-block__left/right classes; the matched element
 * is a .container column holding the H1 title, copy and CTA, and its next sibling .container
 * holds only the photo. Rendered like the text-first layout: [text] [image].
 * Only used when there is no .inner-block__right sibling (all other templates' instances
 * require one), so their output is unchanged.
 */
function plainImageColumn(element, next) {
  if (!next || !next.matches('.container.responsivegrid')) return null;
  if (!element.querySelector('.cmp-title h1')) return null;
  if (!next.querySelector('.cmp-image img') || next.querySelector('.cmp-title, .cmp-text')) return null;
  return next;
}

/*
 * Featured blog post (Adventure More, React "BlogPosts" app): .featured-post > .card with the
 * thumbnail, h4 title, optional byline and teaser; no link in the DOM (the app navigates on
 * click), the post path is the app's data-prop-featured-post (/content/granddesignrv/us/en/…).
 * Output: one row, two cells: [image] [h3 title linked to the post, byline, teaser].
 */
function parseFeaturedPost(element, document) {
  const card = element.querySelector('.card') || element;
  const titleEl = card.querySelector('.card__title');
  const title = titleEl ? cleanText(titleEl) : '';
  const app = element.closest('[data-prop-featured-post]');
  const path = app ? app.getAttribute('data-prop-featured-post').trim() : '';
  const href = path.replace(/^\/content\/granddesignrv\/us\/en(?=\/)/, '').replace(/\.html$/, '');
  const content = [];
  if (title) {
    const h3 = document.createElement('h3');
    if (href.startsWith('/')) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = title;
      h3.append(a);
    } else {
      h3.textContent = title;
    }
    content.push(h3);
  }
  card.querySelectorAll('.card__byline, .card__body').forEach((el) => {
    if (!hasText(el)) return;
    const p = document.createElement('p');
    p.textContent = cleanText(el);
    content.push(p);
  });
  let image = '';
  const srcImg = card.querySelector('.card__media img, img');
  const src = srcImg ? (srcImg.getAttribute('src') || '') : '';
  if (src && !/^(data|blob):/i.test(src)) {
    image = document.createElement('img');
    image.src = /%[0-9a-f]{2}/i.test(src) ? src : encodeURI(src);
    image.alt = title;
  }
  if (!image && !content.length) {
    element.remove();
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-image-text', cells: [[image, content.length ? content : '']] });
  element.replaceWith(block);
}

export default function parse(element, { document }) {
  if (element.matches('.featured-post')) {
    parseFeaturedPost(element, document);
    return;
  }
  const next = element.nextElementSibling;
  const right = next && next.classList.contains('inner-block__right') ? next : null;

  const imageColumn = right ? null : plainImageColumn(element, next);
  if (imageColumn) {
    parseTextFirst(element, imageColumn, document);
    return;
  }

  // Text-first layout (Careers): H1 on the left, photo on the right. The image-first layout
  // (Travel Trailers, category landing pages) always has its H1 on the right and keeps the path below.
  if (right && element.querySelector('h1') && !right.querySelector('h1')) {
    parseTextFirst(element, right, document);
    return;
  }

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
    // Subtitle: first title heading after the H1 (h2 on Travel Trailers, h3 on the other
    // category landing pages), always emitted as h2. Same single row, two cells: [image] [text].
    const h2 = [...right.querySelectorAll('.cmp-title h2, .cmp-title h3, .cmp-title h4, h2')]
      .find((h) => hasText(h) && !h.closest('.cmp-text'));
    if (h2) {
      const nh = document.createElement('h2');
      nh.textContent = cleanText(h2);
      content.push(nh);
    }
    // Body (text cell): paragraphs, plus headings authored inside the rich text
    // (e.g. a closing "Shop and Compare" link set as an h3).
    right.querySelectorAll('.cmp-text p, .cmp-text h2, .cmp-text h3, .cmp-text h4').forEach((p) => {
      if (!hasText(p)) return;
      const isHeading = /^H\d$/.test(p.tagName);
      const np = document.createElement(isHeading ? 'h3' : 'p');
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
