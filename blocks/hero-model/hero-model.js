/*
 * hero-model
 * Model-page hero: full-bleed background photo with a top-down black gradient,
 * the model logo (image, in place of a heading), an optional award badge image,
 * an optional "Starting at $..." price line and up to two CTA links (left / right).
 *
 * Authoring (one column):
 *   row 1: background image
 *   row 2: model logo image, optional award badge image, optional price paragraph, CTA links
 * A single-row block works too: its pictures are read in order (background, logo, badge).
 */

function textOnly(el) {
  return el.textContent.trim() && !el.querySelector('a[href], picture, img');
}

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

/** wrap loose text in cells (single-paragraph cells arrive without a <p>) */
function wrapLooseText(cell) {
  [...cell.childNodes].forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;
    const p = document.createElement('p');
    node.replaceWith(p);
    p.append(node);
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => [...row.children].forEach((cell) => {
    unwrapCell(cell);
    wrapLooseText(cell);
  }));
  const pictures = [...block.querySelectorAll('picture')];

  let background = null;
  if (rows.length > 1) {
    background = rows[0].querySelector('picture');
  } else if (pictures.length > 1) {
    [background] = pictures;
  }
  const foreground = pictures.filter((p) => p !== background);
  const [logo, badge] = foreground;

  const ctas = [...block.querySelectorAll('a[href]')].filter((a) => !a.querySelector('picture, img'));
  const textEls = [...block.querySelectorAll('p, h1, h2, h3, h4, h5, h6')]
    .filter((el) => textOnly(el) && !el.closest('a'));

  // build the new structure
  const media = document.createElement('div');
  media.className = 'hero-model-media';
  if (background) {
    const img = background.querySelector('img');
    if (img) {
      // top-of-page photo: let it compete for LCP
      img.loading = 'eager';
      img.setAttribute('fetchpriority', 'high');
      if (!img.alt) img.alt = '';
    }
    media.append(background);
  }

  const content = document.createElement('div');
  content.className = 'hero-model-content';

  if (logo) {
    const logoWrap = document.createElement('div');
    logoWrap.className = 'hero-model-logo';
    const img = logo.querySelector('img');
    if (img) img.loading = 'eager';
    logoWrap.append(logo);
    content.append(logoWrap);
  }

  if (badge) {
    const badgeWrap = document.createElement('div');
    badgeWrap.className = 'hero-model-badge';
    // above the fold next to the logo: don't wait for the lazy loader
    const img = badge.querySelector('img');
    if (img) img.loading = 'eager';
    badgeWrap.append(badge);
    content.append(badgeWrap);
  }

  if (textEls.length) {
    const text = document.createElement('div');
    text.className = 'hero-model-text';
    const price = textEls.find((el) => el.tagName === 'P');
    if (price) price.classList.add('hero-model-price');
    text.append(...textEls);
    content.append(text);
  }

  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'hero-model-actions';
    ctas.forEach((a, i) => {
      const holder = document.createElement('p');
      holder.className = `button-container hero-model-action hero-model-action-${i + 1}`;
      a.classList.add('button');
      holder.append(a);
      actions.append(holder);
    });
    content.append(actions);
  }

  block.classList.toggle('has-badge', !!badge);
  block.classList.toggle('has-price', textEls.length > 0);
  block.classList.toggle('has-image', !!background);

  // the authored rows are left empty: replace them with the new layers
  block.replaceChildren(...[media, content].filter((el) => el.children.length));
}
