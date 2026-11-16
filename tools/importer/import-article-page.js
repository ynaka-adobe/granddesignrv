/* eslint-disable */
/* global WebImporter */

import carouselHeroParser from './parsers/carousel-hero.js';
import cardsCalloutsParser from './parsers/cards-callouts.js';
import cardsPromoParser from './parsers/cards-promo.js';
import tabsBrandsParser from './parsers/tabs-brands.js';
import heroBannerParser from './parsers/hero-banner.js';
import quoteRatingParser from './parsers/quote-rating.js';
import modelSubnavParser from './parsers/model-subnav.js';
import heroParser from './parsers/hero.js';
import columnsImageTextParser from './parsers/columns-image-text.js';
import tableParser from './parsers/table.js';
import videoInlineParser from './parsers/video-inline.js';
import cardsParser from './parsers/cards.js';
import columnsParser from './parsers/columns.js';

import granddesignrvCleanupTransformer from './transformers/granddesignrv-cleanup.js';
import granddesignrvDmImagesTransformer from './transformers/granddesignrv-dm-images.js';
import granddesignrvSectionsTransformer from './transformers/granddesignrv-sections.js';

const PAGE_TEMPLATE = {
  "name": "article-page",
  "urls": [
    "https://www.granddesignrv.com/",
    "https://www.granddesignrv.com/adventure-more",
    "https://www.granddesignrv.com/adventure-more/buy",
    "https://www.granddesignrv.com/adventure-more/buy/10-rv-safety-features-that-could-save-your-life-",
    "https://www.granddesignrv.com/adventure-more/buy/3-Things-to-Expect-From-Grand-Design-RVs-First-Motorized-Lineup",
    "https://www.granddesignrv.com/adventure-more/buy/5-Reasons-The-New-Series-VT-Luxury-Adventure-Van-Should-Be-Your-No1-Pick-This-Spring",
    "https://www.granddesignrv.com/adventure-more/buy/Adventure-Vans-101-The-Ultimate-Guide-To-Freedom-on-Wheels",
    "https://www.granddesignrv.com/adventure-more/buy/Extreme-Lithium-Package",
    "https://www.granddesignrv.com/adventure-more/buy/Grand-Design-s-Lineage-Series-F-is-Rewriting-Off-Grid-Adventure",
    "https://www.granddesignrv.com/adventure-more/buy/How-to-Choose-A-Fifth-Wheel-Toy-Hauler--Expert-Tips",
    "https://www.granddesignrv.com/adventure-more/buy/Inside-The-Momentum-Toy-Hauler",
    "https://www.granddesignrv.com/adventure-more/buy/Inside-The-Reflection-Fifth-Wheel",
    "https://www.granddesignrv.com/adventure-more/buy/Super-C-Motorhomes-The-Perfect-Blend-of-Power-and-Luxury1",
    "https://www.granddesignrv.com/adventure-more/buy/Toy-Hauler-Features-to-Consider-when-choosing-your-next-RV",
    "https://www.granddesignrv.com/adventure-more/buy/What-to-Consider-for-Different-Classes-of-RVs",
    "https://www.granddesignrv.com/adventure-more/buy/Why-Toy-Haulers-Are-Best-For-Families",
    "https://www.granddesignrv.com/adventure-more/buy/a-first-time-buyer-s-guide-to-buying-an-rv",
    "https://www.granddesignrv.com/adventure-more/buy/inside-sales--your-trusted-co-pilots-for-your-rv-adventures",
    "https://www.granddesignrv.com/adventure-more/buy/rv-or-van-life---why-an-rv-might-be-a-better-fit-than-a-camperva",
    "https://www.granddesignrv.com/adventure-more/buy/toy-hauler-travel-trailer-vs-fifth-wheel",
    "https://www.granddesignrv.com/adventure-more/buy/what-is-the-difference-between-travel-trailers--fifth-wheels--an",
    "https://www.granddesignrv.com/adventure-more/buy/which-grand-design-model-is-right-for-you-",
    "https://www.granddesignrv.com/adventure-more/community",
    "https://www.granddesignrv.com/adventure-more/community/3-dogs--3-bikes-and-a-bike-show",
    "https://www.granddesignrv.com/adventure-more/community/7-reasons-why-rv-owners-love-rv-rallies-and-you-should-too-",
    "https://www.granddesignrv.com/adventure-more/community/Ambassadors-Changing-Lanes",
    "https://www.granddesignrv.com/adventure-more/community/Impact-Team-Meet-The-Campaholics",
    "https://www.granddesignrv.com/adventure-more/community/boy-these-people-like-to-have-fun",
    "https://www.granddesignrv.com/adventure-more/community/grand-design-gives-back",
    "https://www.granddesignrv.com/adventure-more/community/grand-design-rv-heads-to-Quartzsite-2025",
    "https://www.granddesignrv.com/adventure-more/community/grand-design-rv-heads-to-the-40th-annual-florida-rv-supershow-",
    "https://www.granddesignrv.com/adventure-more/community/in-case-you-missed-the-2022-fall-rv-events-and-rallies",
    "https://www.granddesignrv.com/adventure-more/community/lineage-launches-in-nyc",
    "https://www.granddesignrv.com/adventure-more/community/the-story-behind-bass_queen83",
    "https://www.granddesignrv.com/adventure-more/learn",
    "https://www.granddesignrv.com/adventure-more/learn/Embrace-the-Chill--Winter-RVing-Like-a-Pro",
    "https://www.granddesignrv.com/adventure-more/learn/GDRV-Tech-Forum",
    "https://www.granddesignrv.com/adventure-more/learn/Golden-Threads-Heated-And-Enclosed-Underbelly",
    "https://www.granddesignrv.com/adventure-more/learn/Golden-Threads-Introduction",
    "https://www.granddesignrv.com/adventure-more/learn/Golden-Threads-Laminated-Units",
    "https://www.granddesignrv.com/adventure-more/learn/Golden-Threads-Tire-Beads",
    "https://www.granddesignrv.com/adventure-more/learn/cozy-camping--must-have-rv-accessories-for-fall-comfort",
    "https://www.granddesignrv.com/adventure-more/learn/everything-you-need-for-the-ultimate-rv-internet-setup",
    "https://www.granddesignrv.com/adventure-more/learn/how-do-full-time-rvers-get-their-mail-and-packages-",
    "https://www.granddesignrv.com/adventure-more/learn/how-to-downsize-from-a-house-and-live-in-an-rv-full-time",
    "https://www.granddesignrv.com/adventure-more/learn/how-to-load-and-level-your-new--rv",
    "https://www.granddesignrv.com/adventure-more/learn/how-to-prep-your-rv-for-spring",
    "https://www.granddesignrv.com/adventure-more/learn/how-to-winterize-your-rv-or-travel-trailer-in-six-easy-steps",
    "https://www.granddesignrv.com/adventure-more/learn/make-the-most-of-your-weekend--rv-setup-and-teardown-checklist-",
    "https://www.granddesignrv.com/adventure-more/learn/prepping-your-rv-for-fall---essential-rv-maintenance-as-the-temp",
    "https://www.granddesignrv.com/adventure-more/learn/safer-towing-with-the-only-rv-anti-lock-brakes-on-the-market",
    "https://www.granddesignrv.com/adventure-more/learn/staying-connected-on-the-road--navigating-internet-options-for-r",
    "https://www.granddesignrv.com/adventure-more/learn/the-best-camping-chairs-for-maximum-value-and-comfort-",
    "https://www.granddesignrv.com/adventure-more/learn/the-only-rv-checklist-you-need-before-leaving-home",
    "https://www.granddesignrv.com/adventure-more/learn/tips-for-towing-down-a-steep-hill-with-an-rv-trailer",
    "https://www.granddesignrv.com/adventure-more/learn/top-10-rv-towing-tips--tow-your-rv-with-confidence",
    "https://www.granddesignrv.com/adventure-more/learn/top-6-simple-safety-tips-for-new-rv-owners",
    "https://www.granddesignrv.com/adventure-more/learn/what-do-you-do-if-your-rv-breaks-down-",
    "https://www.granddesignrv.com/adventure-more/live",
    "https://www.granddesignrv.com/adventure-more/live/10-scenic-drives-to-add-to-your-rv-bucket-list",
    "https://www.granddesignrv.com/adventure-more/live/5-delicious-and-easy-meal-ideas-for-camping",
    "https://www.granddesignrv.com/adventure-more/live/5-must-haves-for-a-weekend-rv-camping-with-friends",
    "https://www.granddesignrv.com/adventure-more/live/9-must-haves-for-hunting-in-an-rv",
    "https://www.granddesignrv.com/adventure-more/live/9-practical-remote-jobs-for-rvers--van-lifers--and-digital-nomad",
    "https://www.granddesignrv.com/adventure-more/live/All-it-takes-is-a-bit-of--Imagine-ation-",
    "https://www.granddesignrv.com/adventure-more/live/Beyond-the-Border--Baja-Adventures-for-the-Bold",
    "https://www.granddesignrv.com/adventure-more/live/Desert-Days,-Starry-Nights--Arizona-s-Hidden-Winter-Escapes",
    "https://www.granddesignrv.com/adventure-more/live/Your-Winter-Home-From-Home-on-the-Road-",
    "https://www.granddesignrv.com/adventure-more/live/adventure-on-a-dime--camp-for-free-in-these-moab-rv-parks",
    "https://www.granddesignrv.com/adventure-more/live/adventure-on-a-dime--cheap-and-free-rv-camping-locations-in-flor",
    "https://www.granddesignrv.com/adventure-more/live/adventure-on-a-dime--cheap-rv-parks-within-the-great-smoky-mount",
    "https://www.granddesignrv.com/adventure-more/live/are-rv-parks-safe-from-crime--tips-for-weekenders-and-full-time-",
    "https://www.granddesignrv.com/adventure-more/live/best-fall-foliage-rv-trips-in-the-united-states",
    "https://www.granddesignrv.com/adventure-more/live/cozy-indoor-activities-for-winter-camping-in-your-rv",
    "https://www.granddesignrv.com/adventure-more/live/exploring-fall-festivals---best-rv-friendly-events-across-the-co",
    "https://www.granddesignrv.com/adventure-more/live/our-favorite-fun-rv-camping-accessories0",
    "https://www.granddesignrv.com/adventure-more/live/the-best-family-rv-parks-to-visit-this-summer",
    "https://www.granddesignrv.com/adventure-more/live/the-best-ice-fishing-trips-in-the-united-states",
    "https://www.granddesignrv.com/adventure-more/live/the-best-rv-trips-to-take-during-spring-in-the-u-s-",
    "https://www.granddesignrv.com/adventure-more/live/top-10-safety-tips-for-rv-camping-with-dogs",
    "https://www.granddesignrv.com/adventure-more/live/top-5-fall-road-trips--the-best-scenic-routes-for-your-fall-rv-a",
    "https://www.granddesignrv.com/adventure-more/live/top-6-national-parks-for-rv-camping",
    "https://www.granddesignrv.com/adventure-more/live/top-rv-camping-activities-for-kids-and-families",
    "https://www.granddesignrv.com/adventure-more/live/what-to-consider-when-choosing-an-rv-campground",
    "https://www.granddesignrv.com/adventure-more/live/what-to-expect-from-using-solar-to-power-your-rv-",
    "https://www.granddesignrv.com/adventure-more/live/what-you-need-to-know-before-you-go-rving-with-your-cats",
    "https://www.granddesignrv.com/app",
    "https://www.granddesignrv.com/company/contact-us/ask-a-question",
    "https://www.granddesignrv.com/company/news",
    "https://www.granddesignrv.com/owners/Owner-Support-Thank-You",
    "https://www.granddesignrv.com/owners/dashboard",
    "https://www.granddesignrv.com/owners/event-calendar",
    "https://www.granddesignrv.com/owners/grand-design---national-rally",
    "https://www.granddesignrv.com/owners/mygdrv",
    "https://www.granddesignrv.com/owners/owner-FAQ",
    "https://www.granddesignrv.com/owners/owner-support-archive",
    "https://www.granddesignrv.com/owners/recalls",
    "https://www.granddesignrv.com/owners/recalls/canadian-certificate-2023-170",
    "https://www.granddesignrv.com/owners/recalls/canadian-certificate-2023-351",
    "https://www.granddesignrv.com/owners/recalls/recalls---14v-214",
    "https://www.granddesignrv.com/owners/recalls/recalls---14v-476",
    "https://www.granddesignrv.com/owners/recalls/recalls---15v-212",
    "https://www.granddesignrv.com/owners/recalls/recalls---15v-518",
    "https://www.granddesignrv.com/owners/recalls/recalls---15v-822",
    "https://www.granddesignrv.com/owners/recalls/recalls---16v-355",
    "https://www.granddesignrv.com/owners/recalls/recalls---16v-717",
    "https://www.granddesignrv.com/owners/recalls/recalls---16v-841",
    "https://www.granddesignrv.com/owners/recalls/recalls---17v-271",
    "https://www.granddesignrv.com/owners/recalls/recalls---17v-620",
    "https://www.granddesignrv.com/owners/recalls/recalls---17v-743",
    "https://www.granddesignrv.com/owners/recalls/recalls---17v-789",
    "https://www.granddesignrv.com/owners/recalls/recalls---18v-399",
    "https://www.granddesignrv.com/owners/recalls/recalls---18v-637",
    "https://www.granddesignrv.com/owners/recalls/recalls---18v-658",
    "https://www.granddesignrv.com/owners/recalls/recalls---18v-729",
    "https://www.granddesignrv.com/owners/recalls/recalls---18v-764",
    "https://www.granddesignrv.com/owners/recalls/recalls---18v-823",
    "https://www.granddesignrv.com/owners/recalls/recalls---20v-362",
    "https://www.granddesignrv.com/owners/recalls/recalls---20v-523",
    "https://www.granddesignrv.com/owners/recalls/recalls---21v-393",
    "https://www.granddesignrv.com/owners/recalls/recalls---21v-3930",
    "https://www.granddesignrv.com/owners/recalls/recalls---21v-636",
    "https://www.granddesignrv.com/owners/recalls/recalls---22v-038",
    "https://www.granddesignrv.com/owners/recalls/recalls---22v-039",
    "https://www.granddesignrv.com/owners/recalls/recalls---22v-203",
    "https://www.granddesignrv.com/owners/recalls/recalls---22v-442",
    "https://www.granddesignrv.com/owners/recalls/recalls---22v-603",
    "https://www.granddesignrv.com/owners/recalls/recalls---23v-151",
    "https://www.granddesignrv.com/owners/recalls/recalls---23v-364",
    "https://www.granddesignrv.com/owners/recalls/recalls---23v-428",
    "https://www.granddesignrv.com/owners/recalls/recalls---23v-455",
    "https://www.granddesignrv.com/owners/recalls/recalls---23v-586",
    "https://www.granddesignrv.com/owners/recalls/recalls---23v-788",
    "https://www.granddesignrv.com/owners/recalls/recalls---24v-378",
    "https://www.granddesignrv.com/owners/recalls/recalls---24v-522",
    "https://www.granddesignrv.com/owners/recalls/recalls---24v-861",
    "https://www.granddesignrv.com/owners/recalls/recalls---24v-863",
    "https://www.granddesignrv.com/owners/recalls/recalls---24v-916",
    "https://www.granddesignrv.com/owners/recalls/recalls---25v-119",
    "https://www.granddesignrv.com/owners/recalls/recalls---25v-473",
    "https://www.granddesignrv.com/owners/recalls/recalls--25v-061",
    "https://www.granddesignrv.com/owners/recalls/recalls--25v-281",
    "https://www.granddesignrv.com/owners/recalls/recalls--25v-784",
    "https://www.granddesignrv.com/owners/recalls/recalls--26v-042",
    "https://www.granddesignrv.com/owners/recalls/recalls--26v-044",
    "https://www.granddesignrv.com/owners/recalls/recalls--26v-174",
    "https://www.granddesignrv.com/owners/recalls/recalls--26v-276",
    "https://www.granddesignrv.com/owners/recalls/recalls--26v-277",
    "https://www.granddesignrv.com/owners/recalls/recalls--26v-354",
    "https://www.granddesignrv.com/owners/recalls/recalls--26v-446",
    "https://www.granddesignrv.com/owners/recalls/recalls--26v-490",
    "https://www.granddesignrv.com/owners/recalls/recalls--26v-491",
    "https://www.granddesignrv.com/owners/recalls/recalls--26v-492",
    "https://www.granddesignrv.com/owners/recalls/recalls--26v-595",
    "https://www.granddesignrv.com/owners/recalls/recalls-26v-057",
    "https://www.granddesignrv.com/owners/recalls/recalls-26v-058",
    "https://www.granddesignrv.com/owners/resources",
    "https://www.granddesignrv.com/owners/resources/how-to-videos",
    "https://www.granddesignrv.com/owners/resources/owners-manuals",
    "https://www.granddesignrv.com/shopping-tools/Why-Grand-Design-RV",
    "https://www.granddesignrv.com/shopping-tools/brochures/brochure-download",
    "https://www.granddesignrv.com/shopping-tools/factory-tours",
    "https://www.granddesignrv.com/shopping-tools/find-a-dealer",
    "https://www.granddesignrv.com/toy-haulers/momentum/410th"
  ],
  "description": "Page that opens with body text and continues with long-form copy, images and card or column groups; covers the homepage, articles, recall notices and owner pages",
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
    },
    {
      "name": "model-subnav",
      "instances": [
        ".sticky-nav .cmp-experiencefragment--secondary-navigation"
      ]
    },
    {
      "name": "hero",
      "instances": [
        ".container.responsivegrid.full-width:has(> section.dynamic-media-container > .dynamic-media-container__image picture):not(:has(.cmp-text, .cmp-button))"
      ]
    },
    {
      "name": "cards-callouts",
      "instances": [
        ".aem-Grid:has(> .container.responsivegrid.inner-block__center > .cmp-container[onclick*=\"location.href\"] .cmp-image)"
      ]
    },
    {
      "name": "columns-image-text",
      "instances": [
        ".outer-block > .cmp-container > .aem-Grid > .container.responsivegrid:has(> .cmp-container > .aem-Grid > .title h1):has(+ .container.responsivegrid > .cmp-container > .aem-Grid > .image:only-child)"
      ]
    },
    {
      "name": "table",
      "instances": [
        ".outer-block .cmp-text table"
      ]
    },
    {
      "name": "video-inline",
      "instances": [
        ".outer-block .inner-block__right .dynamicmedia:has([data-asset-type=\"videoavs\"])"
      ]
    },
    {
      "name": "cards",
      "instances": [
        ".gallerycontainer:has(.gallery-items a.teaser img)"
      ]
    },
    {
      "name": "quote-rating",
      "instances": [
        ".customerrating .q.grid-item"
      ]
    },
    {
      "name": "columns-image-text",
      "instances": [
        ".cmp-blog-posts > .featured-post"
      ]
    },
    {
      "name": "cards",
      "instances": [
        ".filter-items__items__list:has(> .card)"
      ]
    },
    {
      "name": "cards",
      "instances": [
        ".cmp-experiencefragment--brochure-download .aem-Grid > .title + .container.responsivegrid:has(.cmp-download)"
      ]
    },
    {
      "name": "columns",
      "instances": [
        ".findadealer + .outer-block .aem-Grid > .inner-block__left:has(+ .inner-block__center + .inner-block__right)"
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
    },
    {
      "id": "section-6",
      "name": "Secondary navigation (owners / shopping tools)",
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
      "id": "section-7",
      "name": "Teaser hero (full-width photo, optional title)",
      "selector": [
        ".container.responsivegrid.full-width:has(> section.dynamic-media-container > .dynamic-media-container__image picture):not(:has(.cmp-text, .cmp-button))"
      ],
      "style": null,
      "blocks": [
        "hero"
      ],
      "defaultContent": []
    },
    {
      "id": "section-8",
      "name": "Owner resource links (icon tiles)",
      "selector": [
        ".aem-Grid:has(> .container.responsivegrid.inner-block__center > .cmp-container[onclick*=\"location.href\"] .cmp-image)"
      ],
      "style": null,
      "blocks": [
        "cards-callouts"
      ],
      "defaultContent": []
    },
    {
      "id": "section-9",
      "name": "Article body (title, copy, intro columns, rally table, video, CTAs, form link)",
      "selector": [
        ".outer-block"
      ],
      "style": null,
      "blocks": [
        "columns-image-text",
        "table",
        "video-inline"
      ],
      "defaultContent": [
        ".outer-block .title",
        ".outer-block .text",
        ".outer-block .button",
        ".outer-block .embed",
        ".outer-block + .container.responsivegrid .button"
      ]
    },
    {
      "id": "section-10",
      "name": "Photo gallery",
      "selector": [
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .gallerycontainer)"
      ],
      "style": null,
      "blocks": [
        "cards"
      ],
      "defaultContent": [
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .gallerycontainer) > .cmp-container > .aem-Grid > .title"
      ]
    },
    {
      "id": "section-11",
      "name": "Customer comments",
      "selector": [
        ".customerrating"
      ],
      "style": null,
      "blocks": [
        "quote-rating"
      ],
      "defaultContent": [
        ".customerrating .reviewsheader h2"
      ]
    },
    {
      "id": "section-12",
      "name": "Blog intro (Adventure More welcome)",
      "selector": [
        ".aem-Grid > .container.responsivegrid:has(> .cmp-container > .aem-Grid > .title.heading-scale-feature):has(.blogposts)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".title.heading-scale-feature",
        ".title.heading-scale-feature + .text"
      ]
    },
    {
      "id": "section-13",
      "name": "Blog category: Live (featured post, filters, latest posts)",
      "selector": [
        ".aem-Grid > .title.cmp-title--blog:has(+ .container.responsivegrid .blogposts [data-prop-blog-path$=\"/adventure-more/live\"])"
      ],
      "style": null,
      "blocks": [
        "columns-image-text",
        "cards"
      ],
      "defaultContent": [
        ".title.cmp-title--blog",
        ".filter-items__title",
        ".filter-items__filters__list"
      ]
    },
    {
      "id": "section-14",
      "name": "Blog category: Learn",
      "selector": [
        ".aem-Grid > .container.responsivegrid:has(> .cmp-container > .aem-Grid > .blogposts [data-prop-blog-path$=\"/adventure-more/learn\"])"
      ],
      "style": null,
      "blocks": [
        "columns-image-text",
        "cards"
      ],
      "defaultContent": [
        ".title.cmp-title--blog",
        ".filter-items__title",
        ".filter-items__filters__list"
      ]
    },
    {
      "id": "section-15",
      "name": "Blog category: Community",
      "selector": [
        ".aem-Grid > .container.responsivegrid:has(> .cmp-container > .aem-Grid > .blogposts [data-prop-blog-path$=\"/adventure-more/community\"])"
      ],
      "style": null,
      "blocks": [
        "columns-image-text",
        "cards"
      ],
      "defaultContent": [
        ".title.cmp-title--blog",
        ".filter-items__title",
        ".filter-items__filters__list"
      ]
    },
    {
      "id": "section-16",
      "name": "Blog category: Buy",
      "selector": [
        ".aem-Grid > .container.responsivegrid:has(> .cmp-container > .aem-Grid > .blogposts [data-prop-blog-path$=\"/adventure-more/buy\"])"
      ],
      "style": null,
      "blocks": [
        "columns-image-text",
        "cards"
      ],
      "defaultContent": [
        ".title.cmp-title--blog",
        ".filter-items__title"
      ]
    },
    {
      "id": "section-17",
      "name": "Media contact form (News sidebar)",
      "selector": [
        ".container.responsivegrid:has(> .cmp-container > .aem-Grid > .gdrv-form)"
      ],
      "style": "light-grey",
      "blocks": [],
      "defaultContent": [
        ".cmp-title",
        ".cmp-text",
        ".gdrv-form"
      ]
    },
    {
      "id": "section-18",
      "name": "Dealer benefits (Service / Relationship / Local Laws)",
      "selector": [
        ".findadealer + .container.responsivegrid.outer-block"
      ],
      "style": null,
      "blocks": [
        "columns"
      ],
      "defaultContent": [
        ".outer-block > .cmp-container > .aem-Grid > .text"
      ]
    },
    {
      "id": "section-19",
      "name": "Brochure group: Towable",
      "selector": [
        ".cmp-experiencefragment--brochure-download .aem-Grid > .title:has(+ .container.responsivegrid .cmp-download)"
      ],
      "style": null,
      "blocks": [
        "cards"
      ],
      "defaultContent": [
        ".title.heading-scale-secondary"
      ]
    },
    {
      "id": "section-20",
      "name": "Brochure group: Motorized",
      "selector": [
        ".cmp-experiencefragment--brochure-download .aem-Grid > .title:has(+ .container.responsivegrid .cmp-download) ~ .title:has(+ .container.responsivegrid .cmp-download)"
      ],
      "style": null,
      "blocks": [
        "cards"
      ],
      "defaultContent": [
        ".title.heading-scale-secondary"
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
  'model-subnav': modelSubnavParser,
  'hero': heroParser,
  'columns-image-text': columnsImageTextParser,
  'table': tableParser,
  'video-inline': videoInlineParser,
  'cards': cardsParser,
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
