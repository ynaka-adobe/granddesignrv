/* eslint-disable */
/* global WebImporter */

/**
 * table-specs parser.
 * Source: "Product Line Specifications" content fragment (.spectable), a div grid, not a <table>:
 *   .header-floorplan-select        mobile floorplan <select> (same data; not authored)
 *   .specTable > .specCol           .specLabel spec names (UVW, Hitch, ..., MSRP; last is an
 *                                   empty .end-filler)
 *   .specTable > .specContent > .specColContent (one per floorplan)
 *                                   .specCellHeader name, .specCell values in label order, then
 *                                   .button-specCell-desktop with <a href><button>VIEW</button></a>
 *   .button-specCell-mobile         mobile VIEW link for the selected floorplan (not authored)
 * The VIEW <button> sits inside an <a> (invalid nesting), so buttons are never iterated: the
 * stable column wrappers (.specColContent) are, and each column's link is paired with it by
 * document order (column-scoped first, then the n-th desktop link, then the select's
 * data-floorplan-url for that floorplan name).
 * When a page holds more than one .spectable (desktop + mobile copy), ONE block is built from
 * the most complete table and the other copies are removed.
 * Output (Table convention): [empty | floorplan names...], one row per spec
 *   [label | values...], last row [empty | VIEW links...]
 */

const ORIGIN_RE = /^https?:\/\/(?:www\.)?granddesignrv\.com/i;

function clean(text) {
  return (text || '').replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
}

function relativize(href) {
  if (!href) return '';
  const h = href.trim();
  if (/^\/content\/granddesignrv\//.test(h) || ORIGIN_RE.test(h)) {
    if (/\/content\/dam\//i.test(h)) return h;
    const path = h.replace(ORIGIN_RE, '')
      .replace(/^\/content\/granddesignrv\/us\/en/, '')
      .replace(/\.html(?=$|[?#])/, '');
    return path || '/';
  }
  return h;
}

function columnsOf(table) {
  return [...table.querySelectorAll('.specColContent')]
    .filter((col) => clean((col.querySelector('.specCellHeader') || {}).textContent));
}

function isHidden(el) {
  return !!el.closest('.aem-GridColumn--default--hide');
}

export default function parse(element, { document }) {
  if (!element.isConnected) return;

  // pick the most complete visible copy; drop the others
  const all = [...document.querySelectorAll('.spectable')];
  const candidates = all.length ? all : [element];
  const ranked = candidates
    .map((t) => ({ t, score: columnsOf(t).length * 100 + t.querySelectorAll('.specLabel').length - (isHidden(t) ? 10000 : 0) }))
    .sort((a, b) => b.score - a.score);
  const source = ranked[0].t;

  const labels = [...source.querySelectorAll('.specCol .specLabel')]
    .filter((l) => !l.classList.contains('end-filler'))
    .map((l) => clean(l.textContent));
  const columns = columnsOf(source);

  // link fallbacks: desktop VIEW links in document order, and the mobile select's URLs
  const desktopLinks = [...source.querySelectorAll('.specContent a[href]')]
    .filter((a) => !a.closest('.button-specCell-mobile'));
  const urlByName = {};
  source.querySelectorAll('.header-floorplan-select option').forEach((opt) => {
    const url = opt.getAttribute('data-floorplan-url');
    if (url) urlByName[clean(opt.getAttribute('value') || opt.textContent).toUpperCase()] = relativize(url);
  });

  const cells = [];
  if (columns.length && labels.length) {
    const names = columns.map((col) => clean(col.querySelector('.specCellHeader').textContent));
    cells.push(['', ...names]);

    const values = columns.map((col) => [...col.querySelectorAll('.specCell')]
      .filter((c) => !/button-specCell/.test(c.className))
      .map((c) => clean(c.textContent)));
    labels.forEach((label, r) => {
      cells.push([label, ...values.map((v) => v[r] || '')]);
    });

    const links = columns.map((col, i) => {
      const own = col.querySelector('a[href]');
      const paired = own || (desktopLinks.length === columns.length ? desktopLinks[i] : null);
      const href = paired ? relativize(paired.getAttribute('href')) : urlByName[names[i].toUpperCase()];
      if (!href) return '';
      const link = document.createElement('a');
      link.href = href;
      link.textContent = clean(paired && paired.textContent) || 'VIEW';
      return link;
    });
    if (links.some(Boolean)) cells.push(['', ...links]);
  }

  candidates.forEach((t) => { if (t !== element && t.isConnected) t.remove(); });

  if (!cells.length) {
    element.remove();
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'table-specs', cells });
  element.replaceWith(block);
}
