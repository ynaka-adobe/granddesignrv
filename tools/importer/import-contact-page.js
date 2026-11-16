/* eslint-disable */
/* global WebImporter */

import modelSubnavParser from './parsers/model-subnav.js';
import accordionBoxedParser from './parsers/accordion-boxed.js';

import granddesignrvCleanupTransformer from './transformers/granddesignrv-cleanup.js';
import granddesignrvDmImagesTransformer from './transformers/granddesignrv-dm-images.js';
import granddesignrvSectionsTransformer from './transformers/granddesignrv-sections.js';

const PAGE_TEMPLATE = {
  "name": "contact-page",
  "urls": [
    "https://www.granddesignrv.com/company/contact-us"
  ],
  "description": "Contact page: company sub-navigation, intro (heading, copy, CTA, address), department contact sections separated by rules, and a store FAQ accordion.",
  "blocks": [
    {
      "name": "model-subnav",
      "instances": [
        ".sticky-nav .cmp-experiencefragment--secondary-navigation"
      ]
    },
    {
      "name": "accordion-boxed",
      "instances": [
        "main .accordion.panelcontainer"
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
      "name": "Contact intro",
      "selector": [
        "main .outer-block > .cmp-container > .aem-Grid > .title.heading-scale-feature"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "main .outer-block > .cmp-container > .aem-Grid > .title.heading-scale-feature",
        "main .outer-block > .cmp-container > .aem-Grid > .text",
        "main .outer-block > .cmp-container > .aem-Grid > .button"
      ]
    },
    {
      "id": "section-3",
      "name": "GDRV Inside Sales Team",
      "selector": [
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid:nth-child(6)",
        "main .outer-block > .cmp-container > .aem-Grid > .separator.cmp-separator--hidden + .container.responsivegrid"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid:nth-child(6)"
      ]
    },
    {
      "id": "section-4",
      "name": "Parts, Service & Warranty",
      "selector": [
        "main .outer-block > .cmp-container > .aem-Grid > .separator:not(.cmp-separator--hidden) + .container.responsivegrid + .container.responsivegrid",
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid:nth-child(9)"
      ],
      "style": "rule-top",
      "blocks": [],
      "defaultContent": [
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid:nth-child(9)"
      ]
    },
    {
      "id": "section-5",
      "name": "Media & Influencer Requests",
      "selector": [
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid:nth-child(11)",
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid + .separator:not(.cmp-separator--hidden) + .container.responsivegrid:not(:has(+ .container))"
      ],
      "style": "rule-top",
      "blocks": [],
      "defaultContent": [
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid:nth-child(11)"
      ]
    },
    {
      "id": "section-6",
      "name": "Merchandise & Store Questions",
      "selector": [
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid.margin-bottom-large",
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid:nth-child(15)"
      ],
      "style": "rule-top",
      "blocks": [
        "accordion-boxed"
      ],
      "defaultContent": [
        "main .outer-block > .cmp-container > .aem-Grid > .container.responsivegrid.margin-bottom-large .text"
      ]
    }
  ]
};

const parsers = {
  'model-subnav': modelSubnavParser,
  'accordion-boxed': accordionBoxedParser,
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
