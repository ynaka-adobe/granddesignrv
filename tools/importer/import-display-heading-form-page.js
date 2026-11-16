/* eslint-disable */
/* global WebImporter */

import modelSubnavParser from './parsers/model-subnav.js';
import columnsParser from './parsers/columns.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsPromoParser from './parsers/cards-promo.js';
import cardsCategoryParser from './parsers/cards-category.js';

import granddesignrvCleanupTransformer from './transformers/granddesignrv-cleanup.js';
import granddesignrvDmImagesTransformer from './transformers/granddesignrv-dm-images.js';
import granddesignrvSectionsTransformer from './transformers/granddesignrv-sections.js';

const PAGE_TEMPLATE = {
  "name": "display-heading-form-page",
  "urls": [
    "https://www.granddesignrv.com/company/Media-Request",
    "https://www.granddesignrv.com/company/inside-sales",
    "https://www.granddesignrv.com/company/our-story",
    "https://www.granddesignrv.com/partner",
    "https://www.granddesignrv.com/shop-inventory"
  ],
  "description": "Page that opens with a left-aligned red display-font heading, followed by intro columns, text and a form or interactive component",
  "blocks": [
    {
      "name": "model-subnav",
      "instances": [
        ".sticky-nav .cmp-experiencefragment--secondary-navigation"
      ]
    },
    {
      "name": "columns",
      "instances": [
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid.aem-GridColumn--default--6:has(+ .container.responsivegrid.aem-GridColumn--default--3)"
      ]
    },
    {
      "name": "cards-feature",
      "instances": [
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid.full-width:has(.inner-block__left .cmp-image img)"
      ]
    },
    {
      "name": "cards-promo",
      "instances": [
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid.full-width ~ .container.responsivegrid.padding-bottom-medium"
      ]
    },
    {
      "name": "cards-category",
      "instances": [
        ".cmp-container > .cmp-imageGrid"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "Company sub-navigation",
      "selector": [
        ".sticky-nav.sticky-nav--top"
      ],
      "style": "light-grey",
      "blocks": [
        "model-subnav"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Our Story intro",
      "selector": [
        "main .outer-block"
      ],
      "style": null,
      "blocks": [
        "columns"
      ],
      "defaultContent": [
        "main .outer-block > .cmp-container > .aem-Grid > .title.heading-scale-feature:first-child"
      ]
    },
    {
      "id": "section-3",
      "name": "Our Story promise (dark band)",
      "selector": [
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid.full-width"
      ],
      "style": "dark",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "Our Story leadership team",
      "selector": [
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid.full-width + .title"
      ],
      "style": null,
      "blocks": [
        "cards-promo"
      ],
      "defaultContent": [
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid.full-width + .title"
      ]
    },
    {
      "id": "section-5",
      "name": "Partners intro and logo grid",
      "selector": [
        ".container.responsivegrid:has(> .cmp-container > .cmp-imageGrid)"
      ],
      "style": "rule-top",
      "blocks": [
        "cards-category"
      ],
      "defaultContent": [
        ".container.responsivegrid:has(> .cmp-container > .cmp-imageGrid) > .cmp-container > .title",
        ".container.responsivegrid:has(> .cmp-container > .cmp-imageGrid) > .cmp-container > .text"
      ]
    },
    {
      "id": "section-6",
      "name": "Shop Inventory intro",
      "selector": [
        ".container.responsivegrid:has(> .cmp-container > .shopInventory)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".container.responsivegrid:has(> .cmp-container > .shopInventory) > .cmp-container > .title",
        ".container.responsivegrid:has(> .cmp-container > .shopInventory) > .cmp-container > .text"
      ]
    },
    {
      "id": "section-7",
      "name": "Shop Inventory dealer search (grey panel)",
      "selector": [
        ".shopInventory"
      ],
      "style": "light-grey",
      "blocks": [],
      "defaultContent": [
        ".shopInventory"
      ]
    }
  ]
};

const parsers = {
  'model-subnav': modelSubnavParser,
  'columns': columnsParser,
  'cards-feature': cardsFeatureParser,
  'cards-promo': cardsPromoParser,
  'cards-category': cardsCategoryParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [granddesignrvSectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
const transformers = [granddesignrvCleanupTransformer, granddesignrvDmImagesTransformer, ...lateTransformers];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
// Catalog selectors (pageInstances, pageCleanup) count the <script> and <hr> elements the importer
// removes before transform, so a catalog template finds its targets in preprocess.
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
    matches.forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
  return pageBlocks;
}

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers('beforeTransform', document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute('data-excat-block', String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute('data-excat-section', String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

export default {
  preprocess: (payload) => {
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // A fragment's nodes left `main` before afterTransform: finalize it the same way, without the
    // page-only section breaks and metadata.
    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }, ...params.fragments];
  },
};
