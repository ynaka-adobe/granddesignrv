/*
 * Header: brand logo, click-to-open megamenu panels, search overlay and CTA.
 * All copy, links and images come from the nav fragment (nav.plain.html):
 *   section 1: logo link
 *   section 2: list of top-level items; each item's nested list is its panel.
 *     Panel entries are recognised by structure:
 *       - group:  text label + nested list of cards
 *       - card:   a link wrapping an image (icon) + a text link (label) [+ list of models]
 *       - model:  a text link + image + <em> caption (shown in the featured area on hover)
 *       - info:   <strong> title + <p> description + list of links (buttons)
 *   section 3: tools — an image link with a nested list (search: one entry per tab,
 *     link = form action, <em> = placeholder) and plain links (CTA).
 */

const isDesktop = window.matchMedia('(width >= 1200px)');

async function fetchNav() {
  // metadata-independent: /content first (local preview), then root (DA/EDS)
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  // resolve fragment-relative image paths against the fragment URL
  tmp.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  tmp.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = new URL(source.getAttribute('srcset'), resp.url).href;
  });
  // the published fragment wraps list-item labels/links in <p>: unwrap them so both the
  // authored and the published markup share one structure (info boxes keep their paragraphs)
  tmp.querySelectorAll('li').forEach((li) => {
    if (li.querySelector(':scope > strong, :scope > p > strong')) return;
    [...li.children].filter((c) => c.tagName === 'P').forEach((p) => p.replaceWith(...p.childNodes));
  });
  // content after a nested list can be folded into that list's last item on publish:
  // hand a stray icon link back to the item that owns the list
  tmp.querySelectorAll('li').forEach((li) => {
    const nested = [...li.children].find((c) => c.tagName === 'UL');
    if (!nested || [...li.children].some((c) => c.tagName === 'A' && c.querySelector('img'))) return;
    // only a model item (leaf with its own bare thumbnail and a text link) can hold a stray
    const last = nested.lastElementChild;
    if (!last || last.querySelector(':scope > ul')) return;
    if (!last.querySelector(':scope > picture, :scope > img')) return;
    const links = [...last.children].filter((c) => c.tagName === 'A');
    const stray = links.find((a) => a.querySelector('img'));
    if (stray && links.some((a) => !a.querySelector('img'))) li.append(stray);
  });
  return tmp;
}

const directChildren = (el, selector) => [...el.children].filter((c) => c.matches(selector));
const ownText = (el) => [...el.childNodes]
  .filter((n) => n.nodeType === Node.TEXT_NODE)
  .map((n) => n.textContent.trim())
  .join(' ')
  .trim();
const imageLink = (li) => directChildren(li, 'a').find((a) => a.querySelector('img'));
const textLink = (li) => directChildren(li, 'a').find((a) => !a.querySelector('img'));

/* ---------- panel builders ---------- */

function buildModels(list, featured) {
  const ul = document.createElement('ul');
  ul.className = 'nav-models';
  directChildren(list, 'li').forEach((li) => {
    const link = textLink(li);
    if (!link) return;
    const item = document.createElement('li');
    item.className = 'nav-model';
    item.append(link);
    const img = li.querySelector('img');
    const caption = li.querySelector('em');
    // mobile rows show the thumbnail and price inline (hidden on desktop)
    if (img) {
      const thumb = document.createElement('span');
      thumb.className = 'nav-model-thumb';
      thumb.setAttribute('aria-hidden', 'true');
      thumb.append(img.cloneNode());
      item.prepend(thumb);
    }
    if (caption) {
      const price = document.createElement('span');
      price.className = 'nav-model-price';
      price.textContent = caption.textContent;
      item.append(price);
    }
    if (img && featured) {
      const show = () => {
        featured.replaceChildren(img.cloneNode());
        if (caption) {
          const price = document.createElement('span');
          price.textContent = caption.textContent;
          featured.append(price);
        }
        featured.classList.add('is-visible');
      };
      const hide = () => featured.classList.remove('is-visible');
      link.addEventListener('mouseenter', show);
      link.addEventListener('focus', show);
      link.addEventListener('mouseleave', hide);
      link.addEventListener('blur', hide);
    }
    ul.append(item);
  });
  return ul;
}

function buildCard(li, featured) {
  const card = document.createElement('div');
  card.className = 'nav-card';
  const icon = imageLink(li);
  const label = textLink(li);
  if (icon) {
    // fixed 90x70 icon box; wider icons overflow it symmetrically (as on the source)
    const iconBox = document.createElement('div');
    iconBox.className = 'nav-card-icon';
    icon.className = 'nav-card-icon-link';
    icon.setAttribute('aria-hidden', 'true');
    icon.tabIndex = -1;
    iconBox.append(icon);
    card.append(iconBox);
  }
  if (label) {
    label.className = 'nav-card-label';
    card.append(label);
  }
  const models = directChildren(li, 'ul')[0];
  if (models) {
    card.classList.add('has-models');
    card.append(buildModels(models, featured));
    // mobile drill-down: the card opens its model list instead of navigating
    [icon, label].filter(Boolean).forEach((a) => a.addEventListener('click', (e) => {
      if (isDesktop.matches) return;
      e.preventDefault();
      card.classList.add('is-open');
      card.closest('.nav-panel').classList.add('has-open-card');
      card.closest('nav').dispatchEvent(new CustomEvent('nav-level-change'));
    }));
  }
  return card;
}

function buildInfo(li) {
  const box = document.createElement('div');
  box.className = 'nav-info';
  const title = li.querySelector('strong');
  const desc = [...li.querySelectorAll(':scope > p')].find((p) => !p.querySelector('strong'));
  if (title) {
    const t = document.createElement('p');
    t.className = 'nav-info-title';
    t.textContent = title.textContent;
    box.append(t);
  }
  if (desc) {
    desc.className = 'nav-info-description';
    box.append(desc);
  }
  li.querySelectorAll('ul a').forEach((a) => {
    a.className = 'nav-info-button';
    box.append(a);
  });
  return box;
}

function buildPanel(list, panelId) {
  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  panel.id = panelId;
  panel.hidden = true;
  const inner = document.createElement('div');
  inner.className = 'nav-panel-inner';
  const featured = document.createElement('div');
  featured.className = 'nav-featured';
  featured.setAttribute('aria-hidden', 'true');
  let usesFeatured = false;
  let looseCards;

  directChildren(list, 'li').forEach((li) => {
    if (li.querySelector(':scope > strong, :scope > p > strong')) {
      panel.append(buildInfo(li));
      panel.classList.add('has-info');
      return;
    }
    if (imageLink(li)) {
      if (!looseCards) {
        looseCards = document.createElement('div');
        looseCards.className = 'nav-cards';
        inner.append(looseCards);
      }
      looseCards.append(buildCard(li, featured));
      return;
    }
    const cards = directChildren(li, 'ul')[0];
    if (!cards) return;
    const group = document.createElement('section');
    group.className = 'nav-group';
    const title = document.createElement('h2');
    title.className = 'nav-group-title';
    title.textContent = ownText(li);
    const grid = document.createElement('div');
    grid.className = 'nav-cards';
    directChildren(cards, 'li').forEach((cardLi) => {
      const card = buildCard(cardLi, featured);
      if (card.classList.contains('has-models')) usesFeatured = true;
      grid.append(card);
    });
    group.append(title, grid);
    inner.append(group);
    panel.classList.add('has-groups');
  });

  panel.prepend(inner);
  if (usesFeatured) panel.prepend(featured);
  return panel;
}

/* ---------- open / close ---------- */

function closeCards(nav) {
  nav.querySelectorAll('.nav-card.is-open').forEach((c) => c.classList.remove('is-open'));
  nav.querySelectorAll('.nav-panel.has-open-card').forEach((p) => p.classList.remove('has-open-card'));
}

function closePanels(nav, except) {
  nav.querySelectorAll('.nav-trigger[aria-expanded="true"]').forEach((btn) => {
    if (btn === except) return;
    btn.setAttribute('aria-expanded', 'false');
    document.getElementById(btn.getAttribute('aria-controls')).hidden = true;
  });
  closeCards(nav);
}

function closeSearch(nav) {
  const toggle = nav.querySelector('.nav-search-toggle');
  if (!toggle || toggle.getAttribute('aria-expanded') !== 'true') return;
  toggle.setAttribute('aria-expanded', 'false');
  nav.querySelector('.nav-search').hidden = true;
  document.body.classList.remove('nav-search-open');
}

function closeMobileMenu(nav) {
  nav.setAttribute('aria-expanded', 'false');
  const btn = nav.querySelector('.nav-hamburger button');
  if (btn) btn.setAttribute('aria-label', 'Open navigation');
  closePanels(nav);
  document.body.classList.remove('nav-menu-open');
}

function decorateSections(section, nav) {
  const list = section.querySelector('ul');
  if (!list) return;
  list.className = 'nav-list';
  directChildren(list, 'li').forEach((li, idx) => {
    const panelList = directChildren(li, 'ul')[0];
    const label = ownText(li) || li.textContent.trim();
    if (!panelList) return;
    const id = `nav-panel-${idx}`;
    // a link-styled toggle (as on the source), exposed to assistive tech as a button
    const btn = document.createElement('a');
    btn.href = `#${id}`;
    btn.className = 'nav-trigger';
    btn.setAttribute('role', 'button');
    btn.textContent = label;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id);
    const panel = buildPanel(panelList, id);
    li.replaceChildren(btn, panel);
    li.classList.add('nav-drop');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = !panel.hidden;
      closePanels(nav, btn);
      closeSearch(nav);
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.hidden = open;
      nav.dispatchEvent(new CustomEvent('nav-level-change'));
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key !== ' ') return;
      e.preventDefault();
      btn.click();
    });
  });
}

function buildSearch(li, nav) {
  const toggleLink = imageLink(li);
  const tabsList = directChildren(li, 'ul')[0];
  const tabs = tabsList ? directChildren(tabsList, 'li').map((tab) => ({
    label: textLink(tab)?.textContent.trim() || '',
    action: textLink(tab)?.getAttribute('href') || '/search',
    placeholder: tab.querySelector('em')?.textContent.trim() || '',
  })) : [];

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-search-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'nav-search');
  toggle.setAttribute('aria-label', toggleLink?.querySelector('img')?.alt || 'Search');
  const icon = toggleLink?.querySelector('img');
  if (icon) {
    icon.alt = '';
    toggle.append(icon);
  }

  const overlay = document.createElement('div');
  overlay.className = 'nav-search';
  overlay.id = 'nav-search';
  overlay.hidden = true;
  const bar = document.createElement('div');
  bar.className = 'nav-search-bar';
  const form = document.createElement('form');
  form.className = 'nav-search-form';
  form.method = 'get';
  form.setAttribute('role', 'search');
  const searchIcon = icon ? icon.cloneNode() : null;
  if (searchIcon) searchIcon.className = 'nav-search-icon';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.className = 'nav-search-input';
  input.autocomplete = 'off';
  const tabBar = document.createElement('div');
  tabBar.className = 'nav-search-tabs';
  tabBar.setAttribute('role', 'tablist');
  const selectTab = (i) => {
    form.action = tabs[i].action;
    input.placeholder = tabs[i].placeholder;
    input.setAttribute('aria-label', tabs[i].placeholder || tabs[i].label);
    tabBar.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-selected', i === j ? 'true' : 'false'));
  };
  tabs.forEach((tab, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.textContent = tab.label;
    b.addEventListener('click', () => { selectTab(i); input.focus(); });
    tabBar.append(b);
  });
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-search-close';
  close.setAttribute('aria-label', 'Close search');
  close.addEventListener('click', () => closeSearch(nav));
  if (searchIcon) form.append(searchIcon);
  form.append(input);
  bar.append(form, tabBar, close);
  overlay.append(bar);
  if (tabs.length) selectTab(0);

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = toggle.getAttribute('aria-expanded') === 'true';
    if (open) {
      closeSearch(nav);
      return;
    }
    closePanels(nav);
    toggle.setAttribute('aria-expanded', 'true');
    overlay.hidden = false;
    document.body.classList.add('nav-search-open');
    input.focus();
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSearch(nav);
  });

  const item = document.createElement('li');
  item.className = 'nav-search-item';
  item.append(toggle, overlay);
  return item;
}

function decorateTools(section, nav) {
  const list = section.querySelector('ul');
  if (!list) return;
  list.className = 'nav-list nav-tools-list';
  directChildren(list, 'li').forEach((li) => {
    if (imageLink(li) && directChildren(li, 'ul').length) {
      li.replaceWith(buildSearch(li, nav));
      return;
    }
    const link = textLink(li);
    if (link) {
      li.classList.add('nav-cta-item');
      link.className = 'nav-cta nav-trigger';
    }
  });
}

export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  const sections = directChildren(fragment, 'div');
  ['brand', 'sections', 'tools'].forEach((name, i) => {
    if (sections[i]) {
      sections[i].className = `nav-${name}`;
      nav.append(sections[i]);
    }
  });

  const brandLink = nav.querySelector('.nav-brand a');
  if (brandLink) brandLink.setAttribute('aria-label', brandLink.querySelector('img')?.alt || 'Home');

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) decorateSections(navSections, nav);
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) decorateTools(navTools, nav);

  // right-hand group: menu triggers + search + CTA (one row, as on the source)
  const navMenu = document.createElement('div');
  navMenu.className = 'nav-menu';
  navMenu.append(...[navSections, navTools].filter(Boolean));
  nav.append(navMenu);

  // the mobile menu list ends with a Find a Dealer row (same link as the CTA, as on the source)
  const cta = navTools?.querySelector('a.nav-cta');
  const sectionsList = navSections?.querySelector('.nav-list');
  if (cta && sectionsList) {
    const ctaRow = document.createElement('li');
    ctaRow.className = 'nav-mobile-cta';
    const ctaLink = cta.cloneNode(true);
    ctaLink.className = 'nav-mobile-cta-link';
    ctaRow.append(ctaLink);
    sectionsList.append(ctaRow);
  }

  // hamburger (below the desktop breakpoint): opens the menu, then acts as "Back"
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
      <span class="nav-hamburger-label">Menu</span>
      <span class="nav-back-label">Back</span>
    </button>`;
  const hamburgerBtn = hamburger.querySelector('button');
  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (nav.getAttribute('aria-expanded') !== 'true') {
      closeSearch(nav);
      nav.setAttribute('aria-expanded', 'true');
      hamburgerBtn.setAttribute('aria-label', 'Navigate back');
      document.body.classList.add('nav-menu-open');
      nav.dispatchEvent(new CustomEvent('nav-level-change'));
      return;
    }
    // back: model list -> category list -> top level (no-op at the top level)
    if (nav.querySelector('.nav-card.is-open')) closeCards(nav);
    else if (nav.querySelector('.nav-trigger[aria-expanded="true"]')) closePanels(nav);
    else return;
    nav.dispatchEvent(new CustomEvent('nav-level-change'));
  });
  nav.append(hamburger);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-close';
  close.setAttribute('aria-label', 'Close navigation');
  close.innerHTML = '<span class="nav-close-icon"></span><span class="nav-close-label">Menu</span>';
  close.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMobileMenu(nav);
  });
  nav.append(close);
  nav.setAttribute('aria-expanded', 'false');

  // each level change fades the menu in (0.3s, as on the source)
  nav.addEventListener('nav-level-change', () => {
    if (isDesktop.matches || !navSections) return;
    navSections.classList.remove('nav-fade');
    // eslint-disable-next-line no-void
    void navSections.offsetWidth;
    navSections.classList.add('nav-fade');
    navSections.scrollTop = 0;
  });

  // close on outside click / Escape; reset when crossing the desktop breakpoint
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closePanels(nav);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = nav.querySelector('.nav-trigger[aria-expanded="true"]');
    closePanels(nav);
    closeSearch(nav);
    if (open) open.focus();
  });
  isDesktop.addEventListener('change', () => {
    closePanels(nav);
    closeSearch(nav);
    closeMobileMenu(nav);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
