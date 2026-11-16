/* eslint-disable */
/* global WebImporter */

import columnsParser from './parsers/columns.js';

import granddesignrvCleanupTransformer from './transformers/granddesignrv-cleanup.js';
import granddesignrvDmImagesTransformer from './transformers/granddesignrv-dm-images.js';
import granddesignrvSectionsTransformer from './transformers/granddesignrv-sections.js';

const PAGE_TEMPLATE = {
  "name": "display-heading-landing",
  "urls": [
    "https://www.granddesignrv.com/MomentumMAV-FW",
    "https://www.granddesignrv.com/Solitude",
    "https://www.granddesignrv.com/landing-pages/grand-design-rv-awards",
    "https://www.granddesignrv.com/landing-pages/past-grand-design-rv-awards",
    "https://www.granddesignrv.com/shopping-tools/dealership-rv-shows"
  ],
  "description": "Landing page that opens with a centered red display-font heading, followed by image-text columns, card groups and text sections",
  "blocks": [
    {
      "name": "columns",
      "instances": [
        ".containerv2 > .cmp-container-v2:not(.cmp-container-v2--desktop-columns-1)",
        ".related-content > .related-content__grid"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "RV Shows intro",
      "selector": [
        ".aem-Grid:has(> .showcalendar) > .title.heading-scale-feature"
      ],
      "style": "rule-top",
      "blocks": [],
      "defaultContent": [
        ".aem-Grid:has(> .showcalendar) > .title.heading-scale-feature",
        ".aem-Grid:has(> .showcalendar) > .text"
      ]
    },
    {
      "id": "section-2",
      "name": "Show calendar (grey panel)",
      "selector": [
        ".aem-Grid:has(> .showcalendar) > .showcalendar"
      ],
      "style": "light-grey",
      "blocks": [],
      "defaultContent": [
        ".aem-Grid:has(> .showcalendar) > .showcalendar"
      ]
    },
    {
      "id": "section-3",
      "name": "Show submission note",
      "selector": [
        ".aem-Grid:has(> .showcalendar) > .showcalendar ~ .container.responsivegrid"
      ],
      "style": "rule-top",
      "blocks": [],
      "defaultContent": [
        ".aem-Grid:has(> .showcalendar) > .showcalendar ~ .container.responsivegrid .cmp-text"
      ]
    },
    {
      "id": "section-4",
      "name": "Awards intro",
      "selector": [
        ".aem-Grid:has(> .relatedcontent) > .container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-feature)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".aem-Grid:has(> .relatedcontent) > .container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-feature) .title"
      ]
    },
    {
      "id": "section-5",
      "name": "Award: first model (badge row, award titles, copy)",
      "selector": [
        ".aem-Grid:has(> .relatedcontent) > .container.responsivegrid:has(.containerv2)"
      ],
      "style": null,
      "blocks": [
        "columns"
      ],
      "defaultContent": [
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-primary) > .cmp-container > .aem-Grid > .title",
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-primary) > .cmp-container > .aem-Grid > .container.responsivegrid .title",
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-primary) > .cmp-container > .aem-Grid > .container.responsivegrid .text"
      ]
    },
    {
      "id": "section-6",
      "name": "Award: second model (nested in the first group)",
      "selector": [
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-primary) .container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-primary)"
      ],
      "style": "rule-top",
      "blocks": [],
      "defaultContent": [
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-primary) .container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-primary) .title",
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-primary) .container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-primary) .containerv2 .cmp-image",
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-primary) .container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-primary) .text"
      ]
    },
    {
      "id": "section-7",
      "name": "Award: next model group",
      "selector": [
        ".aem-Grid:has(> .relatedcontent) > .container.responsivegrid:has(.containerv2) ~ .container.responsivegrid:has(.containerv2)"
      ],
      "style": "rule-top",
      "blocks": [],
      "defaultContent": [
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-primary) .title",
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-primary) .containerv2 .cmp-image",
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-primary) .text"
      ]
    },
    {
      "id": "section-8",
      "name": "Dealer Satisfaction Index award",
      "selector": [
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .image + .title.heading-scale-primary)"
      ],
      "style": "rule-top",
      "blocks": [],
      "defaultContent": [
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .image + .title.heading-scale-primary) .cmp-image",
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .image + .title.heading-scale-primary) .title",
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .image + .title.heading-scale-primary) .text"
      ]
    },
    {
      "id": "section-9",
      "name": "Previous awards button",
      "selector": [
        ".aem-Grid:has(> .relatedcontent) > .button"
      ],
      "style": "rule-top",
      "blocks": [],
      "defaultContent": [
        ".aem-Grid:has(> .relatedcontent) > .button"
      ]
    },
    {
      "id": "section-10",
      "name": "Related posts",
      "selector": [
        ".aem-Grid:has(> .relatedcontent) > .relatedcontent"
      ],
      "style": null,
      "blocks": [
        "columns"
      ],
      "defaultContent": [
        ".aem-Grid:has(> .relatedcontent) > .relatedcontent .related-content__title"
      ]
    }
  ]
};

const parsers = {
  'columns': columnsParser,
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
