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

  // tools/importer/import-display-heading-form-page.js
  var import_display_heading_form_page_exports = {};
  __export(import_display_heading_form_page_exports, {
    default: () => import_display_heading_form_page_default
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

  // tools/importer/parsers/columns.js
  function clean2(text) {
    return (text || "").replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
  }
  function listItem(document, li) {
    const item = document.createElement("li");
    const label = li.querySelector(".cmp-performance-details__label");
    const value = li.querySelector(".cmp-performance-details__value");
    const copy = li.querySelector(".cmp-performance-details__copy");
    if (label || value) {
      if (label && clean2(label.textContent)) {
        const strong = document.createElement("strong");
        strong.textContent = clean2(label.textContent);
        item.append(strong);
      }
      if (value && clean2(value.textContent)) {
        if (item.childNodes.length) item.append(document.createElement("br"));
        item.append(document.createTextNode(clean2(value.textContent)));
      }
    } else if (copy) {
      const title = copy.querySelector("strong, b");
      if (title && clean2(title.textContent)) {
        const strong = document.createElement("strong");
        strong.textContent = clean2(title.textContent);
        item.append(strong);
      }
      const rest = clean2([...copy.childNodes].filter((n) => n !== title).map((n) => n.textContent).join(" "));
      if (rest) {
        if (item.childNodes.length) item.append(document.createElement("br"));
        item.append(document.createTextNode(rest));
      }
    } else if (clean2(li.textContent)) {
      item.textContent = clean2(li.textContent);
    }
    return clean2(item.textContent) ? item : null;
  }
  var GRID_COL = /\baem-GridColumn--default--(\d+)\b/;
  function gridWidth(el) {
    const m = (el.className || "").match(GRID_COL);
    return m ? Number(m[1]) : 0;
  }
  function relativize2(href) {
    if (!href) return href;
    const m = href.match(/^https?:\/\/(?:www\.)?granddesignrv\.com(\/[^#]*)?(#.*)?$/i);
    if (!m) return href;
    return `${(m[1] || "/").replace(/\.html$/, "")}${m[2] || ""}`;
  }
  function gridColumnCell(document, column) {
    const cell = [];
    column.querySelectorAll(".cmp-title, .cmp-text, .cmp-image img, .button a.cmp-button[href]").forEach((el) => {
      if (el.classList.contains("cmp-title")) {
        if (!clean2(el.textContent)) return;
        const h2 = document.createElement("h2");
        h2.textContent = clean2(el.textContent);
        cell.push(h2);
      } else if (el.classList.contains("cmp-text")) {
        [...el.children].forEach((child) => {
          if (!clean2(child.textContent)) return;
          const copy = child.cloneNode(true);
          copy.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", relativize2(a.getAttribute("href"))));
          cell.push(copy);
        });
      } else if (el.tagName === "IMG") {
        const src = el.getAttribute("src") || el.getAttribute("data-src") || "";
        if (!src) return;
        const img = document.createElement("img");
        img.src = src;
        img.alt = clean2(el.getAttribute("alt") || el.getAttribute("title"));
        const p = document.createElement("p");
        p.append(img);
        cell.push(p);
      } else if (clean2(el.textContent)) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = relativize2(el.getAttribute("href"));
        a.textContent = clean2(el.textContent);
        p.append(a);
        cell.push(p);
      }
    });
    return cell;
  }
  function parseGridRow(element, document) {
    const columns = [element];
    let width = gridWidth(element);
    for (let next = element.nextElementSibling; next && width < 12; next = next.nextElementSibling) {
      if (!next.matches(".container.responsivegrid") || !gridWidth(next)) break;
      columns.push(next);
      width += gridWidth(next);
    }
    const row = columns.map((column) => gridColumnCell(document, column)).filter((cell) => cell.length);
    columns.slice(1).forEach((column) => column.remove());
    if (!row.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells: [row] });
    element.replaceWith(block);
  }
  function parse2(element, { document }) {
    if (!element.querySelector(".cmp-performance-details") && element.matches(".container.responsivegrid") && gridWidth(element) && gridWidth(element) < 12) {
      parseGridRow(element, document);
      return;
    }
    const inner = element.querySelector(".cmp-performance-details__inner") || element;
    const before = [];
    const after = [];
    const heading = [...inner.querySelectorAll("h2")].find((h) => !h.closest(".cmp-performance-details__group"));
    if (heading && clean2(heading.textContent)) {
      const h2 = document.createElement("h2");
      h2.textContent = clean2(heading.textContent);
      before.push(h2);
    }
    const row = [];
    inner.querySelectorAll(".cmp-performance-details__group").forEach((group) => {
      const cell = [];
      const title = group.querySelector("h3, h4");
      if (title && clean2(title.textContent)) {
        const h3 = document.createElement("h3");
        h3.textContent = clean2(title.textContent);
        cell.push(h3);
      }
      group.querySelectorAll("ul, ol").forEach((list) => {
        const ul = document.createElement("ul");
        [...list.children].filter((li) => li.tagName === "LI").forEach((li) => {
          const item = listItem(document, li);
          if (item) ul.append(item);
        });
        if (ul.children.length) cell.push(ul);
      });
      if (cell.length) row.push(cell);
    });
    inner.querySelectorAll(".cmp-performance-details__note").forEach((note) => {
      if (!clean2(note.textContent)) return;
      const p = document.createElement("p");
      p.textContent = clean2(note.textContent);
      after.push(p);
    });
    if (!row.length) {
      element.replaceWith(...before, ...after);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells: [row] });
    element.replaceWith(...before, block, ...after);
  }

  // tools/importer/parsers/cards-feature.js
  function clean3(text) {
    return (text || "").replace(/[\u00a0\u200b]/g, " ").replace(/\s+/g, " ").trim();
  }
  function cardOf(title, element) {
    for (let n = title.parentElement; n && n !== element; n = n.parentElement) {
      if (n.querySelectorAll(".cmp-title").length > 1) return null;
      if (n.querySelector("img")) return n;
    }
    return null;
  }
  function parse3(element, { document }) {
    const before = [];
    const cards = [];
    element.querySelectorAll(".cmp-title").forEach((title) => {
      const text = clean3(title.textContent);
      if (!text) return;
      const card = cardOf(title, element);
      if (!card) {
        const h = document.createElement(before.length ? "h3" : "h2");
        h.textContent = text;
        before.push(h);
        return;
      }
      if (cards.some((c) => c.card === card)) return;
      cards.push({ card, title: text });
    });
    const cells = [];
    cards.forEach(({ card, title }) => {
      const srcImg = card.querySelector(".cmp-image img, img");
      const src = srcImg && (srcImg.getAttribute("src") || srcImg.getAttribute("data-src"));
      if (!src) return;
      const img = document.createElement("img");
      img.src = src;
      img.alt = clean3(srcImg.getAttribute("alt") || srcImg.getAttribute("title"));
      const content = [];
      const h3 = document.createElement("h3");
      h3.textContent = title;
      content.push(h3);
      card.querySelectorAll(".cmp-text p").forEach((p) => {
        if (!clean3(p.textContent)) return;
        const np = document.createElement("p");
        np.innerHTML = p.innerHTML.trim();
        content.push(np);
      });
      cells.push([img, content]);
    });
    if (!cells.length) {
      element.replaceWith(...before);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-feature", cells });
    element.replaceWith(...before, block);
  }

  // tools/importer/parsers/cards-promo.js
  function hasText(el) {
    return !!(el && el.textContent.replace(/ /g, " ").trim());
  }
  function getImage(document, card) {
    const srcImg = card.querySelector(".cmp-image img, img");
    const holder = card.querySelector(".cmp-image");
    const src = srcImg && (srcImg.getAttribute("src") || srcImg.getAttribute("data-src")) || holder && holder.getAttribute("data-cmp-src") || "";
    if (!src) return null;
    const img = document.createElement("img");
    img.src = src;
    img.alt = (srcImg && (srcImg.getAttribute("alt") || srcImg.getAttribute("title")) || "").trim();
    return img;
  }
  function parse4(element, { document }) {
    const cells = [];
    const titles = Array.from(element.querySelectorAll(".cmp-title"));
    titles.forEach((title) => {
      const card = title.closest(".cmp-container") || title.parentElement;
      const content = [];
      const titleText = title.textContent.replace(/\s+/g, " ").trim();
      if (titleText) {
        const h = document.createElement("h3");
        h.textContent = titleText;
        content.push(h);
      }
      card.querySelectorAll(".cmp-text > p").forEach((p) => {
        if (!hasText(p)) return;
        const np = document.createElement("p");
        np.innerHTML = p.innerHTML.trim();
        content.push(np);
      });
      card.querySelectorAll("a.cmp-button[href], .button a[href]").forEach((link, i, all) => {
        if (Array.prototype.indexOf.call(all, link) !== i) return;
        if (!hasText(link)) return;
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = link.textContent.replace(/\s+/g, " ").trim();
        const p = document.createElement("p");
        p.append(a);
        content.push(p);
      });
      const img = getImage(document, card);
      if (!img && !content.length) return;
      cells.push([img || "", content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  var ORIGIN = "https://www.granddesignrv.com";
  var ORIGIN_RE2 = /^https?:\/\/(?:www\.)?granddesignrv\.com/i;
  function relativize3(href) {
    if (!href) return "";
    const h = href.trim();
    if (!ORIGIN_RE2.test(h)) return h;
    const path = h.replace(ORIGIN_RE2, "").replace(/^\/content\/granddesignrv\/us\/en/, "").replace(/\.html(?=$|[?#])/, "");
    return path || "/";
  }
  function absolute2(src) {
    if (!src) return "";
    const encoded = /%[0-9a-f]{2}/i.test(src) ? src : encodeURI(src);
    if (/^(https?:)?\/\//i.test(encoded)) return encoded;
    return `${ORIGIN}${encoded.startsWith("/") ? "" : "/"}${encoded}`;
  }
  function readTiles(element) {
    const holder = element.matches("[data-prop-multiimages]") ? element : element.querySelector("[data-prop-multiimages]");
    if (holder) {
      try {
        const items = JSON.parse(holder.getAttribute("data-prop-multiimages"));
        if (Array.isArray(items) && items.length) {
          return items.filter((item) => item && item.imageFirst).map((item) => ({ src: absolute2(item.imageFirst), link: item.link || "" }));
        }
      } catch (e) {
      }
    }
    return [...element.querySelectorAll(".image-grid-container .image img, img")].map((img) => ({ src: img.getAttribute("src") || "", link: "" })).filter((t) => t.src);
  }
  function parse5(element, { document }) {
    const cells = [];
    readTiles(element).forEach((tile) => {
      const img = document.createElement("img");
      img.src = tile.src;
      img.alt = "";
      let text = "";
      if (tile.link) {
        const a = document.createElement("a");
        a.href = relativize3(tile.link);
        a.textContent = a.getAttribute("href");
        text = a;
      }
      cells.push([img, text]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-category", cells });
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
        const clean4 = (el) => el.textContent.replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
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
            if (legend && clean4(legend)) {
              const h2 = doc.createElement("h2");
              h2.textContent = clean4(legend);
              cmpText.append(h2);
            }
            list(safeQueryAll(fs, ".ask-expert__radio-text, .ask-expert__checkbox-text").map(clean4).filter(Boolean));
            list(safeQueryAll(fs, "label").filter((l) => !l.querySelector('input[type="radio"], input[type="checkbox"], .ask-expert__radio-text')).map(clean4).filter(Boolean));
          });
          if (cmpText.children.length) app.replaceWith(text);
        });
      }
      if (payload && payload.template && payload.template.name === "display-heading-form-page") {
        const doc = element.ownerDocument;
        const clean4 = (el) => el.textContent.replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
        safeQueryAll(element, ".shopInventory").forEach((app) => {
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
          const filters = app.querySelector(".filters") || app;
          list(safeQueryAll(filters, "button, label").filter((el) => !el.closest("dialog")).map(clean4).filter(Boolean));
          list(safeQueryAll(filters, "select option").map(clean4).filter(Boolean));
          safeQueryAll(app, ".default-message h1, .default-message h2, .default-message h3, .default-message p").forEach((el) => {
            if (!clean4(el)) return;
            const copy = doc.createElement(/^H\d$/.test(el.tagName) ? "h2" : "p");
            copy.textContent = clean4(el);
            cmpText.append(copy);
          });
          if (cmpText.children.length) app.replaceChildren(text);
          else app.remove();
        });
        removeAll(element, [".findadealer", ".separator"]);
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

  // tools/importer/import-display-heading-form-page.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "model-subnav": parse,
    "columns": parse2,
    "cards-feature": parse3,
    "cards-promo": parse4,
    "cards-category": parse5
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
  var import_display_heading_form_page_default = {
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
  return __toCommonJS(import_display_heading_form_page_exports);
})();
