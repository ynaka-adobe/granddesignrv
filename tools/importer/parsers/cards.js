/* eslint-disable */
/* global WebImporter */

/**
 * cards parser (boilerplate cards block), photo gallery branch.
 * Source: gallery component (.gallerycontainer > .gallery-container): a Swiper of
 * a.teaser.glightbox tiles (pages of 8), each with a Scene7 thumbnail
 * (.teaser-content__thumbnail img, "$Gallery-Thumbnail$" preset, raw spaces in the asset name)
 * and an empty title/description; the lightbox target is the full-size DAM file.
 * The category filter ("All"), the pager and the hidden teasers (.hidden-teasers) are not authored.
 * Output (Cards convention, 2 columns): one row per photo: [image] [text]. The text cell holds the
 * tile title as a heading; the gallery tiles carry no visible caption, so it is left empty.
 */

function clean(text) {
  return (text || '').replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
}

function encodeSrc(src) {
  if (!src) return '';
  return /%[0-9a-f]{2}/i.test(src) ? src : encodeURI(src);
}

/* site page links become relative; DAM assets (PDFs, images) stay absolute */
const ORIGIN = 'https://www.granddesignrv.com';

function relativize(href) {
  if (!href) return href;
  const m = href.match(/^https?:\/\/(?:www\.)?granddesignrv\.com(\/[^#]*)?(#.*)?$/i);
  if (!m) return href;
  return `${(m[1] || '/').replace(/\.html$/, '')}${m[2] || ''}`;
}

function absolute(href) {
  if (!href || /^[a-z]+:/i.test(href)) return href;
  return `${ORIGIN}${href.startsWith('/') ? '' : '/'}${href}`;
}

function linkFor(href) {
  return /\/content\/dam\//i.test(href) ? absolute(href) : relativize(href);
}

function heading(document, tag, text, href) {
  const h = document.createElement(tag);
  if (href) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    h.append(a);
  } else {
    h.textContent = text;
  }
  return h;
}

function cardImage(document, srcImg, alt) {
  const src = srcImg ? encodeSrc(srcImg.getAttribute('src') || srcImg.getAttribute('data-src')) : '';
  if (!src || /^(data|blob):/i.test(src)) return '';
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  return img;
}

/*
 * Blog post list (Adventure More, React "BlogPosts" app): the cards carry no link in the DOM (the
 * app navigates on click), so the post URLs come from the list API the app itself reads
 * (/bin/api/blogpostlist?type=list&blogpath=…, same origin as the page). Only available when the
 * import runs on the live page; elsewhere the titles stay unlinked.
 */
function blogPosts(app, url) {
  const path = app && app.getAttribute('data-prop-blog-path');
  if (!path || typeof XMLHttpRequest === 'undefined') return [];
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', new URL(`/bin/api/blogpostlist?type=list&blogpath=${encodeURIComponent(path)}`, url).href, false);
    xhr.send();
    if (xhr.status !== 200) return [];
    return JSON.parse(xhr.responseText).pages || [];
  } catch (e) {
    return [];
  }
}

/*
 * Listing grids (.filter-items__items__list of .card): Adventure More blog posts (image + title,
 * no link in the DOM) and News page filters (.card.page: linked thumbnail + linked title). Only the
 * cards the app has rendered at load time (its first page) are authored; filters and pager are
 * handled by the cleanup transformer.
 * Output: one row per card: [image] [h3 title (linked to the post), byline when present].
 */
function parseListing(element, document, url) {
  const app = element.closest('[data-prop-blog-path]');
  const norm = (s) => clean(s).toLowerCase();
  let posts = null;
  const cells = [];
  [...element.children].filter((c) => c.matches('.card')).forEach((card) => {
    const titleEl = card.querySelector('.card__title, .page__title');
    const title = clean(titleEl && titleEl.textContent);
    if (!title) return;
    const srcImg = card.querySelector('img');
    let href = (card.querySelector('.page__title a[href], .page__image a[href]') || { getAttribute: () => '' }).getAttribute('href');
    if (!href && app) {
      if (posts === null) posts = blogPosts(app, url);
      const src = srcImg ? srcImg.getAttribute('src') : '';
      const post = posts.find((p) => norm(p.title) === norm(title)) || posts.find((p) => src && p.image === src);
      href = post ? post.link : '';
    }
    const text = [heading(document, 'h3', title, href ? linkFor(href) : '')];
    // grid cards show title (and byline) only: their teaser (.card__body) is hidden on the source
    card.querySelectorAll('.card__byline').forEach((el) => {
      if (!clean(el.textContent)) return;
      const p = document.createElement('p');
      p.textContent = clean(el.textContent);
      text.push(p);
    });
    cells.push([cardImage(document, srcImg, title), text]);
  });
  if (!cells.length) {
    element.remove();
    return;
  }
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards', cells }));
}

/*
 * Brochure downloads (Core Components download): the matched element is the first .container of a
 * run of sibling containers, each holding a cover image (.dynamicmedia) and a .cmp-download (title
 * linked to the PDF, "Size" property, "Download" link). The rest of the run is folded in.
 * Output: one row per brochure: [cover] [h3 title link, "Size 6 MB", "Download" link]; the PDFs
 * are DAM assets and stay absolute.
 */
function parseDownloads(element, document) {
  const run = [element];
  for (let n = element.nextElementSibling; n && n.matches('.container.responsivegrid') && n.querySelector('.cmp-download'); n = n.nextElementSibling) {
    run.push(n);
  }
  const cells = [];
  run.forEach((item) => {
    const dl = item.querySelector('.cmp-download');
    const title = clean((dl.querySelector('.cmp-download__title') || {}).textContent);
    const action = dl.querySelector('a.cmp-download__action[href], a.cmp-download__title-link[href]');
    const href = action ? linkFor(action.getAttribute('href').trim()) : '';
    const srcImg = [...item.querySelectorAll('img')].find((img) => !img.closest('.cmp-download'));
    const text = [];
    if (title) text.push(heading(document, 'h3', title, href));
    const props = [...dl.querySelectorAll('.cmp-download__property')]
      .map((prop) => clean(prop.textContent)).filter(Boolean);
    props.forEach((t) => {
      const p = document.createElement('p');
      p.textContent = t;
      text.push(p);
    });
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = clean(dl.querySelector('.cmp-download__action').textContent) || 'Download';
      p.append(a);
      text.push(p);
    }
    if (text.length) cells.push([cardImage(document, srcImg, clean(srcImg && srcImg.getAttribute('alt')) || title), text]);
  });
  run.slice(1).forEach((item) => item.remove());
  if (!cells.length) {
    element.remove();
    return;
  }
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards', cells }));
}

export default function parse(element, { document, url }) {
  if (element.matches('.filter-items__items__list')) {
    parseListing(element, document, url);
    return;
  }
  if (element.matches('.container.responsivegrid') && element.querySelector('.cmp-download')) {
    parseDownloads(element, document);
    return;
  }
  const cells = [];
  const seen = new Set();
  element.querySelectorAll('.gallery-items a.teaser').forEach((teaser) => {
    if (teaser.closest('.hidden-teasers')) return;
    const srcImg = teaser.querySelector('.teaser-content__thumbnail img, img');
    const src = srcImg ? encodeSrc(srcImg.getAttribute('src') || srcImg.getAttribute('data-src')) : '';
    if (!src || /^(data|blob):/i.test(src) || seen.has(src)) return;
    seen.add(src);
    const img = document.createElement('img');
    img.src = src;
    img.alt = clean(srcImg.getAttribute('alt') || teaser.getAttribute('data-alt') || teaser.getAttribute('title'));
    const title = clean((teaser.querySelector('.teaser-content__title') || {}).textContent);
    let text = '';
    if (title) {
      text = document.createElement('h3');
      text.textContent = title;
    }
    cells.push([img, text]);
  });

  if (!cells.length) {
    element.remove();
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
