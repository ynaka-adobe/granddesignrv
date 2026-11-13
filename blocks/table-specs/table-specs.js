/*
 * table-specs
 * Floorplan specification table: first row = floorplan names, first column = spec labels,
 * an optional last row of links (VIEW). Any number of floorplan columns.
 * Wide screens: fixed label column, horizontal scroll with a right-edge fade.
 * Small screens: a select shows one floorplan column at a time, with a "View details" link
 * to the selected floorplan.
 * Like the source, every spec row gets the height of the tallest one.
 */

let instance = 0;

function isLinkRow(cells) {
  const values = cells.slice(1);
  return values.length > 0
    && values.every((c) => !c.textContent.trim() || (c.querySelector('a[href]') && c.textContent.trim() === c.querySelector('a[href]').textContent.trim()))
    && values.some((c) => c.querySelector('a[href]'));
}

function buildTable(rows) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  rows.forEach((row, r) => {
    const cells = [...row.children];
    const tr = document.createElement('tr');
    const linkRow = r > 0 && r === rows.length - 1 && isLinkRow(cells);
    if (linkRow) tr.className = 'table-specs-links';
    cells.forEach((cell, c) => {
      let el;
      if (r === 0) {
        el = document.createElement(c === 0 && !cell.textContent.trim() ? 'td' : 'th');
        if (el.tagName === 'TH') el.scope = 'col';
      } else if (c === 0) {
        el = document.createElement(cell.textContent.trim() ? 'th' : 'td');
        if (el.tagName === 'TH') el.scope = 'row';
      } else {
        el = document.createElement('td');
      }
      el.dataset.col = c;
      if (c === 0) el.classList.add('table-specs-label');
      el.append(...cell.childNodes);
      // links in cells are table links, not the global CTA buttons
      el.querySelectorAll('.button-container').forEach((p) => p.classList.remove('button-container'));
      el.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
      tr.append(el);
    });
    (r === 0 ? thead : tbody).append(tr);
  });

  const specRows = [...tbody.rows].filter((tr) => !tr.classList.contains('table-specs-links'));
  if (specRows.length) specRows[specRows.length - 1].classList.add('table-specs-last');
  return table;
}

function showColumn(table, col) {
  table.querySelectorAll('[data-col]').forEach((cell) => {
    const c = Number(cell.dataset.col);
    cell.classList.toggle('is-col-off', c !== 0 && c !== col);
  });
}

// every spec row as tall as the tallest one (as on the source)
function equalizeRows(block, table) {
  block.style.removeProperty('--table-specs-row-h');
  const rows = [...table.tBodies[0].rows].filter((tr) => !tr.classList.contains('table-specs-links'));
  // a row closing the table carries a bottom border on top of the shared height
  const bottomBorder = (tr) => Math.max(0, ...[...tr.cells]
    .map((c) => parseFloat(getComputedStyle(c).borderBottomWidth) || 0));
  const height = (tr) => tr.getBoundingClientRect().height - bottomBorder(tr);
  const max = Math.max(0, ...rows.map(height));
  if (max) block.style.setProperty('--table-specs-row-h', `${Math.ceil(max)}px`);
}

function watchRows(block, table) {
  let width = 0;
  let frame = 0;
  const update = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => equalizeRows(block, table));
  };
  if (window.ResizeObserver) {
    new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      if (w === width) return;
      width = w;
      update();
    }).observe(block);
  }
  if (document.fonts) document.fonts.ready.then(update);
  update();
  return update;
}

export default function decorate(block) {
  instance += 1;
  const id = `table-specs-${instance}`;
  const rows = [...block.children].filter((row) => row.children.length);
  if (!rows.length) return;

  const table = buildTable(rows);
  const headCells = Array.from(table.tHead.rows[0].cells);
  const names = headCells.slice(1).map((cell) => cell.textContent.replace(/\s+/g, ' ').trim());
  block.style.setProperty('--table-specs-cols', Math.max(names.length, 1));

  const linkCells = table.querySelector('.table-specs-links')?.cells;
  const linkFor = (col) => linkCells?.[col]?.querySelector('a[href]');

  // small screens: pick one floorplan column
  const picker = document.createElement('div');
  picker.className = 'table-specs-picker';
  const label = document.createElement('label');
  label.htmlFor = `${id}-select`;
  label.textContent = headCells[0].textContent.trim() || 'Floorplan';
  const select = document.createElement('select');
  select.id = `${id}-select`;
  names.forEach((name, i) => {
    const option = document.createElement('option');
    option.value = String(i + 1);
    option.textContent = name || `Column ${i + 1}`;
    select.append(option);
  });
  select.setAttribute('aria-controls', `${id}-table`);
  picker.append(label, select);

  table.id = `${id}-table`;
  const scroller = document.createElement('div');
  scroller.className = 'table-specs-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', label.textContent === 'Floorplan' ? 'Specifications' : `${label.textContent} specifications`);
  scroller.append(table);

  const frame = document.createElement('div');
  frame.className = 'table-specs-frame';
  frame.append(scroller);

  // small screens: link to the selected floorplan (the VIEW row is hidden there)
  let cta;
  if (linkCells) {
    cta = document.createElement('p');
    cta.className = 'table-specs-cta';
    const a = document.createElement('a');
    a.textContent = 'View details';
    cta.append(a);
  }
  const updateCta = (col) => {
    if (!cta) return;
    const link = linkFor(col);
    cta.hidden = !link;
    if (link) cta.firstElementChild.href = link.href;
  };

  block.replaceChildren(...(names.length > 1 ? [picker] : []), frame, ...(cta ? [cta] : []));
  showColumn(table, 1);
  updateCta(1);
  const remeasure = watchRows(block, table);
  select.addEventListener('change', () => {
    const col = Number(select.value);
    showColumn(table, col);
    updateCta(col);
    remeasure();
  });
}
