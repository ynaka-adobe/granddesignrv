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

  // tools/importer/import-travel-trailers.js
  var import_travel_trailers_exports = {};
  __export(import_travel_trailers_exports, {
    default: () => import_travel_trailers_default
  });

  // tools/importer/parsers/columns-image-text.js
  function hasText(el) {
    return !!(el && el.textContent.replace(/ /g, " ").trim());
  }
  function cleanText(el) {
    return el.textContent.replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function relativize(href) {
    if (!href) return href;
    const m = href.match(/^https?:\/\/(?:www\.)?granddesignrv\.com(\/[^#]*)?(#.*)?$/i);
    if (!m) return href;
    return `${m[1] || "/"}${m[2] || ""}`;
  }
  function parse(element, { document }) {
    const next = element.nextElementSibling;
    const right = next && next.classList.contains("inner-block__right") ? next : null;
    let imgCell = "";
    const srcImg = element.querySelector("img.cmp-image__image") || element.querySelector("img");
    if (srcImg) {
      const src = srcImg.getAttribute("src") || srcImg.getAttribute("data-src") || "";
      if (src) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = (srcImg.getAttribute("alt") || srcImg.getAttribute("title") || "").trim();
        imgCell = img;
      }
    }
    const content = [];
    if (right) {
      const h1 = right.querySelector("h1");
      if (h1 && hasText(h1)) {
        const nh = document.createElement("h1");
        nh.textContent = cleanText(h1);
        content.push(nh);
      }
      const h2 = right.querySelector("h2");
      if (h2 && hasText(h2)) {
        const nh = document.createElement("h2");
        nh.textContent = cleanText(h2);
        content.push(nh);
      }
      right.querySelectorAll(".cmp-text p").forEach((p) => {
        if (!hasText(p)) return;
        const np = document.createElement("p");
        np.innerHTML = p.innerHTML.trim();
        np.querySelectorAll("a[href]").forEach((a) => {
          a.setAttribute("href", relativize(a.getAttribute("href")));
        });
        content.push(np);
      });
    }
    const cells = [[imgCell, content.length ? content : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-image-text", cells });
    const grid = element.parentElement;
    if (grid) {
      Array.from(grid.children).forEach((child) => {
        if (child.classList.contains("separator") && (child.classList.contains("cmp-separator--hidden") || child.querySelector(".cmp-separator--hidden"))) {
          child.remove();
        }
      });
    }
    if (right) right.remove();
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-model-list.js
  var SELECTOR = ".outer-block.margin-top-medium .aem-Grid > .experiencefragment:has(.dynamicmedia)";
  var CONSUMED_ATTR = "data-cards-model-list-consumed";
  var SCENE7_BASE = "https://gdrv.scene7.com/is/image/";
  function hasText2(el) {
    return !!(el && el.textContent.replace(/ /g, " ").trim());
  }
  function cleanText2(el) {
    return el.textContent.replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function relativize2(href) {
    if (!href) return href;
    const m = href.match(/^https?:\/\/(?:www\.)?granddesignrv\.com(\/[^#]*)?(#.*)?$/i);
    if (!m) return href;
    return `${m[1] || "/"}${m[2] || ""}`;
  }
  function inModal(el) {
    return !!el.closest("form, .cmp-button__modal, .cmp-form");
  }
  function titleCase(slug) {
    return slug.split("-").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  function getModelName(entry) {
    const explore = Array.from(entry.querySelectorAll("a.cmp-button[href]")).find((a) => !inModal(a) && /^(?:https?:\/\/[^/]+)?\/travel-trailers\//i.test(a.getAttribute("href")));
    if (!explore) return "";
    const aria = explore.getAttribute("aria-label") || "";
    const m = aria.match(/Explore the (.+?) Travel Trailers?/i);
    if (m) return m[1].trim();
    const path = relativize2(explore.getAttribute("href")).split(/[?#]/)[0];
    return titleCase(path.replace(/\/+$/, "").split("/").pop() || "");
  }
  function buildRow(document, entry) {
    const model = getModelName(entry);
    let productCell = "";
    const dm = entry.querySelector(".dynamicmedia[data-asset-path], .dynamicmedia [data-asset-path]");
    const assetPath = dm ? (dm.getAttribute("data-asset-path") || "").trim() : "";
    if (assetPath) {
      const server = (dm.getAttribute("data-imageserver") || "").trim();
      const base = /^https:\/\/[^/]*scene7\.com\/is\/image\/$/i.test(server) ? server : SCENE7_BASE;
      const img = document.createElement("img");
      img.src = `${base}${assetPath.replace(/^\/+/, "")}`;
      img.alt = model ? `${model} travel trailer` : "";
      productCell = img;
    }
    const content = [];
    const logoSrc = Array.from(entry.querySelectorAll(".image img.cmp-image__image")).find((img) => !img.closest(".dynamicmedia"));
    if (logoSrc) {
      const src = logoSrc.getAttribute("src") || logoSrc.getAttribute("data-src") || "";
      if (src) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = model ? `${model} logo` : (logoSrc.getAttribute("alt") || "").trim();
        const p = document.createElement("p");
        p.append(img);
        content.push(p);
      }
    }
    entry.querySelectorAll(".title.gdrv-title.red").forEach((labelWrap) => {
      const label = labelWrap.querySelector("h2");
      if (!label || !hasText2(label)) return;
      let valueWrap = labelWrap.nextElementSibling;
      while (valueWrap && !valueWrap.classList.contains("title")) valueWrap = valueWrap.nextElementSibling;
      const value = valueWrap && valueWrap.querySelector("h3");
      const p = document.createElement("p");
      p.append(document.createTextNode(cleanText2(label)));
      if (value && hasText2(value)) {
        p.append(document.createTextNode(" "));
        const strong = document.createElement("strong");
        strong.textContent = cleanText2(value);
        p.append(strong);
      }
      content.push(p);
    });
    const headline = entry.querySelector(".title-font-aktiv-grotesk-bold h2");
    if (headline && hasText2(headline)) {
      const h2 = document.createElement("h2");
      h2.textContent = cleanText2(headline);
      content.push(h2);
    }
    entry.querySelectorAll(".text .cmp-text p").forEach((p) => {
      if (inModal(p) || !hasText2(p)) return;
      const np = document.createElement("p");
      np.innerHTML = p.innerHTML.trim();
      np.querySelectorAll("a[href]").forEach((a) => {
        a.setAttribute("href", relativize2(a.getAttribute("href")));
      });
      content.push(np);
    });
    entry.querySelectorAll(".button a.cmp-button[href]").forEach((link) => {
      if (inModal(link) || !hasText2(link)) return;
      const a = document.createElement("a");
      a.href = relativize2(link.getAttribute("href"));
      a.textContent = cleanText2(link);
      const p = document.createElement("p");
      p.append(a);
      content.push(p);
    });
    if (!productCell && !content.length) return null;
    return [productCell, content.length ? content : ""];
  }
  function removeEntry(entry, outer) {
    const wrapper = entry.parentElement && entry.parentElement.closest(".container.responsivegrid");
    if (wrapper && wrapper !== outer && outer && outer.contains(wrapper) && !wrapper.classList.contains("outer-block") && cleanText2(wrapper) === cleanText2(entry) && wrapper.querySelectorAll("img").length === entry.querySelectorAll("img").length) {
      wrapper.remove();
    }
    entry.remove();
  }
  function parse2(element, { document }) {
    if (!element.isConnected) return;
    const doc = element.ownerDocument || document;
    const marker = doc.body || doc.documentElement;
    if (marker.hasAttribute(CONSUMED_ATTR)) return;
    marker.setAttribute(CONSUMED_ATTR, "true");
    let entries = Array.from(doc.querySelectorAll(SELECTOR)).filter((e) => e.isConnected);
    if (!entries.includes(element)) entries.push(element);
    entries = entries.filter((e) => !entries.some((o) => o !== e && o.contains(e)));
    entries.sort((a, b) => {
      if (a === b) return 0;
      return a.compareDocumentPosition(b) & 4 ? -1 : 1;
    });
    const cells = [];
    entries.forEach((entry) => {
      const row = buildRow(document, entry);
      if (row) cells.push(row);
    });
    const outer = entries[0].closest(".outer-block.margin-top-medium");
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-model-list", cells });
    if (outer) outer.querySelectorAll(".separator").forEach((sep) => sep.remove());
    const [first, ...rest] = entries;
    rest.forEach((entry) => removeEntry(entry, outer));
    first.replaceWith(block);
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

  // tools/importer/import-travel-trailers.js
  var PAGE_TEMPLATE = {
    "name": "travel-trailers",
    "urls": [
      "https://www.granddesignrv.com/travel-trailers"
    ],
    "representativeUrl": "https://www.granddesignrv.com/travel-trailers",
    "description": "Vehicle category landing page: intro (photo + H1 + copy) followed by a stacked model lineup (logo, spin image, stats, headline, copy, CTAs).",
    "blocks": [
      {
        "name": "columns-image-text",
        "instances": [
          ".outer-block.margin-top-medium .inner-block__left:has(+ .inner-block__right h1)"
        ]
      },
      {
        "name": "cards-model-list",
        "instances": [
          ".outer-block.margin-top-medium .aem-Grid > .experiencefragment:has(.dynamicmedia)"
        ]
      }
    ],
    "urlPattern": "/travel-trailers",
    "sections": [
      {
        "id": "section-1",
        "name": "Travel trailers intro and model lineup",
        "selector": [
          ".outer-block.margin-top-medium"
        ],
        "style": null,
        "blocks": [
          "columns-image-text",
          "cards-model-list"
        ],
        "defaultContent": []
      }
    ]
  };
  var parsers = {
    "columns-image-text": parse,
    "cards-model-list": parse2
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
  var import_travel_trailers_default = {
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
  return __toCommonJS(import_travel_trailers_exports);
})();
