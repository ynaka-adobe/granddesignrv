/* eslint-disable */
/* global WebImporter */

/**
 * accordion-boxed parser.
 * Source: AEM accordion (.accordion.panelcontainer > .cmp-accordion.gdrv-accordion):
 *   > .cmp-accordion__item               one item
 *     .cmp-accordion__title              item title
 *     .cmp-accordion__panel .cmp-text    panel rich text (paragraphs, lists, links)
 * Output (2 columns): one row per item, [title | panel content].
 */

const ORIGIN_RE = /^https?:\/\/(?:www\.)?granddesignrv\.com/i;

function clean(text) {
  return (text || '').replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
}

/* site page links become relative; DAM assets (PDFs, images) stay absolute */
function relativize(href) {
  if (!href) return '';
  const h = href.trim();
  if (!ORIGIN_RE.test(h)) return h;
  if (/^https?:\/\/[^/]+\/content\/dam\//i.test(h)) return h;
  const path = h.replace(ORIGIN_RE, '')
    .replace(/^\/content\/granddesignrv\/us\/en/, '')
    .replace(/\.html(?=$|[?#])/, '');
  return path || '/';
}

function panelContent(panel) {
  const content = [];
  if (!panel) return content;
  const texts = [...panel.querySelectorAll('.cmp-text')];
  const sources = texts.length ? texts : [panel];
  sources.forEach((src) => {
    [...src.children].forEach((child) => {
      // drop spacer paragraphs (&nbsp;) that carry no text or media
      if (!clean(child.textContent) && !child.querySelector('img, picture, iframe, video')) return;
      const node = child.cloneNode(true);
      node.querySelectorAll('a[href]').forEach((a) => {
        a.setAttribute('href', relativize(a.getAttribute('href')));
      });
      content.push(node);
    });
  });
  return content;
}

export default function parse(element, { document }) {
  const cells = [];
  const root = element.classList.contains('cmp-accordion')
    ? element
    : (element.querySelector('.cmp-accordion') || element);

  root.querySelectorAll(':scope > .cmp-accordion__item').forEach((item) => {
    const titleEl = item.querySelector('.cmp-accordion__title') || item.querySelector('.cmp-accordion__header');
    const title = clean(titleEl && titleEl.textContent);
    if (!title) return;
    const content = panelContent(item.querySelector('.cmp-accordion__panel'));
    cells.push([title, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-boxed', cells });
  element.replaceWith(block);
}
