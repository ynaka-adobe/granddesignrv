/*
 * tabs-feature
 * Feature tabs whose panels hold free-form content. Each panel's layout is chosen
 * from its content, never from its position:
 *   - image(s) only                         -> "banner"  (full-width image)
 *   - a standalone image FIRST              -> "split"   (image beside the text)
 *   - a standalone image LAST               -> "overlay" (image as background, text over it);
 *     when the text does not open with a heading it is a centred "statement" on a light photo
 *   - text only                             -> "text"
 * Other standalone images stay in the text (logos, badges, diagrams). A paragraph or list
 * holding two or more images becomes an icon row; in a split panel the icon row and
 * everything after it run full width below the image and text. With a single tab the
 * tab bar is not rendered.
 *
 * Authoring: one row per tab; cell 1 = tab label, cell 2 = panel content.
 */

let instance = 0;

/**
 * aem.js wraps a cell that starts with a picture in one <p> (picture, headings and
 * paragraphs together): undo that so each piece is a direct child again
 */
function unwrapCell(cell) {
  const only = cell.children.length === 1 ? cell.firstElementChild : null;
  if (!only || only.tagName !== 'P') return;
  const blockKids = only.querySelector(':scope > :is(p, h1, h2, h3, h4, h5, h6, ul, ol, div, table)');
  const pictureFirst = only.firstElementChild?.tagName === 'PICTURE'
    && [...only.children].some((el) => el.tagName !== 'PICTURE');
  if (blockKids || pictureFirst) only.replaceWith(...only.childNodes);
}

function wrapLooseText(cell) {
  [...cell.childNodes].forEach((node) => {
    const inline = node.nodeType === Node.TEXT_NODE
      || (node.nodeType === Node.ELEMENT_NODE && ['A', 'STRONG', 'EM', 'SPAN', 'B', 'I'].includes(node.tagName));
    if (!inline || !node.textContent.trim()) return;
    const p = document.createElement('p');
    node.replaceWith(p);
    p.append(node);
  });
}

function pictureCount(el) {
  if (el.tagName === 'PICTURE') return 1;
  return el.querySelectorAll('picture').length;
}

/** a top-level element that only carries one image */
function isMedia(el) {
  return pictureCount(el) === 1 && !el.textContent.trim() && !el.querySelector('li');
}

const isBlank = (node) => node.nodeType === Node.TEXT_NODE && !node.textContent.trim();

/** icon items: the image, then the label and description in one text box (no stray <br>s) */
function decorateIcons(row) {
  const items = row.matches('ul, ol') ? [...row.children] : [row];
  items.forEach((item) => {
    const icon = [...item.children].find((el) => pictureCount(el));
    if (!icon) return;
    const text = document.createElement('span');
    text.className = 'tabs-feature-icon-text';
    text.append(...[...item.childNodes].filter((node) => node !== icon));
    while (text.firstChild && (isBlank(text.firstChild) || text.firstChild.nodeName === 'BR')) {
      text.firstChild.remove();
    }
    text.querySelectorAll(':scope > strong').forEach((strong) => {
      let next = strong.nextSibling;
      while (next && isBlank(next)) next = next.nextSibling;
      if (next?.nodeName === 'BR') next.remove();
    });
    item.replaceChildren(icon);
    if (text.textContent.trim()) item.append(text);
  });
}

/**
 * The source requests these Scene7 assets at their authored size (presets such as
 * $Transparent-500$ or hei=). The global renderer adds wid=, which makes Scene7 pad the
 * image to that width with transparent bands, so photos and logos shrink inside wide boxes.
 */
function useAuthoredSize(panel) {
  panel.querySelectorAll('picture source[srcset*="/is/image/"], picture img[src*="/is/image/"]').forEach((el) => {
    const attr = el.tagName === 'IMG' ? 'src' : 'srcset';
    el.setAttribute(attr, el.getAttribute(attr).replace(/([?&])wid=\d+(&|$)/, '$1').replace(/[?&]$/, ''));
  });
}

function wrap(className, elements) {
  const div = document.createElement('div');
  div.className = className;
  div.append(...elements);
  return div;
}

function layoutPanel(panel) {
  useAuthoredSize(panel);
  unwrapCell(panel);
  wrapLooseText(panel);
  const children = [...panel.children];
  children.forEach((el) => {
    if (pictureCount(el) < 2) return;
    el.classList.add('tabs-feature-icons');
    decorateIcons(el);
  });

  const media = children.map(isMedia);
  let layout = 'text';
  let mediaEl = null;
  if (media.every(Boolean)) layout = 'banner';
  else if (media[0]) [layout, mediaEl] = ['split', children[0]];
  else if (media[media.length - 1]) [layout, mediaEl] = ['overlay', children[children.length - 1]];

  panel.classList.add(`tabs-feature-${layout}`);
  panel.replaceChildren();
  if (layout === 'banner') {
    panel.append(wrap('tabs-feature-media', children));
    return;
  }

  const body = children.filter((el) => el !== mediaEl);
  if (layout === 'overlay' && !/^H[1-6]$/.test(body[0].tagName)) {
    panel.classList.add('tabs-feature-statement');
  }
  let after = [];
  if (layout === 'split') {
    const firstIcons = body.findIndex((el) => el.classList.contains('tabs-feature-icons'));
    if (firstIcons > 0) after = body.splice(firstIcons);
  }

  if (mediaEl) panel.append(wrap('tabs-feature-media', [mediaEl]));
  panel.append(wrap('tabs-feature-body', body));
  if (after.length) panel.append(wrap('tabs-feature-after', after));
}

function select(tabs, panels, index, focus) {
  tabs.forEach((tab, i) => {
    const active = i === index;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    panels[i].hidden = !active;
  });
  if (focus) tabs[index].focus();
}

export default function decorate(block) {
  instance += 1;
  const prefix = `tabs-feature-${instance}`;
  const rows = [...block.children].filter((row) => row.children.length);
  if (!rows.length) return;
  const single = rows.length === 1;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-feature-list';
  tablist.setAttribute('role', 'tablist');
  const panelsWrap = document.createElement('div');
  panelsWrap.className = 'tabs-feature-panels';

  const tabs = [];
  const panels = [];
  rows.forEach((row, i) => {
    const [tabCell, panelCell] = [...row.children];
    const name = tabCell.textContent.replace(/\s+/g, ' ').trim() || `Tab ${i + 1}`;

    const panel = document.createElement('div');
    panel.className = 'tabs-feature-panel';
    panel.id = `${prefix}-panel-${i}`;
    panel.append(...(panelCell || tabCell).childNodes);
    layoutPanel(panel);
    panels.push(panel);
    panelsWrap.append(panel);
    if (i) panel.querySelectorAll('img').forEach((img) => { img.loading = 'lazy'; });

    if (single) return;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-feature-tab';
    tab.id = `${prefix}-tab-${i}`;
    tab.textContent = name;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    tab.addEventListener('click', () => select(tabs, panels, i));
    tabs.push(tab);
    tablist.append(tab);
  });

  if (single) {
    block.classList.add('is-single');
    block.replaceChildren(panelsWrap);
    return;
  }

  tablist.addEventListener('keydown', (e) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    let next = null;
    if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    select(tabs, panels, next, true);
  });

  select(tabs, panels, 0);
  block.replaceChildren(tablist, panelsWrap);
}
