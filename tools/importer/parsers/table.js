/* eslint-disable */
/* global WebImporter */

/**
 * table parser (boilerplate table block, default variant with a header row).
 * Source: a data table authored in rich text (.cmp-text table, e.g. the Rally Calendar's
 * table.responsive-table: Start | End | Rally | Rally Location | Registration Start | Status).
 * Output (Table convention): after the name row, one row per source row, one cell per column;
 * the source header row comes first (the block renders it as <thead>). Cell text is kept, a
 * cell that is a single link keeps the link (site links made relative), &nbsp; cells stay empty.
 */

function clean(text) {
  return (text || '').replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
}

function relativize(href) {
  if (!href) return href;
  const m = href.match(/^https?:\/\/(?:www\.)?granddesignrv\.com(\/[^#]*)?(#.*)?$/i);
  const path = m ? `${m[1] || '/'}${m[2] || ''}` : href;
  return path.replace(/^\/content\/granddesignrv\/us\/en(?=\/)/, '').replace(/\.html(?=$|[?#])/, '');
}

function cellContent(document, cell) {
  const links = [...cell.querySelectorAll('a[href]')].filter((a) => clean(a.textContent));
  if (links.length === 1 && clean(links[0].textContent) === clean(cell.textContent)) {
    const a = document.createElement('a');
    a.href = relativize(links[0].getAttribute('href'));
    a.textContent = clean(links[0].textContent);
    return a;
  }
  return clean(cell.textContent);
}

export default function parse(element, { document }) {
  const table = element.matches('table') ? element : element.querySelector('table');
  if (!table) return;

  const cells = [];
  table.querySelectorAll('tr').forEach((tr) => {
    const row = [...tr.children].filter((c) => /^T[HD]$/.test(c.tagName)).map((c) => cellContent(document, c));
    if (row.some((c) => (typeof c === 'string' ? c : c.textContent))) cells.push(row);
  });
  if (!cells.length) {
    table.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'table', cells });
  // the rich-text wrapper (.table-container) only carries an inline margin
  const wrapper = table.parentElement && table.parentElement.matches('.table-container') ? table.parentElement : table;
  wrapper.replaceWith(block);
}
