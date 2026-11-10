import { createOptimizedPicture } from '../../scripts/aem.js';

const HEADINGS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

function optimize(img, width) {
  const url = new URL(img.src, window.location.href);
  if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
  const pic = createOptimizedPicture(img.src, img.alt, false, [{ width }]);
  img.closest('picture').replaceWith(pic);
}

function isPictureOnly(el) {
  return (el.tagName === 'PICTURE' || !!el.querySelector('picture')) && !el.textContent.trim();
}

// aem.js wrapTextNodes() wraps a cell whose first child is a <picture> (the logo)
// into a single <p>, nesting every paragraph, heading and CTA inside it: unwrap it
function unwrapCell(cell) {
  const only = cell.children.length === 1 ? cell.firstElementChild : null;
  if (only && only.tagName === 'P' && only.querySelector(':scope > :is(p, h1, h2, h3, h4, h5, h6)')) {
    only.replaceWith(...only.childNodes);
  }
}

function buildStat(p) {
  const stat = document.createElement('div');
  stat.className = 'cards-model-list-stat';
  const strong = p.querySelector('strong');
  let valueText = '';
  if (strong) {
    valueText = strong.textContent.trim();
    strong.remove();
  }
  const labelText = p.textContent.trim();
  if (labelText) {
    const label = document.createElement('span');
    label.className = 'cards-model-list-stat-label';
    label.textContent = labelText;
    stat.append(label);
  }
  if (valueText) {
    const value = document.createElement('span');
    value.className = 'cards-model-list-stat-value';
    value.textContent = valueText;
    stat.append(value);
  }
  return stat;
}

function decorateCard(li) {
  const cells = [...li.children];
  const imageCell = cells.find((c) => isPictureOnly(c));
  const bodyCell = cells.find((c) => c !== imageCell);

  const media = document.createElement('div');
  media.className = 'cards-model-list-media';
  const stats = document.createElement('div');
  stats.className = 'cards-model-list-stats';
  const body = document.createElement('div');
  body.className = 'cards-model-list-body';
  const ctas = document.createElement('div');
  ctas.className = 'cards-model-list-ctas';

  if (bodyCell) {
    unwrapCell(bodyCell);
    const children = [...bodyCell.children];
    const headingIndex = children.findIndex((el) => HEADINGS.includes(el.tagName));
    let logo = null;
    children.forEach((el, i) => {
      if (el.classList.contains('button-container')) {
        ctas.append(el);
      } else if (!logo && isPictureOnly(el)) {
        logo = document.createElement('div');
        logo.className = 'cards-model-list-logo';
        logo.append(...(el.tagName === 'PICTURE' ? [el] : el.childNodes));
        const img = logo.querySelector('img');
        if (img) optimize(img, '500');
        media.append(logo);
      } else if (headingIndex > -1 && i < headingIndex && el.tagName === 'P') {
        stats.append(buildStat(el));
      } else {
        body.append(el);
      }
    });
  }

  if (imageCell) {
    imageCell.className = 'cards-model-list-image';
    const img = imageCell.querySelector('img');
    if (img) optimize(img, '750');
    media.append(imageCell);
  }

  const parts = [media, stats, body, ctas].filter((el) => el.children.length);
  li.replaceChildren(...parts);
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    decorateCard(li);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
