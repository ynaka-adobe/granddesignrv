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

  // tools/importer/import-card-grid-landing.js
  var import_card_grid_landing_exports = {};
  __export(import_card_grid_landing_exports, {
    default: () => import_card_grid_landing_default
  });

  // tools/importer/parsers/model-subnav.js
  var ORIGIN_RE = /^https?:\/\/(?:www\.)?granddesignrv\.com/i;
  function clean(text) {
    return (text || "").replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
  }
  function relativize(href) {
    if (!href) return "";
    const h = href.trim();
    if (!ORIGIN_RE.test(h)) return h;
    if (/^https?:\/\/[^/]+\/content\/dam\//i.test(h)) return h;
    const path = h.replace(ORIGIN_RE, "").replace(/^\/content\/granddesignrv\/us\/en/, "").replace(/\.html(?=$|[?#])/, "");
    return path || "/";
  }
  function absolute(href) {
    if (!href) return "";
    if (/^(https?:)?\/\//i.test(href)) return href;
    return `https://www.granddesignrv.com${href.startsWith("/") ? "" : "/"}${href}`;
  }
  function imgSrc(img) {
    const src = img.getAttribute("src") || "";
    if (src && !/^(data|blob):/i.test(src)) return src;
    return img.getAttribute("data-src") || "";
  }
  function brochureLink(element, document) {
    const link = [...element.querySelectorAll("a[href]")].find((a2) => /\.pdf|brochure/i.test(a2.getAttribute("href") || "") && /brochure/i.test(a2.textContent));
    const meta = document.querySelector('meta[name="cludo:BrochureLink"]');
    const href = link ? link.getAttribute("href") : meta && meta.getAttribute("content");
    if (!href) return null;
    const labelEl = element.querySelector(".request-brochure .cmp-button__text");
    const a = document.createElement("a");
    a.href = /\/content\/dam\//i.test(href) ? absolute(href) : relativize(href);
    a.textContent = clean(link ? link.textContent : labelEl && labelEl.textContent) || "Download Brochure";
    return a;
  }
  function floorplanItem(card, document) {
    const li = document.createElement("li");
    const parts = [];
    const name = clean((card.querySelector(".option-card__spec__name") || {}).textContent) || clean(card.getAttribute("title")).toUpperCase();
    const thumb = card.querySelector(".option-card__thumbnail img, img");
    if (thumb && imgSrc(thumb)) {
      const img = document.createElement("img");
      img.src = imgSrc(thumb);
      img.alt = name ? `${name} floorplan` : "";
      parts.push(img);
    }
    const href = card.getAttribute("href") || (card.querySelector("a[href]") || { getAttribute: () => "" }).getAttribute("href");
    if (name) {
      if (href) {
        const a = document.createElement("a");
        a.href = relativize(href);
        a.textContent = name;
        parts.push(a);
      } else {
        parts.push(document.createTextNode(name));
      }
    }
    card.querySelectorAll(".option-card__spec__item").forEach((item) => {
      const title = clean((item.querySelector(".option-card__spec__title") || {}).textContent);
      const value = clean((item.querySelector(".option-card__spec__value:not(.option-card__spec__name)") || {}).textContent);
      if (!title || !value) return;
      parts.push(document.createTextNode(`${title}: ${value}`));
    });
    const gridItem = card.closest(".grid__item");
    if (card.querySelector(".dealer-stock-text") || gridItem && gridItem.classList.contains("dealer-stock")) {
      parts.push(document.createTextNode("Dealer stock only"));
    }
    parts.forEach((part, i) => {
      if (i) li.append(document.createElement("br"));
      li.append(part);
    });
    return parts.length ? li : null;
  }
  var SECONDARY_NAV = ".cmp-experiencefragment--secondary-navigation";
  function parseSecondaryNav(element, nav, document) {
    const cells = [];
    const isAuthored = (el) => !el.closest(".cmp-button__modal, .button, .glightbox");
    const titleEl = [...nav.querySelectorAll(".cmp-title__text, h1, h2, h3")].find(isAuthored);
    cells.push([clean(titleEl && titleEl.textContent), ""]);
    const links = document.createElement("ul");
    nav.querySelectorAll(".cmp-list a[href]").forEach((link) => {
      if (!isAuthored(link)) return;
      const label = clean(link.textContent) || clean(link.getAttribute("title"));
      if (!label || /ask an expert/i.test(label)) return;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = relativize(link.getAttribute("href"));
      a.textContent = label;
      li.append(a);
      links.append(li);
    });
    if (links.children.length) cells.push(["Links", links]);
    const block = WebImporter.Blocks.createBlock(document, { name: "model-subnav", cells });
    element.replaceWith(block);
  }
  function parse(element, { document }) {
    const secondaryNav = element.closest(SECONDARY_NAV) || element.querySelector(SECONDARY_NAV);
    if (secondaryNav) {
      parseSecondaryNav(element, secondaryNav, document);
      return;
    }
    const cells = [];
    const nameEl = element.querySelector(".subnav-left__item__title, .subnav-left__items__brand");
    const modelName = clean(nameEl && nameEl.textContent) || clean((document.title || "").split("|").pop());
    const brochure = brochureLink(element, document);
    cells.push([modelName, brochure || ""]);
    const cards = [...element.querySelectorAll(".option-card--floorplan")];
    const list = document.createElement("ul");
    cards.forEach((card) => {
      const li = floorplanItem(card, document);
      if (li) list.append(li);
    });
    if (list.children.length) cells.push(["Floorplans", list]);
    const links = document.createElement("ul");
    element.querySelectorAll('.subnav-left a[href^="#"]').forEach((link) => {
      const label = clean(link.textContent) || clean(link.getAttribute("title"));
      if (!label || /ask an expert/i.test(label)) return;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = link.getAttribute("href");
      a.textContent = label;
      li.append(a);
      links.append(li);
    });
    if (links.children.length) cells.push(["Links", links]);
    const block = WebImporter.Blocks.createBlock(document, { name: "model-subnav", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-image-text.js
  function hasText(el) {
    return !!(el && el.textContent.replace(/ /g, " ").trim());
  }
  function cleanText(el) {
    return el.textContent.replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function relativize2(href) {
    if (!href) return href;
    const m = href.match(/^https?:\/\/(?:www\.)?granddesignrv\.com(\/[^#]*)?(#.*)?$/i);
    if (!m) return href;
    return `${m[1] || "/"}${m[2] || ""}`;
  }
  function imageFrom(container, document) {
    const srcImg = container.querySelector("img.cmp-image__image") || container.querySelector("img");
    if (!srcImg) return "";
    const src = srcImg.getAttribute("src") || srcImg.getAttribute("data-src") || "";
    if (!src) return "";
    const img = document.createElement("img");
    img.src = src;
    img.alt = (srcImg.getAttribute("alt") || srcImg.getAttribute("title") || "").trim();
    return img;
  }
  function removeHiddenSeparators(grid) {
    if (!grid) return;
    Array.from(grid.children).forEach((child) => {
      if (child.classList.contains("separator") && (child.classList.contains("cmp-separator--hidden") || child.querySelector(".cmp-separator--hidden"))) {
        child.remove();
      }
    });
  }
  function parseTextFirst(element, right, document) {
    const content = [];
    element.querySelectorAll(".cmp-title h1, .cmp-title h2, .cmp-title h3, .cmp-title h4, .cmp-text p, .cmp-text h2, .cmp-text h3, .cmp-text h4, .button a.cmp-button[href]").forEach((el) => {
      if (!hasText(el)) return;
      if (el.closest(".cmp-title")) {
        const isH1 = el.tagName === "H1";
        if (!isH1 && !content.some((n) => n.tagName === "H1")) return;
        const nh = document.createElement(isH1 ? "h1" : "h2");
        nh.textContent = cleanText(el);
        content.push(nh);
      } else if (el.tagName === "A") {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        const a = document.createElement("a");
        a.setAttribute("href", relativize2(el.getAttribute("href")));
        a.textContent = cleanText(el);
        strong.append(a);
        p.append(strong);
        content.push(p);
      } else {
        const isHeading = /^H\d$/.test(el.tagName);
        const np = document.createElement(isHeading ? "h3" : "p");
        np.innerHTML = el.innerHTML.trim();
        np.querySelectorAll("a[href]").forEach((a) => {
          a.setAttribute("href", relativize2(a.getAttribute("href")));
        });
        content.push(np);
      }
    });
    const cells = [[content.length ? content : "", imageFrom(right, document)]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-image-text", cells });
    removeHiddenSeparators(element.parentElement);
    right.remove();
    element.replaceWith(block);
  }
  function parse2(element, { document }) {
    const next = element.nextElementSibling;
    const right = next && next.classList.contains("inner-block__right") ? next : null;
    if (right && element.querySelector("h1") && !right.querySelector("h1")) {
      parseTextFirst(element, right, document);
      return;
    }
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
      const h2 = [...right.querySelectorAll(".cmp-title h2, .cmp-title h3, .cmp-title h4, h2")].find((h) => hasText(h) && !h.closest(".cmp-text"));
      if (h2) {
        const nh = document.createElement("h2");
        nh.textContent = cleanText(h2);
        content.push(nh);
      }
      right.querySelectorAll(".cmp-text p, .cmp-text h2, .cmp-text h3, .cmp-text h4").forEach((p) => {
        if (!hasText(p)) return;
        const isHeading = /^H\d$/.test(p.tagName);
        const np = document.createElement(isHeading ? "h3" : "p");
        np.innerHTML = p.innerHTML.trim();
        np.querySelectorAll("a[href]").forEach((a) => {
          a.setAttribute("href", relativize2(a.getAttribute("href")));
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
      if (payload && payload.template && payload.template.name === "card-grid-landing") {
        const doc = element.ownerDocument;
        const clean2 = (el) => el.textContent.replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
        safeQueryAll(element, ".askexpert").forEach((app) => {
          if (app.closest(".cmp-button__modal")) return;
          const text = doc.createElement("div");
          text.className = "text";
          const cmpText = doc.createElement("div");
          cmpText.className = "cmp-text";
          text.append(cmpText);
          const list = (items) => {
            if (!items.length) return;
            const ul = doc.createElement("ul");
            items.forEach((t) => {
              const li = doc.createElement("li");
              li.textContent = t;
              ul.append(li);
            });
            cmpText.append(ul);
          };
          safeQueryAll(app, "fieldset").forEach((fs) => {
            const legend = fs.querySelector("legend");
            if (legend && clean2(legend)) {
              const h2 = doc.createElement("h2");
              h2.textContent = clean2(legend);
              cmpText.append(h2);
            }
            list(safeQueryAll(fs, ".ask-expert__radio-text, .ask-expert__checkbox-text").map(clean2).filter(Boolean));
            list(safeQueryAll(fs, "label").filter((l) => !l.querySelector('input[type="radio"], input[type="checkbox"], .ask-expert__radio-text')).map(clean2).filter(Boolean));
          });
          if (cmpText.children.length) app.replaceWith(text);
        });
      }
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
        // Model pages: "Inventory Inquiry" side panel (floor plan / location form) next to the sub-nav
        ".root > .cmp-container > .inventory",
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
      if (payload && payload.template && payload.template.name === "contact-page") {
        safeQueryAll(element, ".outer-block .separator").forEach((sep) => sep.remove());
      }
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
  function replaceSpinSets(element, doc) {
    element.querySelectorAll('[data-asset-type="spinset"][data-asset-path]').forEach((viewer) => {
      if (!viewer.isConnected) return;
      const wrapper = viewer.closest(".dynamicmedia") || viewer;
      const server = (viewer.getAttribute("data-imageserver") || "https://gdrv.scene7.com/is/image/").replace(/\/?$/, "/");
      const img = doc.createElement("img");
      img.src = `${server}${viewer.getAttribute("data-asset-path")}`;
      const model = (doc.title.split("|").pop() || "").trim();
      img.alt = model ? `${model} exterior` : "";
      wrapper.replaceWith(img);
    });
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    replaceSpinSets(element, doc);
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
  var ANCHOR_ATTR = "data-excat-section-anchor";
  function linkTargets(root) {
    const ids = /* @__PURE__ */ new Set();
    root.querySelectorAll('a[href*="#"]').forEach((a) => {
      const id = (a.getAttribute("href") || "").split("#")[1];
      if (id) ids.add(id);
    });
    return ids;
  }
  function anchorId(el, targets) {
    if (!targets.size) return "";
    if (el.id && targets.has(el.id)) return el.id;
    const hit = [...el.querySelectorAll("[id]")].find((e) => targets.has(e.id));
    return hit ? hit.id : "";
  }
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
    if (!sections.length) return;
    const doc = element.ownerDocument;
    if (hookName === "beforeTransform") {
      const targets = linkTargets(element);
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section);
        if (!el || !el.parentNode) continue;
        const id = anchorId(el, targets);
        if (i > 0 || section.style || id) {
          const hr = doc.createElement("hr");
          if (section.style || id) hr.setAttribute(MARKER_ATTR, section.id);
          if (id) hr.setAttribute(ANCHOR_ATTR, id);
          el.parentNode.insertBefore(hr, el);
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const marker = element.querySelector(`hr[${MARKER_ATTR}="${section.id}"]`);
        const id = marker ? marker.getAttribute(ANCHOR_ATTR) : "";
        if (!section.style && !id) continue;
        const anchor = marker || findSectionElement(element, section);
        if (!anchor || !anchor.parentNode) continue;
        const cells = {};
        if (section.style) cells.style = section.style;
        if (id) cells.id = id;
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells
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
      element.querySelectorAll(`[${MARKER_ATTR}], [${ANCHOR_ATTR}]`).forEach((el) => {
        el.removeAttribute(MARKER_ATTR);
        el.removeAttribute(ANCHOR_ATTR);
      });
      removeEmptySections(element, doc);
    }
  }
  function isMetadataTable(el) {
    if (el.tagName !== "TABLE") return false;
    const first = el.querySelector("tr > *");
    return !!first && /^\s*section metadata\s*$/i.test(first.textContent);
  }
  function removeEmptySections(element, doc) {
    const breaks = [...element.querySelectorAll("hr:not([class])")];
    for (let i = breaks.length - 1; i >= 0; i -= 1) {
      const hr = breaks[i];
      if (!hr.isConnected) continue;
      const range = doc.createRange();
      range.setStartAfter(hr);
      const next = breaks.slice(i + 1).find((b) => b.isConnected);
      if (next) range.setEndBefore(next);
      else range.setEndAfter(element.lastChild);
      const frag = range.cloneContents();
      const tables = [...frag.querySelectorAll("table")];
      const metas = tables.filter(isMetadataTable);
      if (metas.some((t) => /\bid\b/i.test(t.textContent.replace(/section metadata/i, "")))) continue;
      metas.forEach((t) => t.remove());
      const hasContent = frag.textContent.trim() || [...frag.querySelectorAll("img, iframe, video, source")].some((m) => (m.getAttribute("src") || m.getAttribute("srcset") || "").trim()) || frag.querySelector("table");
      if (hasContent) continue;
      range.deleteContents();
      hr.remove();
    }
  }

  // tools/importer/import-card-grid-landing.js
  var PAGE_TEMPLATE = {
    "name": "card-grid-landing",
    "urls": [
      "https://www.granddesignrv.com/ask-an-expert",
      "https://www.granddesignrv.com/company/careers",
      "https://www.granddesignrv.com/container-v2-sample",
      "https://www.granddesignrv.com/motorized",
      "https://www.granddesignrv.com/motorized/lineage-series-m",
      "https://www.granddesignrv.com/motorized1",
      "https://www.granddesignrv.com/toy-haulers/momentum"
    ],
    "description": "Landing page that opens with a grid of repeated cards, followed by text sections and interactive components",
    "blocks": [
      {
        "name": "model-subnav",
        "instances": [
          ".sticky-nav .cmp-experiencefragment--secondary-navigation"
        ]
      },
      {
        "name": "columns-image-text",
        "instances": [
          "main .outer-block .inner-block__left:has(.cmp-title h1):has(+ .inner-block__right .cmp-image img)"
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
        "name": "Careers intro",
        "selector": [
          "main .outer-block"
        ],
        "style": null,
        "blocks": [
          "columns-image-text"
        ],
        "defaultContent": []
      },
      {
        "id": "section-3",
        "name": "Ask An Expert intro (grey panel)",
        "selector": [
          ".aem-Grid--12 > .container.responsivegrid.margin-top-small:has(.cmp-title h1)"
        ],
        "style": "light-grey",
        "blocks": [],
        "defaultContent": [
          ".aem-Grid--12 > .container.responsivegrid.margin-top-small:has(.cmp-title h1) .cmp-title",
          ".aem-Grid--12 > .container.responsivegrid.margin-top-small:has(.cmp-title h1) .cmp-text",
          ".aem-Grid--12 > .container.responsivegrid.margin-top-small:has(.cmp-title h1) .cmp-image"
        ]
      },
      {
        "id": "section-4",
        "name": "Ask An Expert topic questionnaire",
        "selector": [
          ".aem-Grid--12 > .container.responsivegrid.margin-top-small:has(.cmp-title h1) + .container.responsivegrid"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".aem-Grid--12 > .container.responsivegrid.margin-top-small:has(.cmp-title h1) + .container.responsivegrid .askexpert"
        ]
      }
    ]
  };
  var parsers = {
    "model-subnav": parse,
    "columns-image-text": parse2
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
  var import_card_grid_landing_default = {
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
  return __toCommonJS(import_card_grid_landing_exports);
})();
