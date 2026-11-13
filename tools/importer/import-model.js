/* eslint-disable */
/* global WebImporter */

import modelSubnavParser from './parsers/model-subnav.js';
import heroModelParser from './parsers/hero-model.js';
import tabsSwatchParser from './parsers/tabs-swatch.js';
import videoInlineParser from './parsers/video-inline.js';
import tabsFeatureParser from './parsers/tabs-feature.js';
import tabsVerticalParser from './parsers/tabs-vertical.js';
import tableSpecsParser from './parsers/table-specs.js';
import quoteRatingParser from './parsers/quote-rating.js';

import granddesignrvCleanupTransformer from './transformers/granddesignrv-cleanup.js';
import granddesignrvDmImagesTransformer from './transformers/granddesignrv-dm-images.js';
import granddesignrvSectionsTransformer from './transformers/granddesignrv-sections.js';

const PAGE_TEMPLATE = {
  "name": "model",
  "urls": [
    "https://www.granddesignrv.com/travel-trailers/transcend-lite",
    "https://www.granddesignrv.com/travel-trailers/transcend-one",
    "https://www.granddesignrv.com/travel-trailers/transcend-xplor",
    "https://www.granddesignrv.com/travel-trailers/transcend",
    "https://www.granddesignrv.com/travel-trailers/imagine-aim",
    "https://www.granddesignrv.com/travel-trailers/imagine-xls",
    "https://www.granddesignrv.com/travel-trailers/imagine",
    "https://www.granddesignrv.com/travel-trailers/serenova",
    "https://www.granddesignrv.com/travel-trailers/reflection",
    "https://www.granddesignrv.com/fifth-wheels/reflection-100-series",
    "https://www.granddesignrv.com/fifth-wheels/reflection-150-series",
    "https://www.granddesignrv.com/fifth-wheels/reflection",
    "https://www.granddesignrv.com/fifth-wheels/influence",
    "https://www.granddesignrv.com/fifth-wheels/solitude",
    "https://www.granddesignrv.com/toy-haulers/momentum-mav",
    "https://www.granddesignrv.com/toy-haulers/momentum-mav-fifth-wheels",
    "https://www.granddesignrv.com/toy-haulers/momentum-g-class-travel-trailers",
    "https://www.granddesignrv.com/toy-haulers/momentum-g-class",
    "https://www.granddesignrv.com/toy-haulers/momentum",
    "https://www.granddesignrv.com/motorized/lineage-series-m",
    "https://www.granddesignrv.com/motorized/lineage-series-f",
    "https://www.granddesignrv.com/motorized/lineage-series-vt"
  ],
  "representativeUrl": "https://www.granddesignrv.com/toy-haulers/momentum",
  "description": "RV model page (22 models): sticky model sub-nav, hero, intro with 360 spin, brand story, feature tabs, construction tabs, specifications table, customer reviews. Parts are positional children of the main grid.",
  "blocks": [
    {
      "name": "model-subnav",
      "instances": [
        ".subnavigation"
      ]
    },
    {
      "name": "hero-model",
      "instances": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1):has(.cmp-container--gradient-black)",
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1)"
      ]
    },
    {
      "name": "tabs-swatch",
      "instances": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(2) .cmp-tabs:not(.cmp-tabs .cmp-tabs)",
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(3) .cmp-tabs:not(.cmp-tabs .cmp-tabs)"
      ]
    },
    {
      "name": "video-inline",
      "instances": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(3) .dynamicmedia:has([data-asset-type=\"videoavs\"])",
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(3) .dynamicmedia[data-asset-type=\"videoavs\"]"
      ]
    },
    {
      "name": "tabs-feature",
      "instances": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(4) .cmp-tabs:not(.cmp-tabs .cmp-tabs)"
      ]
    },
    {
      "name": "tabs-vertical",
      "instances": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(5) .cmp-tabs:not(.cmp-tabs .cmp-tabs)"
      ]
    },
    {
      "name": "table-specs",
      "instances": [
        ".spectable"
      ]
    },
    {
      "name": "quote-rating",
      "instances": [
        ".customercomment .q.grid-item"
      ]
    }
  ],
  "urlPattern": "/{category}/{model}",
  "sections": [
    {
      "id": "section-1",
      "name": "Model sub-navigation (sticky)",
      "selector": [
        ".subnavigation"
      ],
      "style": null,
      "blocks": [
        "model-subnav"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Model hero",
      "selector": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1)"
      ],
      "style": null,
      "blocks": [
        "hero-model"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3",
      "name": "Black promo band (optional)",
      "selector": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1) .container.full-width:has(h1)",
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1) .container.full-width:has(h2)"
      ],
      "style": "dark",
      "blocks": [],
      "defaultContent": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1) .container.full-width:has(h1) h1",
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1) .container.full-width:has(h1) .button a"
      ]
    },
    {
      "id": "section-4",
      "name": "Exterior / 360 spin",
      "selector": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(2)"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(2) .title",
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(2) .text",
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(2) .dynamicmedia"
      ]
    },
    {
      "id": "section-5",
      "name": "Brand story (text + video)",
      "selector": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(3)"
      ],
      "style": "split",
      "blocks": [
        "video-inline"
      ],
      "defaultContent": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(3) .text"
      ]
    },
    {
      "id": "section-6",
      "name": "Full body paint (optional colour picker)",
      "selector": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(2) .experiencefragment:has(.cmp-tabs)",
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(3) .experiencefragment:has(.cmp-tabs)",
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(2) .tabs:has(.cmp-tabs)",
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(3) .tabs:has(.cmp-tabs)"
      ],
      "style": "centered",
      "blocks": [
        "tabs-swatch"
      ],
      "defaultContent": []
    },
    {
      "id": "section-7",
      "name": "Feature tabs",
      "selector": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(4)"
      ],
      "style": "dark",
      "blocks": [
        "tabs-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "section-8",
      "name": "Constructed to a Superior Standard",
      "selector": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(5)"
      ],
      "style": null,
      "blocks": [
        "tabs-vertical"
      ],
      "defaultContent": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(5) .title h2"
      ]
    },
    {
      "id": "section-9",
      "name": "Product Line Specifications",
      "selector": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(6)"
      ],
      "style": null,
      "blocks": [
        "table-specs"
      ],
      "defaultContent": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(6) .title h2",
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(6) .text"
      ]
    },
    {
      "id": "section-10",
      "name": "Customer reviews",
      "selector": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(7)"
      ],
      "style": null,
      "blocks": [
        "quote-rating"
      ],
      "defaultContent": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(7) .customercomment h2"
      ]
    }
  ]
};

const parsers = {
  'model-subnav': modelSubnavParser,
  'hero-model': heroModelParser,
  'tabs-swatch': tabsSwatchParser,
  'video-inline': videoInlineParser,
  'tabs-feature': tabsFeatureParser,
  'tabs-vertical': tabsVerticalParser,
  'table-specs': tableSpecsParser,
  'quote-rating': quoteRatingParser,
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
