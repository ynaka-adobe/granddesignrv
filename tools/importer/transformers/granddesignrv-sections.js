/* eslint-disable */
/* global WebImporter */

/**
 * Grand Design RV sections transformer.
 *
 * beforeTransform: insert <hr> section breaks (reverse order) while the
 * parser target elements still exist. Styled sections get a temporary
 * `data-excat-section-id` marker on their <hr>; a styled first section gets
 * a temporary marked <hr> that is removed again in afterTransform.
 *
 * afterTransform: insert Section Metadata after each styled section's marker
 * (or the surviving section element), then drop the markers.
 *
 * Anchors: when a section holds the target of an in-page link on the page
 * (e.g. the model sub-nav's "#brand-construction"), that id is carried into
 * the Section Metadata as `id` so the link keeps working (scripts.js sets it
 * on the section).
 */

const MARKER_ATTR = 'data-excat-section-id';
const ANCHOR_ATTR = 'data-excat-section-anchor';

/* ids referenced by in-page links ("#id" or "<this page>#id") */
function linkTargets(root) {
  const ids = new Set();
  root.querySelectorAll('a[href*="#"]').forEach((a) => {
    const id = (a.getAttribute('href') || '').split('#')[1];
    if (id) ids.add(id);
  });
  return ids;
}

function anchorId(el, targets) {
  if (!targets.size) return '';
  if (el.id && targets.has(el.id)) return el.id;
  const hit = [...el.querySelectorAll('[id]')].find((e) => targets.has(e.id));
  return hit ? hit.id : '';
}

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (let i = 0; i < selectors.length; i += 1) {
    const sel = selectors[i];
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // Unsupported selector (e.g. :has in older engines) - try the next one.
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = (template && template.sections) || [];
  if (!sections.length) return;

  const doc = element.ownerDocument;

  if (hookName === 'beforeTransform') {
    const targets = linkTargets(element);
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (!el || !el.parentNode) continue;

      const id = anchorId(el, targets);
      if (i > 0 || section.style || id) {
        const hr = doc.createElement('hr');
        if (section.style || id) hr.setAttribute(MARKER_ATTR, section.id);
        if (id) hr.setAttribute(ANCHOR_ATTR, id);
        el.parentNode.insertBefore(hr, el);
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const marker = element.querySelector(`hr[${MARKER_ATTR}="${section.id}"]`);
      const id = marker ? marker.getAttribute(ANCHOR_ATTR) : '';
      if (!section.style && !id) continue;

      const anchor = marker || findSectionElement(element, section);
      if (!anchor || !anchor.parentNode) continue;

      const cells = {};
      if (section.style) cells.style = section.style;
      if (id) cells.id = id;
      const metadata = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells,
      });
      anchor.parentNode.insertBefore(metadata, anchor.nextSibling);

      if (marker) {
        if (i === 0) {
          // Temporary break before a styled first section: remove entirely.
          marker.remove();
        } else {
          marker.removeAttribute(MARKER_ATTR);
        }
      }
    }

    // Safety: clear any stray markers.
    element.querySelectorAll(`[${MARKER_ATTR}], [${ANCHOR_ATTR}]`).forEach((el) => {
      el.removeAttribute(MARKER_ATTR);
      el.removeAttribute(ANCHOR_ATTR);
    });

    removeEmptySections(element, doc);
  }
}

/* is this Section Metadata table carrying an anchor id? */
function isMetadataTable(el) {
  if (el.tagName !== 'TABLE') return false;
  const first = el.querySelector('tr > *');
  return !!first && /^\s*section metadata\s*$/i.test(first.textContent);
}

/*
 * Optional source parts that ended up empty after parsing (e.g. a model with no brand story, or
 * feature tabs that only exist as a mobile copy) would render as empty, possibly coloured, bands.
 * Drop every section that holds nothing but its Section Metadata, unless that metadata carries an
 * anchor id some link points to.
 */
function removeEmptySections(element, doc) {
  // section breaks inserted above (no class); the source's own separator rules are left alone
  const breaks = [...element.querySelectorAll('hr:not([class])')];
  for (let i = breaks.length - 1; i >= 0; i -= 1) {
    const hr = breaks[i];
    if (!hr.isConnected) continue;
    const range = doc.createRange();
    range.setStartAfter(hr);
    // measure to the next break that still exists (later ones may have been removed already)
    const next = breaks.slice(i + 1).find((b) => b.isConnected);
    if (next) range.setEndBefore(next);
    else range.setEndAfter(element.lastChild);
    const frag = range.cloneContents();
    const tables = [...frag.querySelectorAll('table')];
    const metas = tables.filter(isMetadataTable);
    if (metas.some((t) => /\bid\b/i.test(t.textContent.replace(/section metadata/i, '')))) continue;
    metas.forEach((t) => t.remove());
    // media only counts when it has a source (empty viewer/placeholder tags are dropped later anyway)
    const hasContent = frag.textContent.trim()
      || [...frag.querySelectorAll('img, iframe, video, source')].some((m) => (m.getAttribute('src') || m.getAttribute('srcset') || '').trim())
      || frag.querySelector('table');
    if (hasContent) continue;
    range.deleteContents();
    hr.remove();
  }
}
