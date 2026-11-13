/*
 * tabs-swatch
 * Colour picker: round swatch thumbnails (tabs) swap the exterior image (panel);
 * the selected swatch's ring and name turn red.
 *
 * Authoring: one row per colour; cell 1 = swatch image + colour name, cell 2 = exterior image
 * (any other panel content is kept).
 */

let instance = 0;

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
  const prefix = `tabs-swatch-${instance}`;
  const rows = [...block.children].filter((row) => row.children.length);
  if (!rows.length) return;

  const stage = document.createElement('div');
  stage.className = 'tabs-swatch-panels';
  const tablist = document.createElement('div');
  tablist.className = 'tabs-swatch-list';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Colours');

  const tabs = [];
  const panels = [];
  rows.forEach((row, i) => {
    const [tabCell, panelCell] = [...row.children];
    const name = tabCell.textContent.replace(/\s+/g, ' ').trim()
      || panelCell?.querySelector('img')?.alt || `Colour ${i + 1}`;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-swatch-tab';
    tab.id = `${prefix}-tab-${i}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `${prefix}-panel-${i}`);

    const swatch = document.createElement('span');
    swatch.className = 'tabs-swatch-chip';
    swatch.setAttribute('aria-hidden', 'true');
    const picture = tabCell.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      if (img) img.alt = '';
      swatch.append(picture);
    }
    const text = document.createElement('span');
    text.className = 'tabs-swatch-name';
    text.textContent = name;
    tab.append(swatch, text);

    const panel = document.createElement('div');
    panel.className = 'tabs-swatch-panel';
    panel.id = `${prefix}-panel-${i}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    if (panelCell) panel.append(...panelCell.childNodes);
    panel.querySelectorAll('img').forEach((img) => {
      if (i) img.loading = 'lazy';
      if (!img.alt) img.alt = name;
    });

    tab.addEventListener('click', () => select(tabs, panels, i));
    tabs.push(tab);
    panels.push(panel);
    tablist.append(tab);
    stage.append(panel);
  });

  tablist.addEventListener('keydown', (e) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    select(tabs, panels, next, true);
  });

  select(tabs, panels, 0);
  block.replaceChildren(stage, tablist);
}
