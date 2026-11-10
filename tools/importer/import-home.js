/* eslint-disable */
/* global WebImporter */

import carouselHeroParser from './parsers/carousel-hero.js';
import cardsCalloutsParser from './parsers/cards-callouts.js';
import cardsPromoParser from './parsers/cards-promo.js';
import tabsBrandsParser from './parsers/tabs-brands.js';
import heroBannerParser from './parsers/hero-banner.js';
import quoteRatingParser from './parsers/quote-rating.js';

import granddesignrvCleanupTransformer from './transformers/granddesignrv-cleanup.js';
import granddesignrvSectionsTransformer from './transformers/granddesignrv-sections.js';
import granddesignrvDmImagesTransformer from './transformers/granddesignrv-dm-images.js';

const PAGE_TEMPLATE = {
  "name": "home",
  "urls": [
    "https://www.granddesignrv.com/"
  ],
  "representativeUrl": "https://www.granddesignrv.com/",
  "description": "Grand Design RV homepage: hero carousel, quick links and brand pillar cards, brand tabs with model sliders, featured RV models with Lineage E launch banner, and owner testimonials.",
  "urlPattern": "/",
  "blocks": [
    {
      "name": "carousel-hero",
      "instances": [
        ".carousel.panelcontainer.aem-GridColumn--phone--hide"
      ]
    },
    {
      "name": "cards-callouts",
      "instances": [
        "#homepage-boxes .aem-GridColumn--phone--hide .container.responsivegrid.margin-top-medium.margin-bottom-large.text-center"
      ]
    },
    {
      "name": "cards-promo",
      "instances": [
        "#homepage-boxes .aem-GridColumn--phone--hide .container.responsivegrid.padding-bottom-large"
      ]
    },
    {
      "name": "tabs-brands",
      "instances": [
        ".cmp-homepageslider .tab-content"
      ]
    },
    {
      "name": "hero-banner",
      "instances": [
        ".launchhero"
      ]
    },
    {
      "name": "quote-rating",
      "instances": [
        ".customercomment .q.grid-item"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "Hero carousel",
      "selector": [
        ".carousel.panelcontainer.aem-GridColumn--phone--hide"
      ],
      "style": null,
      "blocks": [
        "carousel-hero"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Quick links and brand pillars",
      "selector": [
        "#homepage-boxes .container.responsivegrid.full-width:has(.aem-GridColumn--phone--hide .padding-bottom-large)",
        "#container-43103e6c12"
      ],
      "style": "light-grey",
      "blocks": [
        "cards-callouts",
        "cards-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3",
      "name": "Explore our brands",
      "selector": [
        ".slider:has(.cmp-homepageslider)"
      ],
      "style": null,
      "blocks": [
        "tabs-brands"
      ],
      "defaultContent": [
        ".cmp-homepageslider .brandselectortitle h1",
        ".cmp-homepageslider .description p"
      ]
    },
    {
      "id": "section-4",
      "name": "Featured RV innovation",
      "selector": [
        ".text.margin-top-medium.aem-GridColumn--phone--hide"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": [
        ".text.margin-top-medium.aem-GridColumn--phone--hide h1",
        ".aem-Grid > .title.aem-GridColumn--phone--hide",
        ".aem-Grid > .text.margin-bottom-small",
        ".title.aem-GridColumn--phone--hide ~ .image",
        ".title.aem-GridColumn--phone--hide ~ .button",
        ".launchhero + .container.responsivegrid"
      ]
    },
    {
      "id": "section-5",
      "name": "Owner testimonials",
      "selector": [
        ".customercomment"
      ],
      "style": null,
      "blocks": [
        "quote-rating"
      ],
      "defaultContent": [
        ".customercomment .reviewsheader h2"
      ]
    }
  ]
};

const parsers = {
  'carousel-hero': carouselHeroParser,
  'cards-callouts': cardsCalloutsParser,
  'cards-promo': cardsPromoParser,
  'tabs-brands': tabsBrandsParser,
  'hero-banner': heroBannerParser,
  'quote-rating': quoteRatingParser,
};

const transformers = [granddesignrvCleanupTransformer, granddesignrvSectionsTransformer, granddesignrvDmImagesTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
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

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
