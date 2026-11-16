/* eslint-disable */
/* global WebImporter */

/**
 * columns parser (launch-page "performance details").
 * Source: .performancedetails > section.cmp-performance-details > .cmp-performance-details__inner
 *   h2                                   section heading ("Built On Proven Performance")
 *   .cmp-performance-details__grid > article.cmp-performance-details__group (one per column)
 *     h3                                 group heading
 *     ul.cmp-performance-details__list > li
 *       .cmp-performance-details__label + .cmp-performance-details__value   (spec list)
 *       .cmp-performance-details__copy (<strong> title + text)               (feature list)
 *   p.cmp-performance-details__note      footnote
 * Icons (<i class="fad ...">) carry no authorable content and are dropped.
 * Output: <h2> (default content), columns block with one row, one cell per group (the two
 * groups sit side by side on the source): [h3 + <ul> of "<strong>label</strong><br>value"],
 * then the note <p> (default content).
 */

function clean(text) {
  return (text || '').replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
}

function listItem(document, li) {
  const item = document.createElement('li');
  const label = li.querySelector('.cmp-performance-details__label');
  const value = li.querySelector('.cmp-performance-details__value');
  const copy = li.querySelector('.cmp-performance-details__copy');
  if (label || value) {
    if (label && clean(label.textContent)) {
      const strong = document.createElement('strong');
      strong.textContent = clean(label.textContent);
      item.append(strong);
    }
    if (value && clean(value.textContent)) {
      if (item.childNodes.length) item.append(document.createElement('br'));
      item.append(document.createTextNode(clean(value.textContent)));
    }
  } else if (copy) {
    const title = copy.querySelector('strong, b');
    if (title && clean(title.textContent)) {
      const strong = document.createElement('strong');
      strong.textContent = clean(title.textContent);
      item.append(strong);
    }
    const rest = clean([...copy.childNodes].filter((n) => n !== title).map((n) => n.textContent).join(' '));
    if (rest) {
      if (item.childNodes.length) item.append(document.createElement('br'));
      item.append(document.createTextNode(rest));
    }
  } else if (clean(li.textContent)) {
    item.textContent = clean(li.textContent);
  }
  return clean(item.textContent) ? item : null;
}

/*
 * AEM grid row (Our Story intro): the matched element is the first .container column of a row
 * in an .aem-Grid (class aem-GridColumn--default--N); the following .container siblings that
 * complete the 12-column row are the other columns (e.g. 6 + 3 + 3: copy | photos | photos).
 * Output: one row, one cell per column, in source order: titles as h2, the rich text's own
 * paragraphs / headings / lists, images and button links. Hidden separators are not authored.
 * Container v2 rows and related-posts grids: see parseContainerV2 / parseRelatedPosts below.
 */
const GRID_COL = /\baem-GridColumn--default--(\d+)\b/;

function gridWidth(el) {
  const m = (el.className || '').match(GRID_COL);
  return m ? Number(m[1]) : 0;
}

function relativize(href) {
  if (!href) return href;
  const m = href.match(/^https?:\/\/(?:www\.)?granddesignrv\.com(\/[^#]*)?(#.*)?$/i);
  if (!m) return href;
  return `${(m[1] || '/').replace(/\.html$/, '')}${m[2] || ''}`;
}

function gridColumnCell(document, column) {
  const cell = [];
  column.querySelectorAll('.cmp-title, .cmp-text, .cmp-image img, .button a.cmp-button[href]').forEach((el) => {
    if (el.classList.contains('cmp-title')) {
      if (!clean(el.textContent)) return;
      const h2 = document.createElement('h2');
      h2.textContent = clean(el.textContent);
      cell.push(h2);
    } else if (el.classList.contains('cmp-text')) {
      [...el.children].forEach((child) => {
        if (!clean(child.textContent)) return;
        const copy = child.cloneNode(true);
        copy.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', relativize(a.getAttribute('href'))));
        cell.push(copy);
      });
    } else if (el.tagName === 'IMG') {
      const src = el.getAttribute('src') || el.getAttribute('data-src') || '';
      if (!src) return;
      const img = document.createElement('img');
      img.src = src;
      img.alt = clean(el.getAttribute('alt') || el.getAttribute('title'));
      // one paragraph per image, so stacked photos stay separate lines in the cell
      const p = document.createElement('p');
      p.append(img);
      cell.push(p);
    } else if (clean(el.textContent)) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = relativize(el.getAttribute('href'));
      a.textContent = clean(el.textContent);
      p.append(a);
      cell.push(p);
    }
  });
  return cell;
}

function parseGridRow(element, document) {
  const columns = [element];
  let width = gridWidth(element);
  for (let next = element.nextElementSibling; next && width < 12; next = next.nextElementSibling) {
    if (!next.matches('.container.responsivegrid') || !gridWidth(next)) break;
    columns.push(next);
    width += gridWidth(next);
  }
  const row = columns.map((column) => gridColumnCell(document, column)).filter((cell) => cell.length);
  columns.slice(1).forEach((column) => column.remove());
  if (!row.length) {
    element.remove();
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells: [row] });
  element.replaceWith(block);
}

/*
 * Container v2 row (Awards page badge row): the matched element is a .cmp-container-v2 grid with
 * more than one desktop column; each direct .container child is a column. Empty spacer columns
 * are not authored. Output: one row, one cell per non-empty column (images, titles, text, buttons).
 */
function parseContainerV2(element, document) {
  const columns = [...element.children].filter((c) => c.matches('.container.responsivegrid'));
  const row = columns.map((column) => gridColumnCell(document, column)).filter((cell) => cell.length);
  if (!row.length) {
    element.remove();
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells: [row] });
  element.replaceWith(block);
}

/*
 * Related posts grid (.related-content__grid of .blog-card, Awards page): one row, one cell per
 * card: [h3 title, copy paragraph (when present), "Read More" link]. Thumbnails are empty on the
 * source and are not authored.
 */
function parseRelatedPosts(element, document) {
  const row = [];
  element.querySelectorAll('.blog-card').forEach((card) => {
    const cell = [];
    const title = card.querySelector('.blog-card__meta__title');
    if (title && clean(title.textContent)) {
      const h3 = document.createElement('h3');
      h3.textContent = clean(title.textContent);
      cell.push(h3);
    }
    card.querySelectorAll('.blog-card__meta__copy').forEach((copy) => {
      if (!clean(copy.textContent)) return;
      const p = document.createElement('p');
      p.textContent = clean(copy.textContent);
      cell.push(p);
    });
    const more = card.querySelector('a.blog-card__meta__read-more[href]');
    if (more && clean(more.textContent)) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = relativize(more.getAttribute('href'));
      a.textContent = clean(more.textContent);
      p.append(a);
      cell.push(p);
    }
    if (cell.length) row.push(cell);
  });
  if (!row.length) {
    element.remove();
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells: [row] });
  element.replaceWith(block);
}

export default function parse(element, { document }) {
  if (element.matches('.cmp-container-v2')) {
    parseContainerV2(element, document);
    return;
  }
  if (element.matches('.related-content__grid')) {
    parseRelatedPosts(element, document);
    return;
  }
  if (!element.querySelector('.cmp-performance-details') && element.matches('.container.responsivegrid')
    && gridWidth(element) && gridWidth(element) < 12) {
    parseGridRow(element, document);
    return;
  }

  const inner = element.querySelector('.cmp-performance-details__inner') || element;
  const before = [];
  const after = [];

  const heading = [...inner.querySelectorAll('h2')].find((h) => !h.closest('.cmp-performance-details__group'));
  if (heading && clean(heading.textContent)) {
    const h2 = document.createElement('h2');
    h2.textContent = clean(heading.textContent);
    before.push(h2);
  }

  // one row, one column per group
  const row = [];
  inner.querySelectorAll('.cmp-performance-details__group').forEach((group) => {
    const cell = [];
    const title = group.querySelector('h3, h4');
    if (title && clean(title.textContent)) {
      const h3 = document.createElement('h3');
      h3.textContent = clean(title.textContent);
      cell.push(h3);
    }
    group.querySelectorAll('ul, ol').forEach((list) => {
      const ul = document.createElement('ul');
      [...list.children].filter((li) => li.tagName === 'LI').forEach((li) => {
        const item = listItem(document, li);
        if (item) ul.append(item);
      });
      if (ul.children.length) cell.push(ul);
    });
    if (cell.length) row.push(cell);
  });

  inner.querySelectorAll('.cmp-performance-details__note').forEach((note) => {
    if (!clean(note.textContent)) return;
    const p = document.createElement('p');
    p.textContent = clean(note.textContent);
    after.push(p);
  });

  if (!row.length) {
    element.replaceWith(...before, ...after);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells: [row] });
  element.replaceWith(...before, block, ...after);
}
