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

  // tools/importer/import-display-heading-landing.js
  var import_display_heading_landing_exports = {};
  __export(import_display_heading_landing_exports, {
    default: () => import_display_heading_landing_default
  });

  // tools/importer/parsers/columns.js
  function clean(text) {
    return (text || "").replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
  }
  function listItem(document, li) {
    const item = document.createElement("li");
    const label = li.querySelector(".cmp-performance-details__label");
    const value = li.querySelector(".cmp-performance-details__value");
    const copy = li.querySelector(".cmp-performance-details__copy");
    if (label || value) {
      if (label && clean(label.textContent)) {
        const strong = document.createElement("strong");
        strong.textContent = clean(label.textContent);
        item.append(strong);
      }
      if (value && clean(value.textContent)) {
        if (item.childNodes.length) item.append(document.createElement("br"));
        item.append(document.createTextNode(clean(value.textContent)));
      }
    } else if (copy) {
      const title = copy.querySelector("strong, b");
      if (title && clean(title.textContent)) {
        const strong = document.createElement("strong");
        strong.textContent = clean(title.textContent);
        item.append(strong);
      }
      const rest = clean([...copy.childNodes].filter((n) => n !== title).map((n) => n.textContent).join(" "));
      if (rest) {
        if (item.childNodes.length) item.append(document.createElement("br"));
        item.append(document.createTextNode(rest));
      }
    } else if (clean(li.textContent)) {
      item.textContent = clean(li.textContent);
    }
    return clean(item.textContent) ? item : null;
  }
  var GRID_COL = /\baem-GridColumn--default--(\d+)\b/;
  function gridWidth(el) {
    const m = (el.className || "").match(GRID_COL);
    return m ? Number(m[1]) : 0;
  }
  function relativize(href) {
    if (!href) return href;
    const m = href.match(/^https?:\/\/(?:www\.)?granddesignrv\.com(\/[^#]*)?(#.*)?$/i);
    if (!m) return href;
    return `${(m[1] || "/").replace(/\.html$/, "")}${m[2] || ""}`;
  }
  function gridColumnCell(document, column) {
    const cell = [];
    column.querySelectorAll(".cmp-title, .cmp-text, .cmp-image img, .button a.cmp-button[href]").forEach((el) => {
      if (el.classList.contains("cmp-title")) {
        if (!clean(el.textContent)) return;
        const h2 = document.createElement("h2");
        h2.textContent = clean(el.textContent);
        cell.push(h2);
      } else if (el.classList.contains("cmp-text")) {
        [...el.children].forEach((child) => {
          if (!clean(child.textContent)) return;
          const copy = child.cloneNode(true);
          copy.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", relativize(a.getAttribute("href"))));
          cell.push(copy);
        });
      } else if (el.tagName === "IMG") {
        const src = el.getAttribute("src") || el.getAttribute("data-src") || "";
        if (!src) return;
        const img = document.createElement("img");
        img.src = src;
        img.alt = clean(el.getAttribute("alt") || el.getAttribute("title"));
        const p = document.createElement("p");
        p.append(img);
        cell.push(p);
      } else if (clean(el.textContent)) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = relativize(el.getAttribute("href"));
        a.textContent = clean(el.textContent);
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
  function parseContainerV2(element, document) {
    const columns = [...element.children].filter((c) => c.matches(".container.responsivegrid"));
    const row = columns.map((column) => gridColumnCell(document, column)).filter((cell) => cell.length);
    if (!row.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells: [row] });
    element.replaceWith(block);
  }
  function parseRelatedPosts(element, document) {
    const row = [];
    element.querySelectorAll(".blog-card").forEach((card) => {
      const cell = [];
      const title = card.querySelector(".blog-card__meta__title");
      if (title && clean(title.textContent)) {
        const h3 = document.createElement("h3");
        h3.textContent = clean(title.textContent);
        cell.push(h3);
      }
      card.querySelectorAll(".blog-card__meta__copy").forEach((copy) => {
        if (!clean(copy.textContent)) return;
        const p = document.createElement("p");
        p.textContent = clean(copy.textContent);
        cell.push(p);
      });
      const more = card.querySelector("a.blog-card__meta__read-more[href]");
      if (more && clean(more.textContent)) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = relativize(more.getAttribute("href"));
        a.textContent = clean(more.textContent);
        p.append(a);
        cell.push(p);
      }
      if (cell.length) row.push(cell);
    });
    if (!row.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells: [row] });
    element.replaceWith(block);
  }
  function parse(element, { document }) {
    if (element.matches(".cmp-container-v2")) {
      parseContainerV2(element, document);
      return;
    }
    if (element.matches(".related-content__grid")) {
      parseRelatedPosts(element, document);
      return;
    }
    if (!element.querySelector(".cmp-performance-details") && element.matches(".container.responsivegrid") && gridWidth(element) && gridWidth(element) < 12) {
      parseGridRow(element, document);
      return;
    }
    const inner = element.querySelector(".cmp-performance-details__inner") || element;
    const before = [];
    const after = [];
    const heading = [...inner.querySelectorAll("h2")].find((h) => !h.closest(".cmp-performance-details__group"));
    if (heading && clean(heading.textContent)) {
      const h2 = document.createElement("h2");
      h2.textContent = clean(heading.textContent);
      before.push(h2);
    }
    const row = [];
    inner.querySelectorAll(".cmp-performance-details__group").forEach((group) => {
      const cell = [];
      const title = group.querySelector("h3, h4");
      if (title && clean(title.textContent)) {
        const h3 = document.createElement("h3");
        h3.textContent = clean(title.textContent);
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
      if (!clean(note.textContent)) return;
      const p = document.createElement("p");
      p.textContent = clean(note.textContent);
      after.push(p);
    });
    if (!row.length) {
      element.replaceWith(...before, ...after);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells: [row] });
    element.replaceWith(...before, block, ...after);
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
      if (payload && payload.template && payload.template.name === "display-heading-form-page") {
        const doc = element.ownerDocument;
        const clean2 = (el) => el.textContent.replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
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
          list(safeQueryAll(filters, "button, label").filter((el) => !el.closest("dialog")).map(clean2).filter(Boolean));
          list(safeQueryAll(filters, "select option").map(clean2).filter(Boolean));
          safeQueryAll(app, ".default-message h1, .default-message h2, .default-message h3, .default-message p").forEach((el) => {
            if (!clean2(el)) return;
            const copy = doc.createElement(/^H\d$/.test(el.tagName) ? "h2" : "p");
            copy.textContent = clean2(el);
            cmpText.append(copy);
          });
          if (cmpText.children.length) app.replaceChildren(text);
          else app.remove();
        });
        removeAll(element, [".findadealer", ".separator"]);
      }
      if (payload && payload.template && payload.template.name === "display-heading-landing") {
        const doc = element.ownerDocument;
        const clean2 = (el) => el.textContent.replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
        safeQueryAll(element, ".showcalendar").forEach((app) => {
          const text = doc.createElement("div");
          text.className = "text";
          const cmpText = doc.createElement("div");
          cmpText.className = "cmp-text";
          text.append(cmpText);
          const cal = app.querySelector(".show-calendar");
          if (cal) {
            const items = [];
            let run = "";
            const flush = () => {
              const t = run.replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
              if (t) items.push(t);
              run = "";
            };
            const walk = (node) => {
              node.childNodes.forEach((n) => {
                if (n.nodeType === 3) {
                  run += ` ${n.textContent}`;
                  return;
                }
                if (n.nodeType !== 1 || /^(svg|script|style)$/i.test(n.tagName)) return;
                const boundary = /^(INPUT|SELECT|TEXTAREA|LABEL|BUTTON)$/.test(n.tagName);
                if (boundary) flush();
                walk(n);
                if (boundary) flush();
              });
            };
            safeQueryAll(cal, ".show-calendar__toolbar").forEach((bar) => {
              walk(bar);
              flush();
            });
            if (items.length) {
              const ul = doc.createElement("ul");
              items.forEach((t) => {
                const li = doc.createElement("li");
                li.textContent = t;
                ul.append(li);
              });
              cmpText.append(ul);
            }
            safeQueryAll(cal, ".show-calendar__results h2, .show-calendar__results h3, .show-calendar__results p").forEach((el) => {
              if (!clean2(el)) return;
              const copy = doc.createElement(/^H\d$/.test(el.tagName) ? "h3" : "p");
              copy.textContent = clean2(el);
              cmpText.append(copy);
            });
          } else {
            const holder = app.querySelector("[data-empty-message]");
            const msg = holder ? holder.getAttribute("data-empty-message").trim() : "";
            if (msg) {
              const p = doc.createElement("p");
              p.textContent = msg;
              cmpText.append(p);
            }
          }
          if (cmpText.children.length) app.replaceChildren(text);
          else app.remove();
        });
        safeQueryAll(element, ".cmp-text h1, .cmp-text h2, .cmp-text h3, .cmp-text h4, .cmp-text h5, .cmp-text h6").forEach((h) => {
          if (!clean2(h) && !h.querySelector("img")) h.remove();
        });
        safeQueryAll(element, ".title h1.cmp-title__text").forEach((h) => {
          const title = h.closest(".title");
          if (title.classList.contains("heading-scale-feature")) return;
          const nh = doc.createElement(title.classList.contains("heading-scale-primary") ? "h2" : "h3");
          nh.className = h.className;
          nh.append(...h.childNodes);
          h.replaceWith(nh);
        });
        safeQueryAll(element, "h3.related-content__title").forEach((h) => {
          const nh = doc.createElement("h2");
          nh.className = h.className;
          nh.append(...h.childNodes);
          h.replaceWith(nh);
        });
        safeQueryAll(element, ".cmp-image[data-cmp-src]").forEach((wrapper) => {
          const img = wrapper.querySelector("img");
          const widths = (wrapper.getAttribute("data-cmp-widths") || "").split(",").map(Number).filter(Boolean);
          if (!img || !widths.length) return;
          img.setAttribute("src", wrapper.getAttribute("data-cmp-src").replace(/%7B\.width%7D|\{\.width\}/gi, String(Math.max(...widths))));
          img.removeAttribute("srcset");
        });
        removeAll(element, [".separator"]);
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

  // tools/importer/import-display-heading-landing.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "columns": parse
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
  var import_display_heading_landing_default = {
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
  return __toCommonJS(import_display_heading_landing_exports);
})();
