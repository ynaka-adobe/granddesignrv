/* eslint-disable */
/* global WebImporter */

/**
 * tabs-feature parser.
 * Source: the dark "feature" tabs of a model page (AEM Core tabs, #brand-tabs). Each panel is an
 * experience fragment with its own free-form aem-Grid layout (image beside text, text over a
 * background photo, full-width banner, icon rows, ...). Mobile-only copies
 * (.aem-GridColumn--default--hide) are skipped; the cleanup transformer also removes them.
 *
 * Each panel is flattened in document order into content items (images, headings, paragraphs,
 * lists, buttons, embed links, background photos), then arranged for the block's layout rules:
 *   - background photo (.dynamic-media-container__image / inline background-image)
 *       -> text first, the photo alone in its own <p> LAST            ("overlay")
 *   - otherwise the main image alone in its own <p> FIRST, then the rest  ("split");
 *     main image = the first non-logo image, or the widest one when the panel starts with text
 *   - images only -> image(s) only                                   ("banner")
 *   - repeated [icon image, heading, text] runs -> one <ul>, one <li> per feature
 *   - two or more adjacent images (logos, icons) -> one <p>          (icon row)
 * Headings keep their level (h1 becomes h2: the page owns the h1); a heading or paragraph that
 * only holds a link becomes a button (<p><a>). Linked images keep their link (YouTube etc.);
 * embed iframes become links.
 * Output (Tabs convention, 2 columns, one row per tab): [tab label | panel content]
 */

const ORIGIN_RE = /^https?:\/\/(?:www\.)?granddesignrv\.com/i;
const IMAGE_SERVER = 'https://gdrv.scene7.com/is/image/';
const VIDEO_SERVER = 'https://gdrv.scene7.com/is/content/';

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

function isHiddenClass(el) {
  return !!(el.classList && el.classList.contains('aem-GridColumn--default--hide'));
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

function own(tabs, selector) {
  return [...tabs.querySelectorAll(selector)].filter((el) => el.closest('.cmp-tabs') === tabs);
}

/* a real navigation link around an element (Core image links without href carry none) */
function linkOf(el, stop) {
  for (let n = el.parentElement; n && n !== stop; n = n.parentElement) {
    if (n.tagName === 'A') {
      const href = (n.getAttribute('href') || '').trim();
      return href && href !== '#' && !/^javascript:/i.test(href) ? href : '';
    }
  }
  return '';
}

/* share of the panel width an element's grid column takes (nested aem-Grid columns multiply) */
function widthOf(el, stop) {
  let share = 1;
  for (let n = el; n && n !== stop; n = n.parentElement) {
    const col = (n.className && typeof n.className === 'string') ? n.className.match(/aem-GridColumn--default--(\d+)/) : null;
    const grid = n.parentElement && typeof n.parentElement.className === 'string'
      ? n.parentElement.className.match(/aem-Grid--(?:default--)?(\d+)/) : null;
    if (col && grid) share *= Math.min(1, parseInt(col[1], 10) / parseInt(grid[1], 10));
  }
  return share;
}

function youtubeWatch(src) {
  const m = (src || '').match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/i);
  return m ? `https://www.youtube.com/watch?v=${m[1]}` : src;
}

/* copy inline content (text, emphasis, links, line breaks) */
function copyInline(source, target, document) {
  source.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      const text = node.textContent.replace(/​/g, '').replace(/[\s ]+/g, ' ');
      if (text) target.append(document.createTextNode(text));
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (tag === 'img' || tag === 'script' || tag === 'style') return;
    const map = { b: 'strong', strong: 'strong', i: 'em', em: 'em', a: 'a', br: 'br', sup: 'sup', sub: 'sub', u: 'u' };
    // unknown wrappers, and emphasis already applied by an ancestor, are unwrapped
    if (!map[tag] || (map[tag] !== 'a' && map[tag] !== 'br' && target.closest && target.closest(map[tag]))) {
      copyInline(node, target, document);
      return;
    }
    const el = document.createElement(map[tag]);
    if (tag === 'a') {
      const href = (node.getAttribute('href') || '').trim();
      if (!href) { copyInline(node, target, document); return; }
      el.setAttribute('href', relativize(href));
    }
    copyInline(node, el, document);
    if (tag === 'br' || clean(el.textContent)) target.append(el);
  });
  return target;
}

/* inline copy with leading / trailing line breaks and spaces trimmed */
function inline(source, target, document) {
  copyInline(source, target, document);
  const edge = (first) => {
    for (;;) {
      const n = first ? target.firstChild : target.lastChild;
      if (!n) return;
      if (n.nodeName === 'BR' || (n.nodeType === 3 && !n.textContent.trim())) { n.remove(); continue; }
      if (n.nodeType === 3) n.textContent = first ? n.textContent.replace(/^\s+/, '') : n.textContent.replace(/\s+$/, '');
      return;
    }
  };
  edge(true);
  edge(false);
  return target;
}

/* the only link of an element when the element's text is that link's text */
function soleLink(el) {
  const links = [...el.querySelectorAll('a[href]')].filter((a) => clean(a.textContent));
  if (links.length !== 1) return null;
  return clean(links[0].textContent) === clean(el.textContent) ? links[0] : null;
}

/* walk one panel and return its content items in document order */
function collect(panel) {
  const items = [];
  const imageItem = (img) => {
    const src = imgSrc(img);
    if (!src) return;
    items.push({
      type: 'img', src, alt: clean(img.getAttribute('alt')), href: linkOf(img, panel), width: widthOf(img, panel), node: img,
    });
  };

  const walk = (node) => {
    if (node.nodeType === 3) {
      // loose text directly inside a rich-text container
      if (clean(node.textContent) && node.parentElement && node.parentElement.classList.contains('cmp-text')) {
        items.push({ type: 'text', tag: 'p', node: node.parentElement, loose: node });
      }
      return;
    }
    if (node.nodeType !== 1 || isHiddenClass(node)) return;
    const tag = node.tagName;
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'BUTTON', 'FORM', 'svg', 'SVG'].includes(tag)) return;

    if (node.classList.contains('dynamic-media-container__image')) {
      const picture = node.querySelector('picture');
      const src = picture ? pictureSrc(picture) : (node.querySelector('img') ? imgSrc(node.querySelector('img')) : '');
      if (src) items.push({ type: 'bg', src, alt: '' });
      return;
    }
    const style = node.getAttribute('style') || '';
    const bgMatch = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    if (bgMatch) items.push({ type: 'bg', src: bgMatch[1], alt: '' });

    // Dynamic Media component without a rendered <img> (image set / video)
    if (node.hasAttribute('data-asset-path') && !node.querySelector('img')) {
      const type = (node.getAttribute('data-asset-type') || '').toLowerCase();
      const path = encodeURI(node.getAttribute('data-asset-path').replace(/^\/+/, ''));
      if (/video/.test(type)) {
        const server = (node.getAttribute('data-videoserver') || VIDEO_SERVER).replace(/\/?$/, '/');
        items.push({ type: 'link', href: `${server}${path}`, text: clean(node.getAttribute('data-title')) || `${server}${path}` });
      } else if (path) {
        const server = (node.getAttribute('data-imageserver') || IMAGE_SERVER).replace(/\/?$/, '/');
        items.push({
          type: 'img', src: `${server}${path}`, alt: clean(node.getAttribute('data-alt')), href: '', width: widthOf(node, panel), node,
        });
      }
      return;
    }

    if (tag === 'IFRAME') {
      const src = node.getAttribute('src') || node.getAttribute('data-src') || '';
      if (/^https?:/i.test(src)) items.push({ type: 'link', href: youtubeWatch(src), text: youtubeWatch(src) });
      return;
    }
    if (tag === 'IMG') { imageItem(node); return; }
    if (tag === 'PICTURE') { const img = node.querySelector('img'); if (img) imageItem(img); return; }

    if (/^H[1-6]$/.test(tag) || tag === 'P') {
      node.querySelectorAll('img').forEach(imageItem);
      if (!clean(node.textContent)) return;
      const link = soleLink(node);
      if (link) { items.push({ type: 'button', href: relativize(link.getAttribute('href')), text: clean(link.textContent) }); return; }
      items.push({ type: 'text', tag: tag === 'P' ? 'p' : (tag === 'H1' ? 'h2' : tag.toLowerCase()), node });
      return;
    }
    if (tag === 'UL' || tag === 'OL') {
      if (clean(node.textContent)) items.push({ type: 'list', tag: tag.toLowerCase(), node });
      return;
    }
    if (tag === 'A') {
      const href = (node.getAttribute('href') || '').trim();
      if (node.querySelector('img, picture') || !clean(node.textContent)) { [...node.childNodes].forEach(walk); return; }
      if (href && href !== '#') { items.push({ type: 'button', href: relativize(href), text: clean(node.textContent) }); return; }
    }
    [...node.childNodes].forEach(walk);
  };
  [...panel.childNodes].forEach(walk);

  // loose-text items: one paragraph per text container
  const seenLoose = new Set();
  return items.filter((item) => {
    if (!item.loose) return true;
    if (seenLoose.has(item.node)) return false;
    seenLoose.add(item.node);
    return true;
  });
}

function isLogo(item) {
  return /logo/i.test(`${item.alt} ${item.src.split('?')[0]}`);
}

/* arrange items for the block's layout rules and render them */
function render(items, document) {
  const bgs = items.filter((i) => i.type === 'bg');
  let rest = items.filter((i) => i.type !== 'bg');

  // repeated [image, heading, text...] runs -> feature list. Every run uses the first run's
  // heading level and at most its paragraph count, so a lead image + h3 + copy before h4 icon
  // items, or a footnote after the last item, stays outside the list.
  const out = [];
  for (let i = 0; i < rest.length;) {
    const runs = [];
    let j = i;
    let headingTag = null;
    let maxParas = Infinity;
    while (j < rest.length && rest[j].type === 'img' && rest[j + 1] && rest[j + 1].type === 'text'
      && /^h/.test(rest[j + 1].tag) && (!headingTag || rest[j + 1].tag === headingTag)) {
      let k = j + 2;
      while (k < rest.length && k - j - 2 < maxParas && rest[k].type === 'text' && rest[k].tag === 'p') k += 1;
      if (!headingTag) {
        // the lead run decides the pattern only when the next run repeats it
        const next = rest[k + 1];
        if (!(rest[k] && rest[k].type === 'img' && next && next.type === 'text' && next.tag === rest[j + 1].tag)) break;
        headingTag = rest[j + 1].tag;
        maxParas = k - j - 2;
      }
      runs.push(rest.slice(j, k));
      j = k;
    }
    if (runs.length >= 2) {
      out.push({ type: 'features', runs });
      i = j;
    } else {
      out.push(rest[i]);
      i += 1;
    }
  }
  rest = out;

  // main image first (no background photo)
  const hasText = rest.some((i) => i.type !== 'img');
  if (!bgs.length && hasText) {
    const images = rest.filter((i) => i.type === 'img');
    if (images.length) {
      let main;
      if (rest[0].type === 'img') {
        main = images.find((i) => !isLogo(i)) || images[0];
      } else {
        main = images.filter((i) => !isLogo(i)).sort((a, b) => b.width - a.width)[0] || images[0];
      }
      rest = [{ ...main, alone: true }, ...rest.filter((i) => i !== main)];
    }
  }

  const imgEl = (item) => {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    if (!item.href) return img;
    const a = document.createElement('a');
    a.href = relativize(item.href);
    a.append(img);
    return a;
  };

  const nodes = [];
  for (let i = 0; i < rest.length; i += 1) {
    const item = rest[i];
    if (item.type === 'img') {
      const p = document.createElement('p');
      p.append(imgEl(item));
      // adjacent images (not the main one) share one paragraph: icon / logo row
      if (!item.alone) {
        while (rest[i + 1] && rest[i + 1].type === 'img' && !rest[i + 1].alone) {
          i += 1;
          p.append(' ', imgEl(rest[i]));
        }
      }
      nodes.push(p);
    } else if (item.type === 'text') {
      const el = document.createElement(item.tag);
      if (item.loose) {
        [...item.node.childNodes].filter((n) => n.nodeType === 3).forEach((n) => el.append(document.createTextNode(clean(n.textContent))));
      } else {
        inline(item.node, el, document);
      }
      if (clean(el.textContent)) nodes.push(el);
    } else if (item.type === 'list') {
      const list = document.createElement(item.tag);
      [...item.node.children].filter((li) => li.tagName === 'LI').forEach((li) => {
        const entry = inline(li, document.createElement('li'), document);
        if (clean(entry.textContent)) list.append(entry);
      });
      if (list.children.length) nodes.push(list);
    } else if (item.type === 'button' || item.type === 'link') {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.text;
      p.append(a);
      nodes.push(p);
    } else if (item.type === 'features') {
      const ul = document.createElement('ul');
      item.runs.forEach((run) => {
        const li = document.createElement('li');
        run.forEach((part, n) => {
          if (part.type === 'img') { li.append(imgEl(part)); return; }
          const text = inline(part.node, document.createElement(/^h/.test(part.tag) ? 'strong' : 'span'), document);
          if (!clean(text.textContent)) return;
          if (n > 0) li.append(document.createElement('br'));
          li.append(...(text.tagName === 'SPAN' ? [...text.childNodes] : [text]));
        });
        ul.append(li);
      });
      nodes.push(ul);
    }
  }

  bgs.forEach((bg) => {
    const p = document.createElement('p');
    const img = document.createElement('img');
    img.src = bg.src;
    img.alt = '';
    p.append(img);
    nodes.push(p);
  });
  return nodes;
}

export default function parse(element, { document }) {
  const tabs = own(element, '.cmp-tabs__tab');
  const panels = own(element, '.cmp-tabs__tabpanel');
  const cells = [];

  tabs.forEach((tab, i) => {
    const label = clean(tab.textContent);
    const id = tab.getAttribute('aria-controls');
    const panel = (id && panels.find((p) => p.id === id)) || panels[i];
    const content = panel ? render(collect(panel), document) : [];
    if (!label && !content.length) return;
    cells.push([label || `Tab ${i + 1}`, content.length ? content : '']);
  });

  if (!cells.length) {
    element.remove();
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-feature', cells });
  element.replaceWith(block);
}
