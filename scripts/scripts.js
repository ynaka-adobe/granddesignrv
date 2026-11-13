import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateBlocks,
  decorateTemplateAndTheme,
  getMetadata,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  sampleRUM,
  readBlockConfig,
  toClassName,
  toCamelCase,
} from './aem.js';
import {
  isUePreviewHost,
  loadTarget,
  applyTargetHeroMboxIfConfigured,
} from './target.js';

// --- BEGIN DM/Scene7 auto-block (excat-generated) ---

const DM_BREAKPOINTS = [
  // desktop: 1600 is the largest width the source requests; some Scene7 masters are only
  // 1600px wide and Scene7 pads larger requests with a black canvas
  { media: '(min-width: 600px)', width: 1600 },
  { width: 750 }, // mobile / fallback (no media)
];

// ---- Canonical helpers (keep in sync with dm-scene7-helpers.js) ----
function detectDynamicMediaUrl(urlStr) {
  // Reject relative URLs up front — without this guard, the auto-block
  // scans every anchor in <main> and a normal site link like
  // `<a href="/is/image/foo">` would be classified as DM and replaced by
  // a <picture>. Keep byte-identical with dm-scene7-helpers.js.
  if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
  let u;
  try { u = new URL(urlStr, 'https://x/'); } catch { return false; }
  // Scene7 detected by path alone — hostname is irrelevant because
  // customer sites routinely CNAME a vanity domain to Scene7 (e.g.
  // media-assets.brand.example).
  if (u.pathname.startsWith('/is/image/')) {
    return 'scene7';
  }
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) {
    return 'dm-openapi';
  }
  return false;
}

function buildScene7Rendition(src, { width, format }) {
  // Manipulate the query string verbatim — URL.searchParams percent-
  // encodes `$`, but Scene7's IS/Image template-parameter syntax
  // (`$image=`, `$badge=`, etc.) requires the literal `$`. Encoded
  // form is silently dropped by Scene7's parser, returning the bare
  // template image instead of the personalized composite.
  const normalized = src.startsWith('//') ? `https:${src}` : src;
  const qIdx = normalized.indexOf('?');
  const base = qIdx >= 0 ? normalized.slice(0, qIdx) : normalized;
  const query = qIdx >= 0 ? normalized.slice(qIdx + 1) : '';
  const pairs = query.split('&').filter((p) => p);
  const filtered = pairs.filter((p) => {
    const k = p.split('=')[0];
    return k !== 'wid' && k !== 'fmt';
  });
  filtered.push(`wid=${width}`);
  filtered.push(`fmt=${format}`);
  return `${base}?${filtered.join('&')}`;
}

function buildDmOpenApiRendition(src, { width }) {
  // Synthetic base — see buildScene7Rendition above.
  const url = new URL(src, 'https://x/');
  url.searchParams.set('width', String(width));
  return url.toString();
}

function findDmOnAnchor(a) {
  if (!a || typeof a.getAttribute !== 'function') return null;
  const href = a.getAttribute('href') || '';
  if (detectDynamicMediaUrl(href)) return { mode: 'unlinked', dmUrl: href };
  const title = a.getAttribute('title') || '';
  if (detectDynamicMediaUrl(title)) return { mode: 'linked', dmUrl: title };
  return null;
}

// True when the given anchor is the sole child of a markdown-generated
// <p> wrapper that should be unwrapped so the picture becomes a top-
// level grid cell. P only — NEVER DIV: EDS block content uses <div>
// cells (cards/carousel/columns decorators detect image cells via
// `div.querySelector('picture')`); unwrapping a <div> collapses the
// block's row structure and stops images rendering inside blocks.
// Text-node guard: <p>caption <a href="DM">alt</a></p> must NOT be
// treated as unwrappable — replacing the parent would delete "caption".
// Comparing trimmed textContent of <p> against the anchor's catches this.
function isUnwrappableMarkdownParagraph(anchor) {
  const parent = anchor && anchor.parentElement;
  if (!parent || parent.tagName !== 'P') return false;
  if (parent.children.length !== 1 || parent.firstElementChild !== anchor) return false;
  return parent.textContent.trim() === anchor.textContent.trim();
}

// Sentinel used by the transformer when source <img> alt is empty. Document
// view shows the visible cue; we translate it back to alt="" here so screen
// readers correctly skip decorative images. If an author edits the link
// text away from the sentinel, their edit becomes the real alt — a11y
// improves. Must stay byte-identical to dm-scene7-helpers.js EMPTY_ALT_SENTINEL.
const EMPTY_ALT_SENTINEL = 'Image without alt text';

function linkTextToAlt(linkText) {
  return linkText === EMPTY_ALT_SENTINEL ? '' : linkText;
}

// ---- Rendering ----
function appendSource(picture, { type, srcset, media }) {
  const source = document.createElement('source');
  if (type) source.type = type;
  source.srcset = srcset;
  if (media) source.setAttribute('media', media);
  picture.append(source);
}

function renderScene7Picture(src, alt) {
  const picture = document.createElement('picture');
  // webp-alpha keeps transparent product shots and logos transparent (plain webp/jpg fill
  // them with black); for opaque photos it costs about 1% extra
  DM_BREAKPOINTS.forEach((bp) => appendSource(picture, {
    type: 'image/webp',
    srcset: buildScene7Rendition(src, { width: bp.width, format: 'webp-alpha' }),
    media: bp.media,
  }));
  DM_BREAKPOINTS.forEach((bp) => appendSource(picture, {
    type: 'image/jpeg',
    srcset: buildScene7Rendition(src, { width: bp.width, format: 'jpg' }),
    media: bp.media,
  }));
  const img = document.createElement('img');
  img.src = buildScene7Rendition(src, { width: 750, format: 'jpg' });
  img.alt = alt;
  img.loading = 'lazy';
  picture.append(img);
  return picture;
}

function renderDmOpenApiPicture(src, alt) {
  const picture = document.createElement('picture');
  DM_BREAKPOINTS.forEach((bp) => appendSource(picture, {
    srcset: buildDmOpenApiRendition(src, { width: bp.width }),
    media: bp.media,
  }));
  const img = document.createElement('img');
  img.src = buildDmOpenApiRendition(src, { width: 750 });
  img.alt = alt;
  img.loading = 'lazy';
  picture.append(img);
  return picture;
}

function buildDynamicMediaImages(main) {
  // Anchors carrying DM URLs from the markdown round-trip. The transformer
  // turns <img DM> into <a href=DM-URL> (or <a href=/page title=DM-URL>
  // for the linked case); CommonMark's [text](url "title") syntax
  // survives docx and the title attribute round-trips back to a real
  // HTML attribute at render time.
  main.querySelectorAll('a').forEach((a) => {
    const match = findDmOnAnchor(a);
    if (!match) return;

    const { mode, dmUrl } = match;
    // Translate link text back to alt: sentinel ('Image without alt text')
    // means the source had alt="" — render with alt="" for a11y. Any other
    // text (including the author's edit of the placeholder) is real alt.
    const alt = linkTextToAlt(a.textContent.trim());
    const picture = detectDynamicMediaUrl(dmUrl) === 'scene7'
      ? renderScene7Picture(dmUrl, alt)
      : renderDmOpenApiPicture(dmUrl, alt);

    // decorateMain() calls decorateButtons() BEFORE buildAutoBlocks(). At
    // that point every DM anchor (linked or unlinked) looks like a plain
    // text link — no <img> yet — so decorateButtons promotes it to a button
    // and adds `button-container` to its sole-child <p>/<div> parent. The
    // unwanted border around the rebuilt <picture> is the visible symptom;
    // for unlinked-in-<div> the leftover `button-container` on a block-cell
    // <div> can also confuse block decorators that filter on classList.
    // Strip both classes BEFORE rebuilding so the cleanup covers every
    // branch below (replaceChildren / replaceWith / parent-replaceWith).
    // Idempotent — no-op when the classes aren't present.
    a.classList.remove('button', 'primary', 'secondary');
    if (a.classList.length === 0) a.removeAttribute('class');
    const buttonContainer = a.parentElement;
    if (
      buttonContainer
      && buttonContainer.classList.contains('button-container')
      && buttonContainer.children.length === 1
    ) {
      buttonContainer.classList.remove('button-container');
      if (buttonContainer.classList.length === 0) buttonContainer.removeAttribute('class');
    }

    if (mode === 'linked') {
      // Keep the outer <a> and its navigation href. Drop the DM URL from title
      // (it's been consumed) and replace the anchor's content with the picture.
      a.removeAttribute('title');
      a.replaceChildren(picture);
      return;
    }

    // Unlinked: the whole anchor is just a carrier for the DM URL.
    // If it's the markdown-generated <p> wrapper around a standalone
    // image, unwrap so the picture becomes a top-level grid cell.
    // NEVER unwrap <div> — those are block-content cells (cards,
    // carousel, columns); unwrapping them collapses the block's row
    // structure and decorators can't find their image cells.
    if (isUnwrappableMarkdownParagraph(a)) {
      a.parentElement.replaceWith(picture);
    } else {
      a.replaceWith(picture);
    }
  });
}

// Register the DM dispatcher for createOptimizedPicture interop.
// The aem.js patch (applied per skills/excat-site-migration/SKILL.md
// Step 5b) checks for this hook and delegates DM URLs to our renderer,
// so block decorators that call createOptimizedPicture(img.src, ...) on
// Scene7 IS/Image template URLs or DM Open API URLs preserve their
// query parameters instead of having them stripped by the path-only
// optimizer in aem.js. No-op when the auto-block is not installed
// (hook unregistered → aem.js falls through to standard logic).
//
// Returning null for non-DM URLs lets the caller (createOptimizedPicture)
// fall through to its standard path-only optimization. This is the
// regression guard for non-DM images on the same page.
window.__dmRender__ = (src, alt) => {
  const family = detectDynamicMediaUrl(src);
  if (!family) return null;
  return family === 'scene7'
    ? renderScene7Picture(src, alt)
    : renderDmOpenApiPicture(src, alt);
};

// --- END DM/Scene7 auto-block ---

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // leave headings and images that an authored block (e.g. columns) already owns
  const inBlock = (el) => el && el.closest('main > div > div[class]');
  if (inBlock(h1) || inBlock(picture)) return;
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function autolinkModals(doc) {
  doc.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');
    if (origin && origin.href && origin.href.includes('/modals/')) {
      e.preventDefault();
      const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
      openModal(origin.href);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    if (!main.querySelector('.hero')) buildHeroBlock(main);
    buildDynamicMediaImages(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates all sections in a container element.
 * @param {Element} main The container element
 */
function decorateSections(main) {
  main.querySelectorAll(':scope > div').forEach((section) => {
    const wrappers = [];
    let defaultContent = false;
    [...section.children].forEach((e) => {
      if (e.classList.contains('richtext')) {
        e.removeAttribute('class');
        if (!defaultContent) {
          const wrapper = document.createElement('div');
          wrapper.classList.add('default-content-wrapper');
          wrappers.push(wrapper);
          defaultContent = true;
        }
      } else if (e.tagName === 'DIV' || !defaultContent) {
        const wrapper = document.createElement('div');
        wrappers.push(wrapper);
        defaultContent = e.tagName !== 'DIV';
        if (defaultContent) wrapper.classList.add('default-content-wrapper');
      }
      wrappers[wrappers.length - 1].append(e);
    });

    // Add wrapped content back
    wrappers.forEach((wrapper) => section.append(wrapper));
    section.classList.add('section');
    section.dataset.sectionStatus = 'initialized';
    section.style.display = 'none';

    // Process section metadata
    const sectionMeta = section.querySelector('div.section-metadata');
    if (sectionMeta) {
      const meta = readBlockConfig(sectionMeta);
      Object.keys(meta).forEach((key) => {
        if (key === 'style') {
          const styles = meta.style
            .split(',')
            .filter((style) => style)
            .map((style) => toClassName(style.trim()));
          styles.forEach((style) => section.classList.add(style));
        } else if (key === 'id') {
          // anchor target for in-page links (e.g. the model sub-nav's jump links)
          const id = toClassName(meta.id);
          if (id && !document.getElementById(id)) section.id = id;
        } else {
          section.dataset[toCamelCase(key)] = meta[key];
        }
      });
      sectionMeta.parentNode.remove();
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  doc.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    doc.body.dataset.breadcrumbs = true;
  }
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    doc.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  sampleRUM.enhance();

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  import('../tools/sidekick/aem-genai-variations.js');
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadSidekick() {
  if (document.querySelector('aem-sidekick')) {
    import('./sidekick.js');
    return;
  }

  document.addEventListener('sidekick-ready', () => {
    import('./sidekick.js');
  });
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  await loadTarget();
  await applyTargetHeroMboxIfConfigured();
  loadDelayed();
  loadSidekick();
}

// UE Editor support before page load
if (isUePreviewHost()) {
  // eslint-disable-next-line import/no-unresolved
  await import(`${window.hlx.codeBasePath}/ue/scripts/ue.js`).then(({ default: ue }) => ue());
}

loadPage();

(function da() {
  const { searchParams } = new URL(window.location.href);

  const lp = searchParams.get('dapreview');
  // eslint-disable-next-line import/no-unresolved
  if (lp) import('https://da.live/scripts/dapreview.js').then((mod) => mod.default(loadPage));

  const exp = searchParams.get('daexperiment');
  // eslint-disable-next-line import/no-unresolved
  if (exp) import('https://da.live/nx/public/plugins/exp/exp.js');
}());
