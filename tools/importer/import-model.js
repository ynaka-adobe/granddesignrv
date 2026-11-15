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
import heroBannerParser from './parsers/hero-banner.js';
import columnsParser from './parsers/columns.js';

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
      "name": "hero-banner",
      "instances": [
        ".launchhero"
      ]
    },
    {
      "name": "columns",
      "instances": [
        ".performancedetails"
      ]
    },
    {
      "name": "hero-model",
      "instances": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1) > .cmp-container > .aem-Grid:has(> .text) > .container.full-width.section:first-child",
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1):has(.cmp-container--gradient-black)",
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1)"
      ]
    },
    {
      "name": "tabs-feature",
      "instances": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(3) .tabs.panelcontainer:not(.thumbnailtabs) > .cmp-tabs:not(.cmp-tabs .cmp-tabs)"
      ]
    },
    {
      "name": "tabs-swatch",
      "instances": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1) .experiencefragment .thumbnailtabs .cmp-tabs:not(.cmp-tabs .cmp-tabs)",
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
        ".launchhero",
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
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1):not(.excat-launch-layout):not(:has(.launchhero)):not(:has(> .cmp-container > .aem-Grid > .container.full-width.section:first-child ~ .text)) .container.full-width:has(h1)",
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1):not(.excat-launch-layout):not(:has(.launchhero)):not(:has(> .cmp-container > .aem-Grid > .container.full-width.section:first-child ~ .text)) .container.full-width:has(h2)"
      ],
      "style": "dark",
      "blocks": [],
      "defaultContent": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1):not(.excat-launch-layout):not(:has(.launchhero)):not(:has(> .cmp-container > .aem-Grid > .container.full-width.section:first-child ~ .text)) .container.full-width:has(h1) h1",
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1):not(.excat-launch-layout):not(:has(.launchhero)):not(:has(> .cmp-container > .aem-Grid > .container.full-width.section:first-child ~ .text)) .container.full-width:has(h1) .button a"
      ]
    },
    {
      "id": "section-3b",
      "name": "Model intro after the hero band (launch layout: VP, Foundation)",
      "selector": [
        ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1) > .cmp-container > .aem-Grid:has(> .text) > .container.full-width.section:first-child + *"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "section-3c",
      "name": "Launch: performance details",
      "selector": [
        ".performancedetails"
      ],
      "style": null,
      "blocks": [
        "columns"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3d",
      "name": "Launch: everyday living + colour swatches",
      "selector": [
        ".performancedetails ~ *:has(.thumbnailtabs)"
      ],
      "style": null,
      "blocks": [
        "tabs-swatch"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3e",
      "name": "Launch: updates form",
      "selector": [
        ".launchupdatesform"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
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
  // launch hero CTA points at the in-page updates form (#launch-updates-form): keep it
  'hero-banner': (element, ctx) => heroBannerParser(element, { ...ctx, params: { ...ctx.params, keepAnchorCta: true } }),
  columns: columnsParser,
};

/*
 * Launch pages (Lineage Series E): the "launch updates" lead form (.cmp-launch-updates-form) is
 * an AEM servlet form, not an EDS form sheet. Keep it as default content: heading, intro, the
 * field labels as a list, the submit label and the legal copy with its links. Only that
 * component is touched (absent from the series pages).
 */
/*
 * Launch layouts only (a .launchhero, or a hero band followed by intro content in the first grid
 * child: VP, Foundation, E); the series pages have neither, so this never runs there.
 *  - the hero CTA's in-page target id (#launch-updates-form) sits on an empty
 *    anchor container just before the form; move it onto the updates form so the form section
 *    carries the anchor
 *  - the before/after image slider's controls (range input "50", thumb arrows) are not content
 */
const LAUNCH_LAYOUT = '.launchhero, .root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1) > .cmp-container > .aem-Grid:has(> .text) > .container.full-width.section:first-child';
function prepareLaunchLayout(main) {
  if (!main.querySelector(LAUNCH_LAYOUT)) return;
  // the parsers replace .launchhero / the hero band, after which the promo-band section (section-3)
  // fallback selectors would match the launch layout: this class keeps them off it
  const first = main.querySelector('.root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1)');
  if (first) first.classList.add('excat-launch-layout');
  // the slider is a live React root on the page being imported: removing its controls in place
  // gets re-rendered before conversion, so swap the whole root for a static copy of its images
  main.querySelectorAll('.cmp-images-overlap').forEach((root) => {
    const copy = main.ownerDocument.createElement('div');
    root.querySelectorAll('img').forEach((img) => {
      const p = main.ownerDocument.createElement('p');
      p.append(img.cloneNode());
      copy.append(p);
    });
    root.replaceWith(copy);
  });
  const form = main.querySelector('.launchupdatesform');
  main.querySelectorAll('a.cmp-launch-hero__cta[href^="#"]').forEach((cta) => {
    const id = cta.getAttribute('href').slice(1);
    if (!id || !form || form.id === id) return;
    const holder = [...main.querySelectorAll('[id]')].find((el) => el.id === id);
    // the target is an empty anchor container placed just before the form (or one wrapping it)
    if (!holder) return;
    const before = !holder.textContent.trim() && (holder.compareDocumentPosition(form) & 4);
    if (!(holder.contains(form) || before)) return;
    holder.removeAttribute('id');
    form.id = id;
  });
}

function launchFormToContent(main, document) {
  main.querySelectorAll('.cmp-launch-updates-form').forEach((section) => {
    const clean = (t) => (t || '').replace(/[\s\u00a0]+/g, ' ').trim();
    const out = [];
    section.querySelectorAll('h1, h2, h3').forEach((h) => {
      if (h.closest('form') || !clean(h.textContent)) return;
      const el = document.createElement(h.tagName.toLowerCase());
      el.textContent = clean(h.textContent);
      out.push(el);
    });
    section.querySelectorAll('.cmp-launch-updates-form__intro').forEach((p) => {
      if (!clean(p.textContent)) return;
      const el = document.createElement('p');
      el.textContent = clean(p.textContent);
      out.push(el);
    });
    const form = section.querySelector('form');
    if (form) {
      const ul = document.createElement('ul');
      form.querySelectorAll('label').forEach((label) => {
        if (!clean(label.textContent)) return;
        const li = document.createElement('li');
        li.textContent = clean(label.textContent);
        ul.append(li);
      });
      if (ul.children.length) out.push(ul);
      form.querySelectorAll('button[type="submit"], input[type="submit"]').forEach((btn) => {
        const label = clean(btn.textContent || btn.getAttribute('value'));
        if (!label) return;
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = label;
        p.append(strong);
        out.push(p);
      });
      form.querySelectorAll('.cmp-launch-updates-form__legal').forEach((legal) => {
        if (!clean(legal.textContent)) return;
        const p = document.createElement('p');
        legal.childNodes.forEach((n) => {
          if (n.nodeType === 3) p.append(document.createTextNode(n.textContent.replace(/\s+/g, ' ')));
          else if (n.tagName === 'A' && n.getAttribute('href')) {
            const a = document.createElement('a');
            a.href = n.getAttribute('href');
            a.textContent = clean(n.textContent);
            p.append(a);
          } else p.append(document.createTextNode(n.textContent));
        });
        out.push(p);
      });
    }
    section.replaceWith(...out);
  });
}
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
    prepareLaunchLayout(main);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);
    launchFormToContent(main, document);

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
