import { fetchPlaceholders } from '../../scripts/aem.js';

const PAGE_SIZE = 9;
const MAX_COMPARE = 4;
const DEBOUNCE_MS = 100;

/* UI chrome copy. Each key can be overridden from the placeholders sheet
   (e.g. key "Shop Compare Sort By" -> shopCompareSortBy). */
const LABELS = {
  shopCompareSortBy: 'Sort By:',
  shopComparePriceAsc: 'Price low to high',
  shopComparePriceDesc: 'Price high to low',
  shopCompareCompare: 'Compare',
  shopCompareResetFilters: 'Reset Filters',
  shopCompareFilters: 'Filters',
  shopCompareSeeResults: 'See Results',
  shopCompareStatus: 'Showing Page <b>{page}</b> of <b>{pages}</b> exact matches for floor plans.',
  shopCompareNoResults: 'No floor plans match your filters.',
  shopCompareStartingAt: 'Starting at',
  shopCompareSeeDetails: 'See Details',
  shopCompareViewInventory: 'View Inventory',
  shopComparePrevious: 'Previous',
  shopCompareNext: 'Next',
  shopCompareDialogTitle: 'Compare Selected Floorplans',
  shopCompareClose: 'Close',
  shopCompareRemove: 'Remove {title} from compare',
  shopCompareMaxReached: 'You can compare up to 4 floor plans.',
  shopCompareDealerStock: ' - Dealer Stock Only',
  shopCompareCategory: 'Category',
  shopCompareSleeps: 'Sleeps',
  shopCompareWeight: 'Weight',
  shopCompareLength: 'Length',
  shopCompareHitchWeight: 'Hitch-Weight',
  shopCompareBrands: 'Brands',
  shopCompareTowable: 'Towable - UVW',
  shopCompareMotorized: 'Motorized - GVWR',
  shopCompareMin: 'Min',
  shopCompareMax: 'Max',
  shopCompareStatHitch: 'Hitch',
  shopCompareStatUvw: 'UVW',
  shopCompareStatLength: 'Length',
  shopCompareStatSleeps: 'Sleeps',
  shopCompareStatGvwr: 'GVWR',
  shopCompareRowImage: 'Floorplan Image',
  shopCompareRowLinks: 'Links',
  shopCompareDownloadBrochure: 'Download Brochure',
  shopCompareViewDetails: 'View Details',
  shopCompareRowUvw: 'UVW',
  shopCompareRowHitch: 'Hitch',
  shopCompareRowGvwr: 'GVWR',
  shopCompareRowLength: 'Length',
  shopCompareRowHeight: 'Height',
  shopCompareRowFresh: 'Fresh Water Capacity',
  shopCompareRowWaste: 'Waste Water',
  shopCompareRowGray: 'Gray Water',
  shopCompareRowSleeps: 'Sleep Capacity',
  shopCompareRowSlides: 'Num Slides',
  shopCompareRowBath: 'Bathroom Access',
  shopCompareRowMsrp: 'MSRP',
  shopCompareShopInventory: 'Shop Inventory',
};

let uid = 0;
const nextId = (prefix) => {
  uid += 1;
  return `shop-compare-${prefix}-${uid}`;
};

const toNumber = (value) => {
  const digits = String(value ?? '').replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
};

const fmt = (n) => Number(n).toLocaleString('en-US');

const fmtInches = (inches) => `${Math.floor(inches / 12)}' ${inches % 12}"`;

const isMotorized = (row) => row.Category.toLowerCase().startsWith('motorized');

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, val]) => {
    if (val === undefined || val === null || val === false) return;
    if (key === 'class') node.className = val;
    else if (key === 'html') node.innerHTML = val;
    else if (key === 'text') node.textContent = val;
    else node.setAttribute(key, val === true ? '' : val);
  });
  children.flat().forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    node.append(child);
  });
  return node;
}

function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/* ---------- config ---------- */

function readConfig(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const [keyCell, valueCell] = row.children;
    if (!keyCell || !valueCell) return;
    const key = keyCell.textContent.trim().toLowerCase().replace(/\s+/g, ' ');
    if (key === 'data') {
      const link = valueCell.querySelector('a');
      const href = (link ? link.getAttribute('href') : valueCell.textContent).trim();
      if (href) {
        try {
          config.data = new URL(href, window.location.href).pathname;
        } catch (e) {
          config.data = href;
        }
      }
    } else if (key === 'category order') {
      config.categoryOrder = valueCell.textContent.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (key === 'footnote') {
      config.footnote = valueCell.textContent.trim();
    } else {
      const frag = document.createDocumentFragment();
      frag.append(...[...valueCell.childNodes].map((n) => n.cloneNode(true)));
      if (key === 'dealer stock note') config.dealerNote = frag;
      else config[`tip:${key}`] = frag;
    }
  });
  return config;
}

async function fetchRows(pathname) {
  const candidates = pathname.startsWith('/content/') ? [pathname] : [`/content${pathname}`, pathname];
  // eslint-disable-next-line no-restricted-syntax
  for (const url of candidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const resp = await fetch(url);
      if (resp.ok) {
        // eslint-disable-next-line no-await-in-loop
        const json = await resp.json();
        if (Array.isArray(json.data)) return json.data;
      }
    } catch (e) {
      // try next candidate
    }
  }
  return [];
}

async function loadLabels() {
  const labels = { ...LABELS };
  try {
    const placeholders = await fetchPlaceholders();
    Object.keys(labels).forEach((key) => {
      if (placeholders && placeholders[key]) labels[key] = placeholders[key];
    });
  } catch (e) {
    // defaults only
  }
  return labels;
}

/* ---------- data model ---------- */

function normalize(raw, index) {
  const dealer = String(raw['Dealer Stock'] || '').trim().toLowerCase() === 'yes';
  return {
    ...raw,
    id: String(index),
    dealer,
    msrp: toNumber(raw.MSRP),
    sleeps: toNumber(raw.Sleeps),
    uvw: toNumber(raw.UVW),
    gvwr: toNumber(raw.GVWR),
    lengthIn: toNumber(raw['Length (in)']),
    hitch: toNumber(raw.Hitch),
  };
}

function extent(rows, key, zeroMin = false) {
  const values = rows.map((r) => r[key]).filter((v) => v !== null);
  if (!values.length) return null;
  return [zeroMin ? 0 : Math.min(...values), Math.max(...values)];
}

/* ---------- tooltip ---------- */

function buildTooltip(content, topic) {
  if (!content || !content.childNodes.length) return null;
  const tipId = nextId('tip');
  const wrap = el('span', { class: 'shop-compare-tip' });
  const button = el('button', {
    type: 'button',
    class: 'shop-compare-tip-button',
    'aria-label': `About ${topic}`,
    'aria-expanded': 'false',
    'aria-controls': tipId,
    'aria-describedby': tipId,
  }, el('span', { 'aria-hidden': 'true', text: 'i' }));
  const tip = el('span', { class: 'shop-compare-tip-content', id: tipId, role: 'tooltip' });
  tip.append(content.cloneNode(true));
  tip.hidden = true;
  const setOpen = (open) => {
    tip.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  };
  button.addEventListener('click', (e) => {
    e.preventDefault();
    setOpen(tip.hidden);
  });
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !tip.hidden) {
      e.stopPropagation();
      setOpen(false);
      button.focus();
    }
  });
  wrap.addEventListener('focusout', (e) => {
    if (!wrap.contains(e.relatedTarget)) setOpen(false);
  });
  wrap.append(button, tip);
  return wrap;
}

/* ---------- dual range slider ---------- */

function buildDualRange({
  name, label, min, max, format, onChange, minLabel, maxLabel,
}) {
  const lo = el('input', {
    type: 'range', min, max, step: 1, value: min, 'aria-label': `Minimum ${name}`,
  });
  const hi = el('input', {
    type: 'range', min, max, step: 1, value: max, 'aria-label': `Maximum ${name}`,
  });
  const loOut = el('span', { class: 'shop-compare-range-value', 'aria-hidden': 'true' });
  const hiOut = el('span', { class: 'shop-compare-range-value', 'aria-hidden': 'true' });
  const track = el('div', { class: 'shop-compare-range-track' }, lo, hi);
  const root = el(
    'div',
    { class: 'shop-compare-range', role: 'group', 'aria-label': label || name },
    el('div', { class: 'shop-compare-range-values' }, loOut, hiOut),
    track,
    el(
      'div',
      { class: 'shop-compare-range-captions', 'aria-hidden': 'true' },
      el('span', { text: minLabel }),
      el('span', { text: maxLabel }),
    ),
  );
  const span = Math.max(max - min, 1);
  const paint = () => {
    const a = Number(lo.value);
    const b = Number(hi.value);
    loOut.textContent = format(a);
    hiOut.textContent = format(b);
    lo.setAttribute('aria-valuetext', format(a));
    hi.setAttribute('aria-valuetext', format(b));
    track.style.setProperty('--lo', `${((a - min) / span) * 100}%`);
    track.style.setProperty('--hi', `${((b - min) / span) * 100}%`);
    // keep the lower thumb reachable when both sit at the max
    lo.style.zIndex = a >= max - span * 0.02 ? '3' : '';
  };
  const emit = debounce(() => onChange([Number(lo.value), Number(hi.value)]), DEBOUNCE_MS);
  lo.addEventListener('input', () => {
    if (Number(lo.value) > Number(hi.value)) lo.value = hi.value;
    paint();
    emit();
  });
  hi.addEventListener('input', () => {
    if (Number(hi.value) < Number(lo.value)) hi.value = lo.value;
    paint();
    emit();
  });
  paint();
  return {
    root,
    reset() {
      lo.value = min;
      hi.value = max;
      paint();
    },
  };
}

/* ---------- main ---------- */

export default async function decorate(block) {
  const config = readConfig(block);
  block.textContent = '';
  if (!config.data) return;

  const [labels, rawRows] = await Promise.all([loadLabels(), fetchRows(config.data)]);
  const L = labels;
  const rows = rawRows
    .map(normalize)
    .filter((r) => String(r.Show || '').trim().toLowerCase() === 'yes');
  const titleOf = (r) => `${r.Year} ${r.Brand} ${r.Floorplan}${r.dealer ? L.shopCompareDealerStock : ''}`;

  /* option lists */
  const presentCats = [...new Set(rows.map((r) => r.Category).filter(Boolean))];
  const order = (config.categoryOrder || []).map((c) => c.toLowerCase());
  const categories = [
    ...order
      .map((o) => presentCats.find((c) => c.toLowerCase() === o))
      .filter(Boolean),
    ...presentCats
      .filter((c) => !order.includes(c.toLowerCase()))
      .sort((a, b) => a.localeCompare(b)),
  ];
  const brands = [...new Set(rows.map((r) => r.Brand).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  /* range extents */
  /* like the source, slider bounds span every listed row; the UVW filter then applies
     to towables and the GVWR filter to motorized rows */
  const extents = {
    sleeps: extent(rows, 'sleeps'),
    uvw: extent(rows, 'uvw', true),
    gvwr: extent(rows, 'gvwr'),
    lengthIn: extent(rows, 'lengthIn'),
    hitch: extent(rows, 'hitch', true),
  };

  const state = {
    categories: new Set(),
    brands: new Set(),
    ranges: {},
    sort: 'asc',
    page: 1,
    compare: new Map(),
  };
  const resetRanges = () => {
    Object.entries(extents).forEach(([k, v]) => { if (v) state.ranges[k] = [...v]; });
  };
  resetRanges();

  /* ---------- filtering ---------- */
  const inRange = (value, key) => {
    const range = state.ranges[key];
    if (!range || value === null) return true;
    return value >= range[0] && value <= range[1];
  };
  const getResults = () => {
    const list = rows.filter((r) => {
      if (state.categories.size && !state.categories.has(r.Category)) return false;
      if (state.brands.size && !state.brands.has(r.Brand)) return false;
      if (!inRange(r.sleeps, 'sleeps')) return false;
      if (!inRange(r.lengthIn, 'lengthIn')) return false;
      if (!inRange(r.hitch, 'hitch')) return false;
      if (isMotorized(r)) return inRange(r.gvwr, 'gvwr');
      return inRange(r.uvw, 'uvw');
    });
    const dir = state.sort === 'desc' ? -1 : 1;
    return list
      .map((r, i) => ({ r, i }))
      .sort((a, b) => {
        if (a.r.msrp === null && b.r.msrp === null) return a.i - b.i;
        if (a.r.msrp === null) return 1;
        if (b.r.msrp === null) return -1;
        return (a.r.msrp - b.r.msrp) * dir || a.i - b.i;
      })
      .map(({ r }) => r);
  };

  /* ---------- toolbar ---------- */
  const status = el('p', { class: 'shop-compare-status', role: 'status', 'aria-live': 'polite' });
  const sortId = nextId('sort');
  const sortSelect = el(
    'select',
    { id: sortId },
    el('option', { value: 'asc', text: L.shopComparePriceAsc }),
    el('option', { value: 'desc', text: L.shopComparePriceDesc }),
  );
  const toolbar = el(
    'div',
    { class: 'shop-compare-toolbar' },
    status,
    el(
      'div',
      { class: 'shop-compare-sort' },
      el('label', { for: sortId, text: L.shopCompareSortBy }),
      sortSelect,
    ),
  );

  /* ---------- compare tray ---------- */
  const slots = el('ul', { class: 'shop-compare-slots' });
  const compareButton = el('button', {
    type: 'button', class: 'shop-compare-open', disabled: true, text: L.shopCompareCompare,
  });
  const trayMessage = el('p', { class: 'shop-compare-tray-message', 'aria-live': 'polite' });
  const tray = el(
    'div',
    { class: 'shop-compare-tray' },
    trayMessage,
    slots,
    compareButton,
  );

  /* ---------- filters ---------- */
  const panelId = nextId('filters');
  const filtersToggle = el('button', {
    type: 'button',
    class: 'shop-compare-filters-toggle',
    'aria-expanded': 'false',
    'aria-controls': panelId,
    text: L.shopCompareFilters,
  });
  const resetButton = el('button', {
    type: 'button', class: 'shop-compare-reset', text: L.shopCompareResetFilters,
  });
  const panel = el(
    'div',
    { class: 'shop-compare-filters-panel', id: panelId },
    el(
      'div',
      { class: 'shop-compare-filters-head' },
      el('h2', { class: 'shop-compare-filters-title', text: L.shopCompareFilters }),
      resetButton,
    ),
  );
  const filters = el('aside', { class: 'shop-compare-filters', 'aria-label': L.shopCompareFilters }, filtersToggle, panel);
  const resetters = [];

  /* filter group: heading with a disclosure button (caret + title) and the info tooltip
     beside it; a native <summary> can't host the tooltip button without nesting controls */
  const group = (title, tipKey, ...body) => {
    const bodyId = nextId('group');
    const toggle = el('button', {
      type: 'button',
      class: 'shop-compare-group-toggle',
      'aria-expanded': 'true',
      'aria-controls': bodyId,
    }, el('span', { class: 'shop-compare-group-title', text: title }));
    const content = el('div', { class: 'shop-compare-group-body', id: bodyId }, ...body);
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      content.hidden = !open;
    });
    return el(
      'div',
      { class: 'shop-compare-group' },
      el(
        'div',
        { class: 'shop-compare-group-head' },
        el('h3', { class: 'shop-compare-group-heading' }, toggle),
        buildTooltip(config[`tip:${tipKey}`], title),
      ),
      content,
    );
  };

  let render;
  const applyFilters = () => {
    state.page = 1;
    render();
  };

  const checkboxList = (legend, values, set) => {
    const inputs = [];
    const list = el('ul', { class: 'shop-compare-checks' }, values.map((value) => {
      const id = nextId('chk');
      const input = el('input', { type: 'checkbox', id, value });
      input.addEventListener('change', () => {
        if (input.checked) set.add(value); else set.delete(value);
        applyFilters();
      });
      inputs.push(input);
      return el('li', {}, input, el('label', { for: id, text: value }));
    }));
    resetters.push(() => { inputs.forEach((i) => { i.checked = false; }); });
    return el('fieldset', { class: 'shop-compare-fieldset' }, el('legend', { class: 'shop-compare-sr', text: legend }), list);
  };

  const range = (key, name, format, label) => {
    const ext = extents[key];
    if (!ext) return null;
    const slider = buildDualRange({
      name,
      label,
      min: ext[0],
      max: ext[1],
      format,
      minLabel: L.shopCompareMin,
      maxLabel: L.shopCompareMax,
      onChange: (value) => {
        state.ranges[key] = value;
        applyFilters();
      },
    });
    resetters.push(slider.reset);
    return slider.root;
  };
  const lbs = (n) => `${fmt(n)} lbs`;

  panel.append(group(
    L.shopCompareCategory,
    'category',
    checkboxList(L.shopCompareCategory, categories, state.categories),
  ));
  if (extents.sleeps) {
    panel.append(group(L.shopCompareSleeps, 'sleeps', range('sleeps', 'sleeps', (n) => String(n), L.shopCompareSleeps)));
  }
  if (extents.uvw || extents.gvwr) {
    const parts = [];
    if (extents.uvw) {
      parts.push(
        el('h4', { class: 'shop-compare-subhead', text: L.shopCompareTowable }),
        range('uvw', 'towable UVW', lbs, L.shopCompareTowable),
      );
    }
    if (extents.gvwr) {
      parts.push(
        el('h4', { class: 'shop-compare-subhead', text: L.shopCompareMotorized }),
        range('gvwr', 'motorized GVWR', lbs, L.shopCompareMotorized),
      );
    }
    panel.append(group(L.shopCompareWeight, 'weight', ...parts));
  }
  if (extents.lengthIn) {
    panel.append(group(L.shopCompareLength, 'length', range('lengthIn', 'length', fmtInches, L.shopCompareLength)));
  }
  if (extents.hitch) {
    panel.append(group(L.shopCompareHitchWeight, 'hitch-weight', range('hitch', 'hitch weight', lbs, L.shopCompareHitchWeight)));
  }
  panel.append(group(L.shopCompareBrands, 'brands', checkboxList(L.shopCompareBrands, brands, state.brands)));

  const seeResults = el('button', { type: 'button', class: 'shop-compare-see-results', text: L.shopCompareSeeResults });
  panel.append(seeResults);

  /* ---------- results ---------- */
  const list = el('ul', { class: 'shop-compare-list', tabindex: '-1' });
  const pager = el('nav', { class: 'shop-compare-pager', 'aria-label': 'Pagination' });
  const results = el('div', { class: 'shop-compare-results' }, list, pager);

  /* ---------- dialog ---------- */
  const dialogTitleId = nextId('dialog-title');
  const dialogClose = el('button', {
    type: 'button', class: 'shop-compare-dialog-close', 'aria-label': L.shopCompareClose,
  }, el('span', { 'aria-hidden': 'true', text: '✖' }));
  const dialogBody = el('div', {
    class: 'shop-compare-table-wrap', tabindex: '0', role: 'region', 'aria-labelledby': dialogTitleId,
  });
  const dialog = el(
    'dialog',
    { class: 'shop-compare-dialog', 'aria-labelledby': dialogTitleId },
    el(
      'div',
      { class: 'shop-compare-dialog-head' },
      el('h2', { id: dialogTitleId, text: L.shopCompareDialogTitle }),
      dialogClose,
    ),
    dialogBody,
    config.footnote ? el('p', { class: 'shop-compare-footnote', text: config.footnote }) : null,
  );
  dialogClose.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => compareButton.focus());

  const buildCompareTable = () => {
    const picked = [...state.compare.values()];
    const table = el('table', { class: 'shop-compare-table' });
    const thead = el('thead', {}, el(
      'tr',
      {},
      el('td'),
      picked.map((r) => el('th', { scope: 'col', text: titleOf(r) })),
    ));
    const tbody = el('tbody');
    const addRow = (label, cell) => {
      tbody.append(el(
        'tr',
        {},
        el('th', { scope: 'row', text: label }),
        picked.map((r) => {
          const td = el('td');
          const content = cell(r);
          if (content instanceof Node) td.append(content);
          else td.textContent = content || '';
          return td;
        }),
      ));
    };
    const withLbs = (v) => (toNumber(v) !== null ? `${v} lbs.` : v);
    addRow(L.shopCompareRowImage, (r) => (r.Image ? el('img', {
      src: r.Image, alt: `${titleOf(r)} floor plan`, loading: 'lazy', decoding: 'async', width: 1280, height: 455,
    }) : ''));
    addRow(L.shopCompareRowLinks, (r) => {
      const links = el('div', { class: 'shop-compare-table-links' });
      if (r.Brochure) {
        links.append(el('a', {
          href: r.Brochure, target: '_blank', rel: 'noopener', text: L.shopCompareDownloadBrochure,
        }));
      }
      if (r.Details) links.append(el('a', { href: r.Details, text: L.shopCompareViewDetails }));
      return links;
    });
    addRow(L.shopCompareRowUvw, (r) => withLbs(r.UVW));
    addRow(L.shopCompareRowHitch, (r) => withLbs(r.Hitch));
    addRow(L.shopCompareRowGvwr, (r) => withLbs(r.GVWR));
    addRow(L.shopCompareRowLength, (r) => r.Length);
    addRow(L.shopCompareRowHeight, (r) => r.Height);
    addRow(L.shopCompareRowFresh, (r) => r['Fresh Water']);
    addRow(L.shopCompareRowWaste, (r) => r['Waste Water']);
    addRow(L.shopCompareRowGray, (r) => r['Gray Water']);
    addRow(L.shopCompareRowSleeps, (r) => r.Sleeps);
    addRow(L.shopCompareRowSlides, (r) => r.Slides);
    addRow(`${L.shopCompareRowBath}${config.footnote ? '*' : ''}`, (r) => r['Bathroom Access']);
    addRow(L.shopCompareRowMsrp, (r) => r.MSRP);
    addRow(L.shopCompareShopInventory, (r) => (r.Inventory
      ? el('a', { href: r.Inventory, class: 'shop-compare-btn', text: L.shopCompareShopInventory })
      : ''));
    table.append(thead, tbody);
    return table;
  };

  compareButton.addEventListener('click', () => {
    if (state.compare.size < 2) return;
    dialogBody.replaceChildren(buildCompareTable());
    dialog.showModal();
    dialogClose.focus();
  });

  /* ---------- compare state ---------- */
  const syncCompare = () => {
    const full = state.compare.size >= MAX_COMPARE;
    slots.replaceChildren(...Array.from({ length: MAX_COMPARE }, (_, i) => {
      const r = [...state.compare.values()][i];
      if (!r) return el('li', { class: 'shop-compare-slot' });
      const remove = el('button', {
        type: 'button',
        class: 'shop-compare-slot-remove',
        'aria-label': L.shopCompareRemove.replace('{title}', titleOf(r)),
      }, el('span', { 'aria-hidden': 'true', text: '✖' }));
      remove.addEventListener('click', () => {
        state.compare.delete(r.id);
        // eslint-disable-next-line no-use-before-define
        syncCompare();
        compareButton.focus();
      });
      return el(
        'li',
        { class: 'shop-compare-slot is-filled' },
        el('img', {
          src: r.Image, alt: '', loading: 'lazy', decoding: 'async', width: 50, height: 50,
        }),
        remove,
      );
    }));
    compareButton.disabled = state.compare.size < 2;
    trayMessage.textContent = full ? L.shopCompareMaxReached : '';
    list.querySelectorAll('input[data-compare]').forEach((input) => {
      input.checked = state.compare.has(input.value);
      input.disabled = full && !input.checked;
    });
  };

  /* ---------- cards ---------- */
  const stat = (label, value) => el('div', {}, el('dt', { text: label }), el('dd', { text: value || '' }));

  const buildCard = (r) => {
    const titleId = nextId('title');
    const checkId = nextId('cmp');
    const input = el('input', {
      type: 'checkbox', id: checkId, value: r.id, 'data-compare': true, 'aria-describedby': titleId,
    });
    input.addEventListener('change', () => {
      if (input.checked) {
        if (state.compare.size >= MAX_COMPARE) {
          input.checked = false;
          return;
        }
        state.compare.set(r.id, r);
      } else {
        state.compare.delete(r.id);
      }
      syncCompare();
    });
    const note = r.dealer && config.dealerNote
      ? el('div', { class: 'shop-compare-card-note' }, config.dealerNote.cloneNode(true))
      : null;
    const actions = el('div', { class: 'shop-compare-card-actions' });
    if (r.Details) actions.append(el('a', { href: r.Details, class: 'shop-compare-btn', text: L.shopCompareSeeDetails }));
    if (r.Inventory) actions.append(el('a', { href: r.Inventory, class: 'shop-compare-btn shop-compare-btn-secondary', text: L.shopCompareViewInventory }));
    return el(
      'li',
      { class: 'shop-compare-card' },
      el('h3', { class: 'shop-compare-card-title', id: titleId, text: titleOf(r) }),
      el(
        'div',
        { class: 'shop-compare-card-compare' },
        input,
        el('label', { for: checkId, text: L.shopCompareCompare }),
      ),
      el(
        'div',
        { class: 'shop-compare-card-media' },
        r.Image ? el('img', {
          src: r.Image, alt: `${titleOf(r)} floor plan`, loading: 'lazy', decoding: 'async', width: 1280, height: 455,
        }) : null,
        el(
          'dl',
          { class: 'shop-compare-card-stats' },
          stat(L.shopCompareStatHitch, r.Hitch),
          stat(L.shopCompareStatUvw, r.UVW),
          stat(L.shopCompareStatLength, r.Length),
          stat(L.shopCompareStatSleeps, r.Sleeps),
          stat(L.shopCompareStatGvwr, r.GVWR),
        ),
        note,
      ),
      el(
        'div',
        { class: 'shop-compare-card-price' },
        el('p', { class: 'shop-compare-card-from', text: L.shopCompareStartingAt }),
        el('p', { class: 'shop-compare-card-amount', text: r.MSRP || '' }),
        actions,
      ),
    );
  };

  const goToPage = (page) => {
    state.page = page;
    render();
    results.scrollIntoView({ block: 'start', behavior: 'smooth' });
    list.focus({ preventScroll: true });
  };

  const buildPager = (pages) => {
    pager.replaceChildren();
    if (pages <= 1) return;
    const prev = el('button', {
      type: 'button', class: 'shop-compare-page-step', disabled: state.page <= 1, text: L.shopComparePrevious,
    });
    prev.addEventListener('click', () => goToPage(state.page - 1));
    const next = el('button', {
      type: 'button', class: 'shop-compare-page-step', disabled: state.page >= pages, text: L.shopCompareNext,
    });
    next.addEventListener('click', () => goToPage(state.page + 1));
    const nums = el('ul', { class: 'shop-compare-pages' }, Array.from({ length: pages }, (_, i) => {
      const n = i + 1;
      const btn = el('button', {
        type: 'button',
        class: 'shop-compare-page',
        'aria-label': `Page ${n}`,
        'aria-current': n === state.page ? 'page' : null,
        text: String(n),
      });
      btn.addEventListener('click', () => { if (n !== state.page) goToPage(n); });
      return el('li', {}, btn);
    }));
    pager.append(prev, nums, next);
  };

  const resetAll = () => {
    state.categories.clear();
    state.brands.clear();
    resetRanges();
    resetters.forEach((fn) => fn());
    applyFilters();
  };
  resetButton.addEventListener('click', resetAll);

  render = () => {
    const found = getResults();
    const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
    state.page = Math.min(Math.max(1, state.page), pages);
    if (!found.length) {
      status.textContent = L.shopCompareNoResults;
      const again = el('button', { type: 'button', class: 'shop-compare-btn shop-compare-btn-secondary', text: L.shopCompareResetFilters });
      again.addEventListener('click', resetAll);
      list.replaceChildren(el(
        'li',
        { class: 'shop-compare-empty' },
        el('p', { text: L.shopCompareNoResults }),
        again,
      ));
    } else {
      status.innerHTML = L.shopCompareStatus
        .replace('{page}', state.page)
        .replace('{pages}', pages);
      const start = (state.page - 1) * PAGE_SIZE;
      list.replaceChildren(...found.slice(start, start + PAGE_SIZE).map(buildCard));
    }
    buildPager(found.length ? pages : 0);
    syncCompare();
  };

  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    applyFilters();
  });

  const setFiltersOpen = (open) => {
    filters.classList.toggle('is-open', open);
    filtersToggle.setAttribute('aria-expanded', String(open));
  };
  filtersToggle.addEventListener('click', () => {
    setFiltersOpen(filtersToggle.getAttribute('aria-expanded') !== 'true');
  });
  seeResults.addEventListener('click', () => {
    setFiltersOpen(false);
    results.scrollIntoView({ block: 'start' });
    filtersToggle.focus({ preventScroll: true });
  });

  block.append(
    toolbar,
    tray,
    el('div', { class: 'shop-compare-layout' }, filters, results),
    dialog,
  );
  render();
}
