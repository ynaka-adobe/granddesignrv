/* eslint-disable */
/* global WebImporter */

/**
 * cards-category parser.
 * Source: Partners page logo grid (.cmp-imageGrid, React "ImageGrid"). The rendered
 * .image-grid-container only holds the <img> tiles (empty h1/p overlays, no links); the tile
 * links and images come from the component's data-prop-multiImages JSON:
 *   [{ link, newTab, imageFirst, imageSecond }, ...]
 * imageFirst is the tile shown on the page; imageSecond (hover swap) is not authored.
 * Output (Cards convention, 2 columns): one row per tile: [image] [link to the partner page].
 * The tiles carry no visible text, so the link is authored as a bare URL; a tile without a link
 * keeps an empty text cell. Falls back to the rendered <img> tiles when the JSON is missing.
 */

const ORIGIN = 'https://www.granddesignrv.com';
const ORIGIN_RE = /^https?:\/\/(?:www\.)?granddesignrv\.com/i;

function relativize(href) {
  if (!href) return '';
  const h = href.trim();
  if (!ORIGIN_RE.test(h)) return h;
  const path = h.replace(ORIGIN_RE, '')
    .replace(/^\/content\/granddesignrv\/us\/en/, '')
    .replace(/\.html(?=$|[?#])/, '');
  return path || '/';
}

/* DAM paths in the JSON are raw (spaces, narrow no-break spaces): encode them once */
function absolute(src) {
  if (!src) return '';
  const encoded = /%[0-9a-f]{2}/i.test(src) ? src : encodeURI(src);
  if (/^(https?:)?\/\//i.test(encoded)) return encoded;
  return `${ORIGIN}${encoded.startsWith('/') ? '' : '/'}${encoded}`;
}

function readTiles(element) {
  const holder = element.matches('[data-prop-multiimages]')
    ? element
    : element.querySelector('[data-prop-multiimages]');
  if (holder) {
    try {
      const items = JSON.parse(holder.getAttribute('data-prop-multiimages'));
      if (Array.isArray(items) && items.length) {
        return items
          .filter((item) => item && item.imageFirst)
          .map((item) => ({ src: absolute(item.imageFirst), link: item.link || '' }));
      }
    } catch (e) {
      // fall through to the rendered tiles
    }
  }
  return [...element.querySelectorAll('.image-grid-container .image img, img')]
    .map((img) => ({ src: img.getAttribute('src') || '', link: '' }))
    .filter((t) => t.src);
}

export default function parse(element, { document }) {
  const cells = [];
  readTiles(element).forEach((tile) => {
    const img = document.createElement('img');
    img.src = tile.src;
    img.alt = '';
    let text = '';
    if (tile.link) {
      const a = document.createElement('a');
      a.href = relativize(tile.link);
      a.textContent = a.getAttribute('href');
      text = a;
    }
    cells.push([img, text]);
  });

  if (!cells.length) {
    element.remove();
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });
  element.replaceWith(block);
}
