/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-shop-and-compare.js
  var import_shop_and_compare_exports = {};
  __export(import_shop_and_compare_exports, {
    default: () => import_shop_and_compare_default
  });

  // tools/importer/parsers/shop-compare.js
  var DATA_PATH = "/data/floorplans.json";
  var DEFAULT_FOOTNOTE = "*Bathroom Access with slides in";
  function clean(text) {
    return (text || "").replace(/[\u00a0\u200b]/g, (c) => c === "\u200B" ? "" : " ").replace(/\s+/g, " ").trim();
  }
  function richText(source, document) {
    const out = document.createElement("div");
    const copy = (from, to) => {
      from.childNodes.forEach((node) => {
        if (node.nodeType === 3) {
          to.append(document.createTextNode(node.textContent.replace(/\u00a0/g, " ").replace(/\u200b/g, "")));
          return;
        }
        if (node.nodeType !== 1) return;
        const tag = node.tagName.toLowerCase();
        const keep = { p: "p", ul: "ul", ol: "ol", li: "li", b: "strong", strong: "strong", i: "em", em: "em", a: "a" }[tag];
        if (!keep) {
          copy(node, to);
          return;
        }
        const el = document.createElement(keep);
        if (keep === "a" && node.getAttribute("href")) el.setAttribute("href", node.getAttribute("href"));
        copy(node, el);
        if (clean(el.textContent)) to.append(el);
      });
    };
    copy(source, out);
    if (!out.querySelector("p, ul, ol") && clean(out.textContent)) {
      const p = document.createElement("p");
      p.append(...out.childNodes);
      out.append(p);
    }
    return [...out.childNodes].filter((n) => n.nodeType === 1 || clean(n.textContent));
  }
  function ownText(el) {
    return clean([...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" "));
  }
  var consumed = /* @__PURE__ */ new WeakSet();
  function parse(element, { document }) {
    if (consumed.has(element) || !element.isConnected) return;
    consumed.add(element);
    const rows = [];
    const link = document.createElement("a");
    link.href = DATA_PATH;
    link.textContent = DATA_PATH;
    rows.push(["Data", link]);
    const groups = [...element.querySelectorAll(".filters details")];
    const categoryGroup = groups.find((d) => /category/i.test(ownText(d.querySelector("summary h3") || d)));
    if (categoryGroup) {
      const names = [...categoryGroup.querySelectorAll("label")].map((l) => clean(l.textContent)).filter(Boolean);
      if (names.length) rows.push(["Category Order", names.join(", ")]);
    }
    groups.forEach((d) => {
      const heading = d.querySelector("summary h3");
      const tip = heading && heading.querySelector(".tooltip-text");
      const key = heading && ownText(heading);
      if (!key || !tip || !clean(tip.textContent)) return;
      rows.push([key, richText(tip, document)]);
    });
    const note = element.querySelector(".info");
    if (note && clean(note.textContent)) rows.push(["Dealer Stock Note", richText(note, document)]);
    const dialogText = clean((element.querySelector("dialog") || {}).textContent);
    const match = dialogText.match(/\*Bathroom Access[^|]*?slides in/i);
    const footnote = document.createElement("p");
    footnote.textContent = match ? clean(match[0]) : DEFAULT_FOOTNOTE;
    rows.push(["Footnote", footnote]);
    const block = WebImporter.Blocks.createBlock(document, { name: "shop-compare", cells: rows });
    element.replaceWith(block);
  }

  // tools/importer/transformers/granddesignrv-cleanup.js
  var TRACKING_SRC = /(googlesyndication\.com|doubleclick\.net|analytics\.twitter\.com|\/\/t\.co\/|clarity\.ms|demdex\.net|bat\.bing\.com|facebook\.com\/tr|google\.com\/recaptcha|gstatic\.com\/recaptcha)/i;
  function safeQueryAll(root, selector) {
    try {
      return Array.from(root.querySelectorAll(selector));
    } catch (e) {
      return [];
    }
  }
  function removeAll(root, selectors) {
    selectors.forEach((selector) => {
      safeQueryAll(root, selector).forEach((el) => {
        if (el.matches(".cmp-homepageslider") || el.querySelector(".cmp-homepageslider")) return;
        el.remove();
      });
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      safeQueryAll(element, ".cmp-experiencefragment--header").forEach((xf) => {
        const wrapper = xf.closest(".experiencefragment") || xf;
        wrapper.remove();
      });
      safeQueryAll(element, ".button button.cmp-button.glightbox").forEach((btn) => {
        const label = btn.textContent.replace(/\s+/g, " ").trim();
        if (!/brochure/i.test(`${label} ${btn.getAttribute("aria-label") || ""}`)) return;
        const link = element.ownerDocument.createElement("a");
        link.className = "cmp-button";
        link.setAttribute("href", "/shopping-tools/brochures/brochure-download");
        link.textContent = label;
        btn.replaceWith(link);
      });
      removeAll(element, [
        // Header / footer chrome
        "header.headergv",
        ".topNav",
        "footer.experiencefragment",
        ".cmp-experiencefragment--footer",
        // Cookie + GPC consent banners
        ".cookie-banner",
        "#cookie-banner",
        "#gpc-acknowledgement",
        // "Ask an Expert" floating form / modal (lightbox content)
        ".cmp-button__modal",
        ".askexpert",
        ".cmp-askexpert",
        "button.glightbox",
        // Adobe Target cloud service + reCAPTCHA badge
        "div.cloudservice.testandtarget",
        ".grecaptcha-badge",
        // Mobile-only duplicate copies (desktop copies carry --phone--hide)
        ".aem-GridColumn--default--hide",
        // Carousel controls (Previous/Next/Pause/Play + indicator lists)
        ".cmp-carousel .cmp-carousel__actions",
        ".cmp-carousel .cmp-carousel__indicators",
        ".cmp-carousel button.cmp-carousel__action"
      ]);
      safeQueryAll(element, "#homepage-boxes #home-feature-carousel").forEach((carousel) => {
        const wrapper = carousel.closest(".carousel.panelcontainer") || carousel;
        wrapper.remove();
      });
      safeQueryAll(element, "img, iframe").forEach((el) => {
        const src = el.getAttribute("src") || "";
        const title = el.getAttribute("title") || "";
        if (TRACKING_SRC.test(src) || /reCAPTCHA|Adobe ID Syncing/i.test(title)) {
          el.remove();
        }
      });
      safeQueryAll(element, "iframe:not([src])").forEach((el) => el.remove());
      removeAll(element, ["script", "style", "noscript", "link", "meta"]);
      safeQueryAll(element, "[data-cmp-src]").forEach((wrapper) => {
        const img = wrapper.querySelector("img");
        if (!img) return;
        const src = img.getAttribute("src") || "";
        if (src && !/^(blob|data):/i.test(src)) return;
        const widths = (wrapper.getAttribute("data-cmp-widths") || "").split(",").map(Number).filter(Boolean);
        const width = widths.length ? Math.max(...widths) : 1600;
        const real = wrapper.getAttribute("data-cmp-src").replace(/%7B\.width%7D|\{\.width\}/gi, String(width));
        img.setAttribute("src", real);
        img.removeAttribute("srcset");
      });
      safeQueryAll(element, "a.cmp-image__link").forEach((a) => {
        const href = (a.getAttribute("href") || "").trim();
        if (href && href !== "#") return;
        a.replaceWith(...a.childNodes);
      });
    }
    if (hookName === "afterTransform") {
      removeAll(element, [
        "header.headergv",
        "footer.experiencefragment",
        ".cookie-banner",
        "div.cloudservice.testandtarget",
        ".grecaptcha-badge",
        "iframe",
        "script",
        "style",
        "noscript",
        "link"
      ]);
      safeQueryAll(element, "*").forEach((el) => {
        Array.from(el.attributes).forEach((attr) => {
          const name = attr.name.toLowerCase();
          if (name.startsWith("data-cmp-") || name.startsWith("data-track") || name.startsWith("data-analytics") || name === "rollick-pagetype" || name.startsWith("on")) {
            el.removeAttribute(attr.name);
          }
        });
      });
    }
  }

  // tools/importer/transformers/granddesignrv-dm-images.js
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function detectDynamicMediaUrl(urlStr) {
    if (!/^(https?:\/\/|\/\/)/i.test(urlStr || "")) return false;
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) return "scene7";
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  function isSoleMeaningfulChild(anchor, img) {
    const clone = anchor.cloneNode(true);
    clone.querySelectorAll("img, picture, source").forEach((n) => n.remove());
    if (clone.textContent.trim() !== "") return false;
    const imgs = anchor.querySelectorAll("img");
    return imgs.length === 1 && imgs[0] === img;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    Array.from(element.querySelectorAll("img")).forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = (img.getAttribute("alt") || "").trim() || EMPTY_ALT_SENTINEL;
      const anchor = img.closest("a");
      if (anchor) {
        if (!isSoleMeaningfulChild(anchor, img)) {
          console.warn(`[dm-images] skipping mixed-content anchor for ${src}`);
          return;
        }
        anchor.setAttribute("title", src);
        anchor.textContent = alt;
        return;
      }
      const link = doc.createElement("a");
      link.setAttribute("href", src);
      link.textContent = alt;
      const picture = img.parentElement && img.parentElement.tagName === "PICTURE" ? img.parentElement : null;
      (picture || img).replaceWith(link);
    });
  }

  // tools/importer/transformers/granddesignrv-sections.js
  var MARKER_ATTR = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (let i = 0; i < selectors.length; i += 1) {
      const sel = selectors[i];
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform3(hookName, element, payload) {
    const template = payload && payload.template;
    const sections = template && template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section);
        if (!el || !el.parentNode) continue;
        if (i > 0 || section.style) {
          const hr = doc.createElement("hr");
          if (section.style) hr.setAttribute(MARKER_ATTR, section.id);
          el.parentNode.insertBefore(hr, el);
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || findSectionElement(element, section);
        if (!anchor || !anchor.parentNode) continue;
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.parentNode.insertBefore(metadata, anchor.nextSibling);
        if (marker) {
          if (i === 0) {
            marker.remove();
          } else {
            marker.removeAttribute(MARKER_ATTR);
          }
        }
      }
      element.querySelectorAll(`[${MARKER_ATTR}]`).forEach((el) => el.removeAttribute(MARKER_ATTR));
    }
  }

  // tools/importer/import-shop-and-compare.js
  var PAGE_TEMPLATE = {
    "name": "shop-and-compare",
    "urls": [
      "https://www.granddesignrv.com/shop-and-compare"
    ],
    "representativeUrl": "https://www.granddesignrv.com/shop-and-compare",
    "description": "Shop and Compare: intro heading + subtitle and the interactive floor plan finder (shop-compare block, reads the floor plan data sheet).",
    "blocks": [
      {
        "name": "shop-compare",
        "instances": [
          ".brandFilter"
        ]
      }
    ],
    "urlPattern": "/shop-and-compare",
    "sections": [
      {
        "id": "section-1",
        "name": "Shop and Compare intro and floor plan finder",
        "selector": [
          ".root > .cmp-container > .container.responsivegrid:has(.brandFilter)"
        ],
        "style": null,
        "blocks": [
          "shop-compare"
        ],
        "defaultContent": [
          ".title.gdrv-title.red.aem-GridColumn--phone--hide h1",
          ".title.heading-scale-secondary.aem-GridColumn--phone--hide h2"
        ]
      }
    ]
  };
  var parsers = {
    "shop-compare": parse
  };
  var sectionTransformers = [transform3];
  var fragmentTransformers = [];
  var lateTransformers = [...sectionTransformers, ...fragmentTransformers];
  var transformers = [transform, transform2, ...lateTransformers];
  var earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
  var CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));
  function executeTransformers(hookName, element, payload, list = transformers) {
    var _a, _b;
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: ((_b = (_a = payload.params) == null ? void 0 : _a.targets) == null ? void 0 : _b.template) || PAGE_TEMPLATE });
    list.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template, url) {
    const pageBlocks = [];
    const pageKey = (u) => {
      try {
        const { origin, pathname } = new URL(u);
        return `${origin}${pathname.replace(/\/$/, "")}`;
      } catch (e) {
        return u;
      }
    };
    const key = pageKey(url);
    const claim = (blockDef, selector) => {
      let matches = [];
      try {
        matches = document.querySelectorAll(selector);
      } catch (e) {
        return;
      }
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
  function markPageTargets(payload) {
    const { document, params } = payload;
    executeTransformers("beforeTransform", document.body, payload, earlyTransformers);
    const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
      element.setAttribute("data-excat-block", String(i));
      return { name, selector };
    });
    const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
      const target = (section.selector || []).map((s) => {
        try {
          return document.querySelector(s);
        } catch (e) {
          return null;
        }
      }).find(Boolean);
      if (!target) return section;
      target.setAttribute("data-excat-section", String(i));
      return __spreadProps(__spreadValues({}, section), { selector: [`[data-excat-section="${i}"]`] });
    });
    params.targets = { blocks, template: __spreadProps(__spreadValues({}, PAGE_TEMPLATE), { sections }) };
  }
  var import_shop_and_compare_default = {
    preprocess: (payload) => {
      if (CATALOG) markPageTargets(payload);
    },
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      params.fragments = [];
      if (!params.targets) markPageTargets(payload);
      const pageBlocks = params.targets.blocks.map((block, i) => __spreadProps(__spreadValues({}, block), { element: document.querySelector(`[data-excat-block="${i}"]`) })).filter((block) => block.element);
      executeTransformers("beforeTransform", main, __spreadProps(__spreadValues({}, payload), { pageBlocks }), lateTransformers);
      pageBlocks.forEach((block) => {
        if (!main.contains(block.element)) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      params.fragments.forEach(({ element }) => {
        executeTransformers("afterTransform", element, payload, earlyTransformers);
        WebImporter.rules.transformBackgroundImages(element, document);
        WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }, ...params.fragments];
    }
  };
  return __toCommonJS(import_shop_and_compare_exports);
})();
