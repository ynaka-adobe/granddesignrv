/*
 * model-subnav
 * Sticky in-page bar for an RV model page: model name, a Floorplans dropdown of
 * floorplan cards, section jump links and a Download Brochure link.
 *
 * Authoring (two columns; rows are recognised by their first cell, with content fallbacks):
 *   row "model": model name | Download Brochure link
 *   row "Floorplans": label | list, one item per floorplan:
 *       thumbnail image, floorplan name link, "Hitch 3,500", "UVW 15,910",
 *       "Length 39' 11\"", optional "Dealer stock only"
 *   row "Links": label | list of in-page links (#brand-360spin, ...)
 */

let instance = 0;

const DEALER_STOCK = /dealer\s+stock\s+only/i;
// "Ext Width: 7' 11"" (authored separator) or, without one, "Hitch 3,500" (single-word label)
const SPEC_LINE_COLON = /^([^:]+?)\s*:\s*(\S.*)$/;
const SPEC_LINE = /^([A-Za-z][A-Za-z .]*?)\s+(\S.*)$/;
const KNOWN_LABELS = /\b(Hitch|UVW|GVWR|Length|Sleeps|Dry Weight|Dealer stock only)\b/gi;

function cellsOf(row) {
  return [...row.children];
}

function isLinksRow(row) {
  const links = [...row.querySelectorAll('a[href]')];
  return links.length > 0 && links.every((a) => (a.getAttribute('href') || '').startsWith('#'));
}

function isFloorplanRow(row) {
  return [...row.querySelectorAll('li')].some((li) => li.querySelector('picture, img'));
}

/** sort authored rows into the three known roles */
function readRows(block) {
  const roles = { model: null, floorplans: null, links: null };
  const rest = [];
  [...block.children].forEach((row) => {
    const label = (row.firstElementChild?.textContent || '').trim().toLowerCase();
    if (!roles.floorplans && (label === 'floorplans' || label === 'floor plans')) roles.floorplans = row;
    else if (!roles.links && (label === 'links' || label === 'sections')) roles.links = row;
    else rest.push(row);
  });
  rest.forEach((row) => {
    if (!roles.floorplans && isFloorplanRow(row)) roles.floorplans = row;
    else if (!roles.links && isLinksRow(row)) roles.links = row;
    else if (!roles.model) roles.model = row;
  });
  return roles;
}

/** split a list item's text (minus image and name) into lines */
function textLines(li) {
  const clone = li.cloneNode(true);
  clone.querySelectorAll('picture, img, a').forEach((el) => el.remove());
  clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  clone.querySelectorAll('p, div, li, span').forEach((el) => el.append('\n'));
  let lines = clone.textContent.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  // everything on one line: split before each known spec label
  if (lines.length === 1) {
    lines = lines[0].replace(KNOWN_LABELS, '\n$1').split('\n').map((l) => l.trim()).filter(Boolean);
  }
  return lines;
}

function buildCard(li) {
  const picture = li.querySelector('picture');
  const links = [...li.querySelectorAll('a[href]')];
  const nameLink = links.find((a) => a.textContent.trim()) || links[0];
  const href = nameLink ? nameLink.getAttribute('href') : '';
  const name = nameLink ? nameLink.textContent.trim() : '';

  const card = document.createElement(href ? 'a' : 'div');
  card.className = 'model-subnav-card';
  if (href) card.href = href;

  let thumb = null;
  if (picture) {
    thumb = document.createElement('span');
    thumb.className = 'model-subnav-card-thumb';
    const img = picture.querySelector('img');
    if (img) {
      img.loading = 'lazy';
      // the floorplan name labels the card; the drawing is decorative
      if (name) img.alt = '';
    }
    thumb.append(picture);
    card.append(thumb);
  }

  const body = document.createElement('span');
  body.className = 'model-subnav-card-body';
  const title = document.createElement('span');
  title.className = 'model-subnav-card-name';
  title.textContent = name;
  body.append(title);

  const specs = document.createElement('dl');
  specs.className = 'model-subnav-card-specs';
  let dealerStock = false;
  textLines(li).forEach((line) => {
    if (DEALER_STOCK.test(line)) {
      dealerStock = true;
      return;
    }
    const match = line.match(SPEC_LINE_COLON) || line.match(SPEC_LINE);
    if (!match) return;
    const [, term, value] = match;
    const item = document.createElement('div');
    const dt = document.createElement('dt');
    dt.textContent = term;
    const dd = document.createElement('dd');
    dd.textContent = value;
    item.append(dt, dd);
    specs.append(item);
  });
  if (specs.children.length) body.append(specs);

  if (dealerStock) {
    card.classList.add('is-dealer-stock');
    const flag = document.createElement('span');
    flag.className = 'model-subnav-card-flag';
    flag.textContent = 'Dealer stock only';
    // the flag sits over the (greyed) floorplan drawing
    (thumb || body).append(flag);
  }
  card.append(body);
  return card;
}

function buildDropdown(row, id) {
  const [labelCell, listCell] = cellsOf(row);
  const source = listCell || labelCell;
  const items = [...source.querySelectorAll('li')];
  if (!items.length) return null;

  const wrapper = document.createElement('div');
  wrapper.className = 'model-subnav-floorplans';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'model-subnav-toggle';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', `${id}-floorplans`);
  const text = document.createElement('span');
  text.textContent = (listCell && labelCell.textContent.trim()) || 'Floorplans';
  const icon = document.createElement('span');
  icon.className = 'model-subnav-toggle-icon';
  icon.setAttribute('aria-hidden', 'true');
  button.append(text, icon);

  const panel = document.createElement('div');
  panel.className = 'model-subnav-panel';
  panel.id = `${id}-floorplans`;
  panel.hidden = true;
  const grid = document.createElement('ul');
  grid.className = 'model-subnav-grid';
  items.forEach((li) => {
    const item = document.createElement('li');
    item.append(buildCard(li));
    grid.append(item);
  });
  panel.append(grid);

  wrapper.append(button, panel);
  return { wrapper, button, panel };
}

function buildLinks(row) {
  const [labelCell, listCell] = cellsOf(row);
  const links = [...(listCell || labelCell).querySelectorAll('a[href]')];
  if (!links.length) return null;
  const list = document.createElement('ul');
  list.className = 'model-subnav-links';
  links.forEach((a) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    li.append(link);
    list.append(li);
  });
  return list;
}

function buildModelRow(row) {
  const brand = document.createElement('p');
  brand.className = 'model-subnav-brand';
  const actions = document.createElement('div');
  actions.className = 'model-subnav-actions';
  if (!row) return { brand, actions };

  const links = [...row.querySelectorAll('a[href]')];
  const nameCell = cellsOf(row).find((cell) => cell.textContent.trim() && !cell.querySelector('a[href]'));
  brand.textContent = nameCell ? nameCell.textContent.trim() : '';
  links.forEach((a) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    link.className = 'model-subnav-action';
    if (/\.pdf(\?|#|$)/i.test(link.href)) {
      link.target = '_blank';
      link.rel = 'noopener';
    }
    actions.append(link);
  });
  return { brand, actions };
}

/** keep in-page targets clear of the fixed header and this bar */
function trackOffset(bar, links) {
  const root = document.documentElement;
  const update = () => root.style.setProperty('--model-subnav-height', `${bar.offsetHeight}px`);
  update();
  if (window.ResizeObserver) new ResizeObserver(update).observe(bar);

  const offsetTarget = (hash) => {
    if (!hash || hash.length < 2) return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) target.style.scrollMarginTop = 'calc(var(--nav-height, 0px) + var(--model-subnav-height, 0px))';
  };
  if (links) links.querySelectorAll('a').forEach((a) => offsetTarget(a.hash));
  offsetTarget(window.location.hash);
  return offsetTarget;
}

export default function decorate(block) {
  instance += 1;
  const id = `model-subnav-${instance}`;
  const roles = readRows(block);

  const { brand, actions } = buildModelRow(roles.model);
  const dropdown = roles.floorplans ? buildDropdown(roles.floorplans, id) : null;
  const links = roles.links ? buildLinks(roles.links) : null;

  const nav = document.createElement('nav');
  nav.className = 'model-subnav-bar';
  nav.setAttribute('aria-label', brand.textContent ? `${brand.textContent} model` : 'Model');
  if (brand.textContent) nav.append(brand);
  if (dropdown) nav.append(dropdown.wrapper);
  if (links) nav.append(links);

  // actions sit inline on desktop; on small screens they fold behind a toggle (as on the source)
  let actionsMenu = null;
  if (actions.children.length) {
    const menu = document.createElement('div');
    menu.className = 'model-subnav-more';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'model-subnav-more-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', `${id}-actions`);
    toggle.setAttribute('aria-label', 'More actions');
    const icon = document.createElement('span');
    icon.className = 'model-subnav-more-icon';
    icon.setAttribute('aria-hidden', 'true');
    toggle.append(icon);
    actions.id = `${id}-actions`;
    menu.append(toggle, actions);
    nav.append(menu);
    actionsMenu = { wrapper: menu, button: toggle, openClass: 'is-actions-open' };
  }

  block.replaceChildren(nav);

  // measure the block (bar + its bottom border); the panels are absolutely positioned
  const offsetTarget = trackOffset(block, links);

  // each menu: { wrapper, button, panel?, openClass }
  const menus = [];
  if (dropdown) menus.push({ ...dropdown, openClass: 'is-open' });
  if (actionsMenu) menus.push(actionsMenu);

  const isOpen = (menu) => menu.button.getAttribute('aria-expanded') === 'true';
  const setOpen = (menu, open) => {
    menu.button.setAttribute('aria-expanded', String(open));
    if (menu.panel) menu.panel.hidden = !open;
    block.classList.toggle(menu.openClass, open);
  };

  menus.forEach((menu) => {
    menu.button.addEventListener('click', () => {
      const open = !isOpen(menu);
      menus.forEach((other) => { if (other !== menu) setOpen(other, false); });
      setOpen(menu, open);
    });

    menu.wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen(menu)) {
        e.preventDefault();
        setOpen(menu, false);
        menu.button.focus();
      }
    });

    menu.wrapper.addEventListener('focusout', (e) => {
      if (e.relatedTarget && !menu.wrapper.contains(e.relatedTarget)) setOpen(menu, false);
    });
  });

  if (menus.length) {
    document.addEventListener('click', (e) => {
      menus.forEach((menu) => { if (!menu.wrapper.contains(e.target)) setOpen(menu, false); });
    });
  }

  if (links) {
    links.addEventListener('click', (e) => {
      offsetTarget(e.target.closest('a')?.hash);
      menus.forEach((menu) => setOpen(menu, false));
    });
  }
}
