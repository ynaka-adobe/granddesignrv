/* eslint-disable */
/* global WebImporter */

/**
 * hero-model parser.
 * Source: first child of the model page's main grid. Layouts differ per model (gradient
 * container with nested grids on Momentum, gdrv-teaser-hero on Imagine, ...), so every part
 * is found by role, never by position:
 *   background  .dynamic-media-container__image picture (largest <source>), else an inline
 *               background-image
 *   logo        foreground image whose alt/src says logo/reversed, else the one in a
 *               .dynamicmedia viewer, else the first foreground image
 *   badge       first other foreground image (award seal)
 *   price       text paragraph with a "$" amount ("Models Starting at $56,034")
 *   CTAs        .button a.cmp-button (FIND LOCAL INVENTORY, SHOP & COMPARE)
 * Mobile-only copies (.aem-GridColumn--default--hide) are ignored.
 *
 * Optional promo band (Momentum, Solitude, Influence, Reflection FW): a nested
 * .container.full-width holding an H1 + LEARN MORE button. It is a separate dark section:
 * the sections transformer put <hr data-excat-section-id> before it. It is not part of the
 * block; the element is replaced with [block, hr, <h1>, <p><a>] so the band stays after it.
 *
 * Output (Hero convention, 1 column): row 1 background image; row 2 logo image (the model's
 * title), badge image, price <p>, one CTA <p><a> each.
 */

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

/* hidden on desktop = mobile-only duplicate (only checked inside the block element) */
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

function makeImg(document, src, alt) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || '';
  return img;
}

/* best rendition of a <picture>: the widest min-width source, else the <img> */
function pictureSrc(picture) {
  let best = '';
  let bestWidth = -1;
  picture.querySelectorAll('source').forEach((source) => {
    const srcset = (source.getAttribute('srcset') || '').split(',')[0].trim().split(/\s+/)[0];
    if (!srcset) return;
    const m = (source.getAttribute('media') || '').match(/min-width:\s*(\d+)/);
    const width = m ? parseInt(m[1], 10) : 0;
    if (width > bestWidth) { best = srcset; bestWidth = width; }
  });
  const img = picture.querySelector('img');
  return best || (img ? imgSrc(img) : '');
}

function findBackground(element, promo) {
  const pictures = [...element.querySelectorAll('.dynamic-media-container__image picture')]
    .filter((p) => !(promo && promo.contains(p)) && !isHidden(p, element));
  if (pictures.length) {
    const picture = pictures[pictures.length - 1];
    const src = pictureSrc(picture);
    if (src) return { src, node: picture };
  }
  const styled = [element, ...element.querySelectorAll('[style*="background-image"]')]
    .find((el) => /url\(/i.test(el.getAttribute('style') || '') && !(promo && promo.contains(el)));
  if (styled) {
    const m = styled.getAttribute('style').match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    if (m) return { src: m[1], node: null };
  }
  return null;
}

function modelName(document) {
  return clean((document.title || '').split('|').pop());
}

export default function parse(element, { document }) {
  // both template selectors can resolve to the same grid child: parse it once
  if (element.tagName === 'TABLE' || !element.isConnected) return;

  // promo band (optional): nested full-width container with an H1
  // (an H1 directly in the hero, e.g. Imagine AIM's tagline, is hero content, not a promo)
  const promoHeading = [...element.querySelectorAll('h1')].find((h) => {
    const band = h.closest('.container.full-width');
    return clean(h.textContent) && !isHidden(h, element) && band && band !== element && element.contains(band);
  });
  const promo = promoHeading ? promoHeading.closest('.container.full-width') : null;
  const marker = element.querySelector('hr[data-excat-section-id]');
  const inPromo = (el) => !!(promo && promo.contains(el));

  const background = findBackground(element, promo);
  const bgPicture = background && background.node;

  // foreground images: everything visible except the background and the promo band
  const foreground = [...element.querySelectorAll('img')].filter((img) => !isHidden(img, element)
    && !inPromo(img)
    && !(bgPicture && bgPicture.contains(img))
    && !img.closest('.dynamic-media-container__image')
    && imgSrc(img));

  // alt or asset name (not the query: badges use the $Transparency-Logo$ preset too)
  const isLogo = (img) => /logo|reversed/i.test(`${img.getAttribute('alt') || ''} ${imgSrc(img).split('?')[0]}`);
  const logo = foreground.find(isLogo)
    || foreground.find((img) => img.closest('.dynamicmedia, .s7dm-dynamic-media'))
    || foreground[0];
  const badges = foreground.filter((img) => img !== logo);

  const content = [];
  const name = modelName(document);
  if (logo) {
    const p = document.createElement('p');
    p.append(makeImg(document, imgSrc(logo), name ? `${name} logo` : clean(logo.getAttribute('alt'))));
    content.push(p);
  }
  if (badges.length) {
    // the block shows one award badge (the second image)
    const badge = badges[0];
    const p = document.createElement('p');
    p.append(makeImg(document, imgSrc(badge), clean(badge.getAttribute('alt'))));
    content.push(p);
  }

  // optional tagline heading inside the hero itself (Imagine AIM: "ADVENTURE IN MOTION")
  element.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    if (isHidden(h, element) || inPromo(h) || !clean(h.textContent)) return;
    const heading = document.createElement(h.tagName.toLowerCase());
    heading.textContent = clean(h.textContent);
    content.push(heading);
  });

  const price = [...element.querySelectorAll('p')]
    .find((p) => !isHidden(p, element) && !inPromo(p) && /\$\s?\d/.test(p.textContent));
  if (price) {
    const p = document.createElement('p');
    p.textContent = clean(price.textContent);
    content.push(p);
  }

  const seen = new Set();
  element.querySelectorAll('.button a[href], a.cmp-button[href]').forEach((link) => {
    if (isHidden(link, element) || inPromo(link)) return;
    const label = clean(link.textContent);
    const href = relativize(link.getAttribute('href'));
    if (!label || !href || seen.has(`${href}|${label}`)) return;
    seen.add(`${href}|${label}`);
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    p.append(a);
    content.push(p);
  });

  const cells = [];
  if (background) cells.push([makeImg(document, background.src, '')]);
  cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-model', cells });

  // keep the promo band (and its section break) after the block as default content
  const after = [];
  if (promo) {
    if (marker) after.push(marker);
    const h1 = document.createElement('h1');
    h1.textContent = clean(promoHeading.textContent);
    after.push(h1);
    const done = new Set();
    promo.querySelectorAll('.button a[href], a.cmp-button[href]').forEach((link) => {
      const label = clean(link.textContent);
      if (!label || done.has(link) || isHidden(link, element)) return;
      done.add(link);
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = relativize(link.getAttribute('href'));
      a.textContent = label;
      p.append(a);
      after.push(p);
    });
  }
  element.replaceWith(block, ...after);
}
