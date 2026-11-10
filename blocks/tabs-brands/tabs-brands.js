import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

/*
 * tabs-brands: tab bar whose panels hold a centered, looping model slider.
 * Authoring: one row per tab; cell 1 = tab label, cell 2 = panel content.
 * Panel content: optional lead content (e.g. "All <type>" link), then per model:
 * image, model name, floorplans/MSRP line, CTA link. Each picture starts a new model.
 * The slider shows the selected model image enlarged in the middle slot with its
 * neighbours shrunk on either side; the selected model's details render below.
 */

function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  // model images sit below the fold, most in hidden tabs: load them only when shown
  root.querySelectorAll('img').forEach((img) => { img.loading = 'lazy'; });
}

/* split the panel's flat content into lead content + one group per picture */
function groupContent(panelContent) {
  const lead = document.createElement('div');
  lead.className = 'tabs-brands-lead';
  const groups = [];
  let current = null;

  // wrap bare text/inline nodes so nothing is lost when content is regrouped
  [...panelContent.childNodes].forEach((node) => {
    const isBlockEl = node.nodeType === Node.ELEMENT_NODE && !['A', 'STRONG', 'EM', 'SPAN'].includes(node.tagName);
    if (isBlockEl || !node.textContent.trim()) return;
    const p = document.createElement('p');
    node.replaceWith(p);
    p.append(node);
  });

  [...panelContent.children].forEach((child) => {
    if (child.querySelector('picture') || child.tagName === 'PICTURE') {
      current = [];
      groups.push(current);
    }
    if (current) current.push(child);
    else lead.append(child);
  });

  return { lead, groups };
}

function buildSlider(panelContent, id) {
  const { lead, groups } = groupContent(panelContent);
  panelContent.textContent = '';
  if (lead.children.length) panelContent.append(lead);
  if (!groups.length) return null;

  const viewport = document.createElement('div');
  viewport.className = 'tabs-brands-viewport';
  const track = document.createElement('ul');
  track.className = 'tabs-brands-track';
  track.id = `tabs-brands-track-${id}`;
  const info = document.createElement('div');
  info.className = 'tabs-brands-info';
  info.setAttribute('aria-live', 'polite');

  const items = [];
  const bodies = [];
  groups.forEach((group) => {
    const li = document.createElement('li');
    li.className = 'tabs-brands-item';
    const body = document.createElement('div');
    body.className = 'tabs-brands-item-body';
    group.forEach((el) => {
      if (el.tagName === 'PICTURE' || el.querySelector('picture')) {
        el.classList.add('tabs-brands-item-image');
        li.append(el);
      } else {
        body.append(el);
      }
    });
    items.push(li);
    bodies.push(body);
  });
  track.append(...items);
  viewport.append(track);
  info.append(...bodies);

  const slider = document.createElement('div');
  slider.className = 'tabs-brands-slider';
  const makeArrow = (cls, label) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = cls;
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-controls', track.id);
    return btn;
  };
  const prev = makeArrow('tabs-brands-prev', 'Previous model');
  const next = makeArrow('tabs-brands-next', 'Next model');
  slider.append(prev, viewport, next);
  if (items.length < 2) slider.classList.add('tabs-brands-slider-static');

  const count = items.length;
  let selected = 0;
  const select = (index) => {
    selected = ((index % count) + count) % count;
    // reorder visually so the previous model sits left and the next sits right
    const slot = count > 1 ? 1 : 0;
    items.forEach((item, k) => {
      const isSelected = k === selected;
      item.style.order = (((k - selected + slot) % count) + count) % count;
      item.classList.toggle('selected', isSelected);
      item.setAttribute('aria-current', isSelected);
      bodies[k].hidden = !isSelected;
    });
    track.style.setProperty('--tabs-brands-slot', slot);
  };
  prev.addEventListener('click', () => select(selected - 1));
  next.addEventListener('click', () => select(selected + 1));
  items.forEach((item, k) => item.addEventListener('click', () => select(k)));

  // basic swipe support for touch devices
  let startX = null;
  viewport.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  viewport.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) select(selected + (dx < 0 ? 1 : -1));
  });

  select(0);
  panelContent.append(slider, info);
  return slider;
}

export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-brands-list';
  tablist.setAttribute('role', 'tablist');

  const rows = [...block.children];
  const used = {};
  const buttons = [];
  rows.forEach((row, i) => {
    const [tab, content] = [...row.children];
    if (!tab) return;
    let id = toClassName(tab.textContent) || `tab-${i}`;
    used[id] = (used[id] || 0) + 1;
    if (used[id] > 1) id = `${id}-${used[id]}`;

    const tabpanel = row;
    tabpanel.className = 'tabs-brands-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    const button = document.createElement('button');
    button.className = 'tabs-brands-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', tabpanel.id);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.tabIndex = i ? -1 : 0;
    button.addEventListener('click', () => {
      block.querySelectorAll(':scope > [role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      buttons.forEach((btn) => {
        btn.setAttribute('aria-selected', false);
        btn.tabIndex = -1;
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
      button.tabIndex = 0;
    });
    buttons.push(button);
    tablist.append(button);
    tab.remove();

    if (content) {
      content.className = 'tabs-brands-panel-content';
      buildSlider(content, id);
    }
  });

  // arrow-key navigation between tabs
  tablist.addEventListener('keydown', (e) => {
    const idx = buttons.indexOf(document.activeElement);
    if (idx < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    let target = idx;
    if (e.key === 'ArrowLeft') target = (idx - 1 + buttons.length) % buttons.length;
    if (e.key === 'ArrowRight') target = (idx + 1) % buttons.length;
    if (e.key === 'Home') target = 0;
    if (e.key === 'End') target = buttons.length - 1;
    buttons[target].focus();
    buttons[target].click();
  });

  optimizeImages(block);
  block.prepend(tablist);
}
