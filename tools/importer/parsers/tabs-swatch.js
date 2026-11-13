/* eslint-disable */
/* global WebImporter */

/**
 * tabs-swatch parser.
 * Source: "Full Body Paint" colour picker, an AEM Core tabs component (.thumbnailtabs .cmp-tabs)
 * in the exterior / brand-story part of a model page:
 *   .cmp-tabs__tablist > li.cmp-tabs__tab   swatch thumbnail (img.cmp-tabs__thumbnail-image)
 *                                           + colour name (.cmp-tabs__tab-title)
 *   .cmp-tabs__tabpanel (aria-controls)     exterior photo of the unit in that colour
 * Tabs and panels are paired by aria-controls (document order as fallback); only this
 * component's own tabs/panels are read, never those of a nested tabs component.
 * Output (Tabs convention, 2 columns, one row per colour):
 *   [swatch img + colour name (tab label) | exterior img, alt = colour name (tab content)]
 */

function clean(text) {
  return (text || '').replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
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

/* own (not nested) descendants of a tabs component */
function own(tabs, selector) {
  return [...tabs.querySelectorAll(selector)].filter((el) => el.closest('.cmp-tabs') === tabs);
}

export default function parse(element, { document }) {
  const tabs = own(element, '.cmp-tabs__tab');
  const panels = own(element, '.cmp-tabs__tabpanel');
  const cells = [];

  tabs.forEach((tab, i) => {
    const titleEl = tab.querySelector('.cmp-tabs__tab-title');
    const name = clean(titleEl ? titleEl.textContent : tab.textContent);

    const swatchCell = [];
    const thumb = tab.querySelector('img');
    if (thumb && imgSrc(thumb)) {
      const img = document.createElement('img');
      img.src = imgSrc(thumb);
      img.alt = name ? `${name} swatch` : '';
      swatchCell.push(img);
    }
    if (name) swatchCell.push(document.createTextNode(name));

    const id = tab.getAttribute('aria-controls');
    const panel = (id && panels.find((p) => p.id === id)) || panels[i];
    const imageCell = [];
    if (panel) {
      // a Dynamic Media spin set / image viewer has no plain <img>: Scene7 serves the
      // set's first frame at {imageserver}{asset path}
      const viewer = [...panel.querySelectorAll('[data-asset-path][data-asset-type="spinset"], [data-asset-path][data-asset-type="image"]')]
        .find((el) => !isHidden(el, element));
      const photo = [...panel.querySelectorAll('img')]
        .find((img) => !isHidden(img, element) && imgSrc(img) && !(viewer && viewer.contains(img)));
      let src = photo ? imgSrc(photo) : '';
      if (!src && viewer) {
        const server = (viewer.getAttribute('data-imageserver') || 'https://gdrv.scene7.com/is/image/').replace(/\/?$/, '/');
        src = `${server}${encodeURI(viewer.getAttribute('data-asset-path'))}`;
      }
      if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = name || clean(photo ? photo.getAttribute('alt') : viewer.getAttribute('data-alt'));
        imageCell.push(img);
      }
    }

    if (!swatchCell.length && !imageCell.length) return;
    cells.push([swatchCell.length ? swatchCell : '', imageCell.length ? imageCell : '']);
  });

  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-swatch', cells });
  element.replaceWith(block);
}
