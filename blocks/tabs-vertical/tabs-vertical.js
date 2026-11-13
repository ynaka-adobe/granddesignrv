/*
 * tabs-vertical
 * Vertical tab list (left) with an image, title and description panel (right).
 * Items without an image show title and description only. Below 900px the source drops the
 * list and shows every panel stacked, so panels are only hidden on desktop.
 *
 * Authoring: one row per item; cell 1 = item label, cell 2 = optional image, heading (H3),
 * description.
 */

let instance = 0;

const desktop = window.matchMedia('(width >= 900px)');

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

/**
 * The source's Product-Tab-Image preset crops to 840 x 440. The global Scene7 renditions add
 * only a width, which keeps the preset's 440px height and returns a far wider crop: add the
 * matching height so each rendition keeps the source framing.
 */
const PRESET_RATIO = 440 / 840;

function keepPresetCrop(media) {
  media.querySelectorAll('source[srcset], img[src]').forEach((el) => {
    const attr = el.tagName === 'IMG' ? 'src' : 'srcset';
    const url = el.getAttribute(attr);
    const wid = url.match(/[?&]wid=(\d+)/);
    if (!/Product-Tab-Image/.test(url) || !wid || /[?&]hei=/.test(url)) return;
    el.setAttribute(attr, `${url}&hei=${Math.round(Number(wid[1]) * PRESET_RATIO)}`);
  });
}

function buildPanel(panel, cell) {
  unwrapCell(cell);
  wrapLooseText(cell);
  const children = [...cell.children];
  const mediaEl = children.find((el) => (el.tagName === 'PICTURE' || el.querySelector('picture'))
    && !el.textContent.trim());
  if (mediaEl) {
    keepPresetCrop(mediaEl);
    const media = document.createElement('div');
    media.className = 'tabs-vertical-media';
    media.append(mediaEl);
    panel.append(media);
  } else {
    panel.classList.add('no-image');
  }
  const body = document.createElement('div');
  body.className = 'tabs-vertical-body';
  body.append(...cell.childNodes);
  if (body.textContent.trim() || body.children.length) panel.append(body);
}

function select(tabs, panels, index, focus) {
  tabs.forEach((tab, i) => {
    const active = i === index;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    panels[i].hidden = desktop.matches && !active;
  });
  if (focus) tabs[index].focus();
}

export default function decorate(block) {
  instance += 1;
  const prefix = `tabs-vertical-${instance}`;
  const rows = [...block.children].filter((row) => row.children.length);
  if (!rows.length) return;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-vertical-list';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-orientation', 'vertical');
  const panelsWrap = document.createElement('div');
  panelsWrap.className = 'tabs-vertical-panels';

  const tabs = [];
  const panels = [];
  rows.forEach((row, i) => {
    const [tabCell, panelCell] = [...row.children];
    const name = tabCell.textContent.replace(/\s+/g, ' ').trim() || `Item ${i + 1}`;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-vertical-tab';
    tab.id = `${prefix}-tab-${i}`;
    tab.textContent = name;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `${prefix}-panel-${i}`);

    const panel = document.createElement('div');
    panel.className = 'tabs-vertical-panel';
    panel.id = `${prefix}-panel-${i}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    if (panelCell) buildPanel(panel, panelCell);
    if (i) panel.querySelectorAll('img').forEach((img) => { img.loading = 'lazy'; });

    tab.addEventListener('click', () => select(tabs, panels, i));
    tabs.push(tab);
    panels.push(panel);
    tablist.append(tab);
    panelsWrap.append(panel);
  });

  block.classList.toggle('no-images', panels.every((p) => p.classList.contains('no-image')));

  tablist.addEventListener('keydown', (e) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    let next = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    select(tabs, panels, next, true);
  });

  select(tabs, panels, 0);
  desktop.addEventListener('change', () => {
    const current = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
    select(tabs, panels, Math.max(current, 0));
  });
  block.replaceChildren(tablist, panelsWrap);
}
