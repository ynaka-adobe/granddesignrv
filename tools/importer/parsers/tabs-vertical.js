/* eslint-disable */
/* global WebImporter */

/**
 * tabs-vertical parser.
 * Source: "Constructed to a Superior Standard" construction tabs (AEM Core tabs, #brand-construction):
 *   li.cmp-tabs__tab                       item label ("Thermal Roof Design (R-40)*")
 *   .cmp-tabs__tabpanel (aria-controls)    .dynamicmedia image (data-asset-path) or plain img,
 *                                          .cmp-image__title, .cmp-image__description;
 *                                          panels without an image may hold .cmp-text instead
 * Tabs and panels are paired by aria-controls (document order as fallback).
 * Output (Tabs convention, 2 columns, one row per item):
 *   [item label | optional <p><img></p>, <h3>title</h3>, <p>description</p>]
 */

const IMAGE_SERVER = 'https://gdrv.scene7.com/is/image/';
const ORIGIN_RE = /^https?:\/\/(?:www\.)?granddesignrv\.com/i;

function clean(text) {
  return (text || '').replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
}

function relativize(href) {
  if (!href) return '';
  const h = href.trim();
  if (!ORIGIN_RE.test(h) || /^https?:\/\/[^/]+\/content\/dam\//i.test(h)) return h;
  const path = h.replace(ORIGIN_RE, '')
    .replace(/^\/content\/granddesignrv\/us\/en/, '')
    .replace(/\.html(?=$|[?#])/, '');
  return path || '/';
}

function isHidden(el, root) {
  for (let n = el; n && n !== root; n = n.parentElement) {
    if (n.classList && n.classList.contains('aem-GridColumn--default--hide')) return true;
  }
  return false;
}

function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  if (src && !/^(data|blob):/i.test(src)) return src;
  const wrapper = img.closest('[data-cmp-src]');
  if (wrapper) {
    const widths = (wrapper.getAttribute('data-cmp-widths') || '').split(',').map(Number).filter(Boolean);
    const width = widths.length ? Math.max(...widths) : 1600;
    return wrapper.getAttribute('data-cmp-src').replace(/%7B\.width%7D|\{\.width\}/gi, String(width));
  }
  return img.getAttribute('data-src') || '';
}

function own(tabs, selector) {
  return [...tabs.querySelectorAll(selector)].filter((el) => el.closest('.cmp-tabs') === tabs);
}

/* copy a node tree keeping only inline formatting and links */
function inline(source, target, document) {
  source.childNodes.forEach((node) => {
    if (node.nodeType === 3) { target.append(document.createTextNode(node.textContent.replace(/ /g, ' '))); return; }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    const map = { b: 'strong', strong: 'strong', i: 'em', em: 'em', a: 'a', br: 'br', sup: 'sup', sub: 'sub' };
    if (!map[tag]) { inline(node, target, document); return; }
    const el = document.createElement(map[tag]);
    if (tag === 'a' && node.getAttribute('href')) el.setAttribute('href', relativize(node.getAttribute('href')));
    inline(node, el, document);
    target.append(el);
  });
  return target;
}

function panelImage(panel, root, document, label) {
  const viewer = [...panel.querySelectorAll('[data-asset-path]')]
    .find((el) => !isHidden(el, root) && /^(image|spinset)?$/i.test(el.getAttribute('data-asset-type') || ''));
  const img = [...panel.querySelectorAll('img')].find((i) => !isHidden(i, root) && imgSrc(i));
  let src = img ? imgSrc(img) : '';
  if (!src && viewer) {
    const server = (viewer.getAttribute('data-imageserver') || IMAGE_SERVER).replace(/\/?$/, '/');
    src = `${server}${encodeURI(viewer.getAttribute('data-asset-path').replace(/^\/+/, ''))}`;
  }
  if (!src) return null;
  const out = document.createElement('img');
  out.src = src;
  out.alt = clean(img && img.getAttribute('alt')) || clean(viewer && viewer.getAttribute('data-alt')) || label;
  return out;
}

/* image-less panels: headings become the H3 title, paragraphs / list items the description */
function richText(panel, root, document) {
  const out = [];
  panel.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li').forEach((el) => {
    if (isHidden(el, root) || !clean(el.textContent)) return;
    if (el.parentElement.closest('h1, h2, h3, h4, h5, h6, p, li')) return;
    const heading = /^H\d$/.test(el.tagName);
    out.push(inline(el, document.createElement(heading ? 'h3' : 'p'), document));
  });
  return out;
}

export default function parse(element, { document }) {
  const tabs = own(element, '.cmp-tabs__tab');
  const panels = own(element, '.cmp-tabs__tabpanel');
  const cells = [];

  tabs.forEach((tab, i) => {
    const label = clean(tab.textContent);
    const id = tab.getAttribute('aria-controls');
    const panel = (id && panels.find((p) => p.id === id)) || panels[i];
    const content = [];

    if (panel) {
      const img = panelImage(panel, element, document, label);
      if (img) {
        const p = document.createElement('p');
        p.append(img);
        content.push(p);
      }

      const titleEl = [...panel.querySelectorAll('.cmp-image__title')].find((el) => !isHidden(el, element));
      const descEl = [...panel.querySelectorAll('.cmp-image__description')].find((el) => !isHidden(el, element));
      if (titleEl || descEl) {
        if (titleEl && clean(titleEl.textContent)) {
          const h3 = document.createElement('h3');
          h3.textContent = clean(titleEl.textContent);
          content.push(h3);
        }
        if (descEl && clean(descEl.textContent)) content.push(inline(descEl, document.createElement('p'), document));
      } else {
        const text = richText(panel, element, document);
        if (text.length && text[0].tagName !== 'H3' && label) {
          const h3 = document.createElement('h3');
          h3.textContent = label;
          text.unshift(h3);
        }
        content.push(...text);
      }
    }

    if (!label && !content.length) return;
    cells.push([label, content.length ? content : '']);
  });

  // the Lineage pages ship an empty tabs component (no items): nothing to author
  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-vertical', cells });
  element.replaceWith(block);
}
