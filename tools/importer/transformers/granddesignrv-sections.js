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
 */

const MARKER_ATTR = 'data-excat-section-id';

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
  if (sections.length < 2) return;

  const doc = element.ownerDocument;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (!el || !el.parentNode) continue;

      if (i > 0 || section.style) {
        const hr = doc.createElement('hr');
        if (section.style) hr.setAttribute(MARKER_ATTR, section.id);
        el.parentNode.insertBefore(hr, el);
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`hr[${MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || findSectionElement(element, section);
      if (!anchor || !anchor.parentNode) continue;

      const metadata = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
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
    element.querySelectorAll(`[${MARKER_ATTR}]`).forEach((el) => el.removeAttribute(MARKER_ATTR));
  }
}
