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

  // tools/importer/import-model.js
  var import_model_exports = {};
  __export(import_model_exports, {
    default: () => import_model_default
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
  function parse(element, { document }) {
    const cells = [];
    const nameEl = element.querySelector(".subnav-left__item__title, .subnav-left__items__brand");
    const modelName2 = clean(nameEl && nameEl.textContent) || clean((document.title || "").split("|").pop());
    const brochure = brochureLink(element, document);
    cells.push([modelName2, brochure || ""]);
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

  // tools/importer/parsers/hero-model.js
  var ORIGIN_RE2 = /^https?:\/\/(?:www\.)?granddesignrv\.com/i;
  function clean2(text) {
    return (text || "").replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
  }
  function relativize2(href) {
    if (!href) return "";
    const h = href.trim();
    if (!ORIGIN_RE2.test(h) || /^https?:\/\/[^/]+\/content\/dam\//i.test(h)) return h;
    const path = h.replace(ORIGIN_RE2, "").replace(/^\/content\/granddesignrv\/us\/en/, "").replace(/\.html(?=$|[?#])/, "");
    return path || "/";
  }
  function isHidden(el, root) {
    for (let n = el; n && n !== root; n = n.parentElement) {
      if (n.classList && n.classList.contains("aem-GridColumn--default--hide")) return true;
    }
    return false;
  }
  function imgSrc2(img) {
    const src = img.getAttribute("src") || "";
    if (src && !/^(data|blob):/i.test(src)) return src;
    const wrapper = img.closest("[data-cmp-src]");
    if (wrapper) {
      const widths = (wrapper.getAttribute("data-cmp-widths") || "").split(",").map(Number).filter(Boolean);
      const width = widths.length ? Math.max(...widths) : 1600;
      return wrapper.getAttribute("data-cmp-src").replace(/%7B\.width%7D|\{\.width\}/gi, String(width));
    }
    return img.getAttribute("data-src") || "";
  }
  function makeImg(document, src, alt) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt || "";
    return img;
  }
  function pictureSrc(picture) {
    let best = "";
    let bestWidth = -1;
    picture.querySelectorAll("source").forEach((source) => {
      const srcset = (source.getAttribute("srcset") || "").split(",")[0].trim().split(/\s+/)[0];
      if (!srcset) return;
      const m = (source.getAttribute("media") || "").match(/min-width:\s*(\d+)/);
      const width = m ? parseInt(m[1], 10) : 0;
      if (width > bestWidth) {
        best = srcset;
        bestWidth = width;
      }
    });
    const img = picture.querySelector("img");
    return best || (img ? imgSrc2(img) : "");
  }
  function findBackground(element, promo) {
    const pictures = [...element.querySelectorAll(".dynamic-media-container__image picture")].filter((p) => !(promo && promo.contains(p)) && !isHidden(p, element));
    if (pictures.length) {
      const picture = pictures[pictures.length - 1];
      const src = pictureSrc(picture);
      if (src) return { src, node: picture };
    }
    const styled = [element, ...element.querySelectorAll('[style*="background-image"]')].find((el) => /url\(/i.test(el.getAttribute("style") || "") && !(promo && promo.contains(el)));
    if (styled) {
      const m = styled.getAttribute("style").match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      if (m) return { src: m[1], node: null };
    }
    return null;
  }
  function modelName(document) {
    return clean2((document.title || "").split("|").pop());
  }
  function parse2(element, { document }) {
    if (element.tagName === "TABLE" || !element.isConnected) return;
    const promoHeading = [...element.querySelectorAll("h1")].find((h) => {
      const band = h.closest(".container.full-width");
      return clean2(h.textContent) && !isHidden(h, element) && band && band !== element && element.contains(band);
    });
    const promo = promoHeading ? promoHeading.closest(".container.full-width") : null;
    const marker = element.querySelector("hr[data-excat-section-id]");
    const inPromo = (el) => !!(promo && promo.contains(el));
    const background = findBackground(element, promo);
    const bgPicture = background && background.node;
    const foreground = [...element.querySelectorAll("img")].filter((img) => !isHidden(img, element) && !inPromo(img) && !(bgPicture && bgPicture.contains(img)) && !img.closest(".dynamic-media-container__image") && imgSrc2(img));
    const isLogo2 = (img) => /logo|reversed/i.test(`${img.getAttribute("alt") || ""} ${imgSrc2(img).split("?")[0]}`);
    const logo = foreground.find(isLogo2) || foreground.find((img) => img.closest(".dynamicmedia, .s7dm-dynamic-media")) || foreground[0];
    const badges = foreground.filter((img) => img !== logo);
    const content = [];
    const name = modelName(document);
    if (logo) {
      const p = document.createElement("p");
      p.append(makeImg(document, imgSrc2(logo), name ? `${name} logo` : clean2(logo.getAttribute("alt"))));
      content.push(p);
    }
    if (badges.length) {
      const badge = badges[0];
      const p = document.createElement("p");
      p.append(makeImg(document, imgSrc2(badge), clean2(badge.getAttribute("alt"))));
      content.push(p);
    }
    element.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
      if (isHidden(h, element) || inPromo(h) || !clean2(h.textContent)) return;
      const heading = document.createElement(h.tagName.toLowerCase());
      heading.textContent = clean2(h.textContent);
      content.push(heading);
    });
    const price = [...element.querySelectorAll("p")].find((p) => !isHidden(p, element) && !inPromo(p) && /\$\s?\d/.test(p.textContent));
    if (price) {
      const p = document.createElement("p");
      p.textContent = clean2(price.textContent);
      content.push(p);
    }
    const seen = /* @__PURE__ */ new Set();
    element.querySelectorAll(".button a[href], a.cmp-button[href]").forEach((link) => {
      if (isHidden(link, element) || inPromo(link)) return;
      const label = clean2(link.textContent);
      const href = relativize2(link.getAttribute("href"));
      if (!label || !href || seen.has(`${href}|${label}`)) return;
      seen.add(`${href}|${label}`);
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      p.append(a);
      content.push(p);
    });
    const cells = [];
    if (background) cells.push([makeImg(document, background.src, "")]);
    cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-model", cells });
    const after = [];
    if (promo) {
      if (marker) after.push(marker);
      const h1 = document.createElement("h1");
      h1.textContent = clean2(promoHeading.textContent);
      after.push(h1);
      const done = /* @__PURE__ */ new Set();
      promo.querySelectorAll(".button a[href], a.cmp-button[href]").forEach((link) => {
        const label = clean2(link.textContent);
        if (!label || done.has(link) || isHidden(link, element)) return;
        done.add(link);
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = relativize2(link.getAttribute("href"));
        a.textContent = label;
        p.append(a);
        after.push(p);
      });
    }
    element.replaceWith(block, ...after);
  }

  // tools/importer/parsers/tabs-swatch.js
  function clean3(text) {
    return (text || "").replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
  }
  function isHidden2(el, root) {
    for (let n = el; n && n !== root; n = n.parentElement) {
      if (n.classList && n.classList.contains("aem-GridColumn--default--hide")) return true;
    }
    return false;
  }
  function imgSrc3(img) {
    const src = img.getAttribute("src") || "";
    if (src && !/^(data|blob):/i.test(src)) return src;
    const wrapper = img.closest("[data-cmp-src]");
    if (wrapper) {
      const widths = (wrapper.getAttribute("data-cmp-widths") || "").split(",").map(Number).filter(Boolean);
      const width = widths.length ? Math.max(...widths) : 1600;
      return wrapper.getAttribute("data-cmp-src").replace(/%7B\.width%7D|\{\.width\}/gi, String(width));
    }
    return img.getAttribute("data-src") || "";
  }
  function own(tabs, selector) {
    return [...tabs.querySelectorAll(selector)].filter((el) => el.closest(".cmp-tabs") === tabs);
  }
  function parse3(element, { document }) {
    const tabs = own(element, ".cmp-tabs__tab");
    const panels = own(element, ".cmp-tabs__tabpanel");
    const cells = [];
    tabs.forEach((tab, i) => {
      const titleEl = tab.querySelector(".cmp-tabs__tab-title");
      const name = clean3(titleEl ? titleEl.textContent : tab.textContent);
      const swatchCell = [];
      const thumb = tab.querySelector("img");
      if (thumb && imgSrc3(thumb)) {
        const img = document.createElement("img");
        img.src = imgSrc3(thumb);
        img.alt = name ? `${name} swatch` : "";
        swatchCell.push(img);
      }
      if (name) swatchCell.push(document.createTextNode(name));
      const id = tab.getAttribute("aria-controls");
      const panel = id && panels.find((p) => p.id === id) || panels[i];
      const imageCell = [];
      if (panel) {
        const viewer = [...panel.querySelectorAll('[data-asset-path][data-asset-type="spinset"], [data-asset-path][data-asset-type="image"]')].find((el) => !isHidden2(el, element));
        const photo = [...panel.querySelectorAll("img")].find((img) => !isHidden2(img, element) && imgSrc3(img) && !(viewer && viewer.contains(img)));
        let src = photo ? imgSrc3(photo) : "";
        if (!src && viewer) {
          const server2 = (viewer.getAttribute("data-imageserver") || "https://gdrv.scene7.com/is/image/").replace(/\/?$/, "/");
          src = `${server2}${encodeURI(viewer.getAttribute("data-asset-path"))}`;
        }
        if (src) {
          const img = document.createElement("img");
          img.src = src;
          img.alt = name || clean3(photo ? photo.getAttribute("alt") : viewer.getAttribute("data-alt"));
          imageCell.push(img);
        }
      }
      if (!swatchCell.length && !imageCell.length) return;
      cells.push([swatchCell.length ? swatchCell : "", imageCell.length ? imageCell : ""]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-swatch", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-inline.js
  var IMAGE_SERVER = "https://gdrv.scene7.com/is/image/";
  var VIDEO_SERVER = "https://gdrv.scene7.com/is/content/";
  function clean4(text) {
    return (text || "").replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
  }
  function server(value, fallback) {
    const v = (value || "").trim();
    return /^https?:\/\//i.test(v) ? v.replace(/\/?$/, "/") : fallback;
  }
  function parse4(element, { document }) {
    const viewer = element.matches("[data-asset-path]") ? element : element.querySelector('[data-asset-type="videoavs"][data-asset-path]') || element.querySelector("[data-asset-path]");
    const assetPath = viewer ? (viewer.getAttribute("data-asset-path") || "").trim().replace(/^\/+/, "") : "";
    const content = [];
    if (assetPath) {
      const encoded = encodeURI(assetPath);
      const videoUrl = `${server(viewer.getAttribute("data-videoserver") || viewer.getAttribute("data-contenturl"), VIDEO_SERVER)}${encoded}`;
      const posterUrl = `${server(viewer.getAttribute("data-imageserver"), IMAGE_SERVER)}${encoded}`;
      const title = clean4(viewer.getAttribute("data-title"));
      const alt = clean4(viewer.getAttribute("data-alt")) || title || clean4((viewer.getAttribute("data-asset-name") || "").replace(/\.(mp4|mov|m4v|webm)$/i, "").replace(/\.+$/, ""));
      const posterP = document.createElement("p");
      const img = document.createElement("img");
      img.src = posterUrl;
      img.alt = alt;
      posterP.append(img);
      content.push(posterP);
      const linkP = document.createElement("p");
      const a = document.createElement("a");
      a.href = videoUrl;
      a.textContent = title || videoUrl;
      linkP.append(a);
      content.push(linkP);
    } else {
      const video = element.querySelector("video");
      const source = video && video.querySelector("source[src]");
      const src = video ? video.getAttribute("src") || source && source.getAttribute("src") || "" : "";
      if (src && !/^blob:/i.test(src)) {
        const poster = video.getAttribute("poster");
        if (poster) {
          const p2 = document.createElement("p");
          const img = document.createElement("img");
          img.src = poster;
          img.alt = "";
          p2.append(img);
          content.push(p2);
        }
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = src;
        a.textContent = src;
        p.append(a);
        content.push(p);
      }
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "video-inline", cells: [[content]] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-feature.js
  var ORIGIN_RE3 = /^https?:\/\/(?:www\.)?granddesignrv\.com/i;
  var IMAGE_SERVER2 = "https://gdrv.scene7.com/is/image/";
  var VIDEO_SERVER2 = "https://gdrv.scene7.com/is/content/";
  function clean5(text) {
    return (text || "").replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
  }
  function relativize3(href) {
    if (!href) return "";
    const h = href.trim();
    if (!ORIGIN_RE3.test(h) || /^https?:\/\/[^/]+\/content\/dam\//i.test(h)) return h;
    const path = h.replace(ORIGIN_RE3, "").replace(/^\/content\/granddesignrv\/us\/en/, "").replace(/\.html(?=$|[?#])/, "");
    return path || "/";
  }
  function isHiddenClass(el) {
    return !!(el.classList && el.classList.contains("aem-GridColumn--default--hide"));
  }
  function imgSrc4(img) {
    const src = img.getAttribute("src") || "";
    if (src && !/^(data|blob):/i.test(src)) return src;
    const wrapper = img.closest("[data-cmp-src]");
    if (wrapper) {
      const widths = (wrapper.getAttribute("data-cmp-widths") || "").split(",").map(Number).filter(Boolean);
      const width = widths.length ? Math.max(...widths) : 1600;
      return wrapper.getAttribute("data-cmp-src").replace(/%7B\.width%7D|\{\.width\}/gi, String(width));
    }
    return img.getAttribute("data-src") || "";
  }
  function pictureSrc2(picture) {
    let best = "";
    let bestWidth = -1;
    picture.querySelectorAll("source").forEach((source) => {
      const srcset = (source.getAttribute("srcset") || "").split(",")[0].trim().split(/\s+/)[0];
      if (!srcset) return;
      const m = (source.getAttribute("media") || "").match(/min-width:\s*(\d+)/);
      const width = m ? parseInt(m[1], 10) : 0;
      if (width > bestWidth) {
        best = srcset;
        bestWidth = width;
      }
    });
    const img = picture.querySelector("img");
    return best || (img ? imgSrc4(img) : "");
  }
  function own2(tabs, selector) {
    return [...tabs.querySelectorAll(selector)].filter((el) => el.closest(".cmp-tabs") === tabs);
  }
  function linkOf(el, stop) {
    for (let n = el.parentElement; n && n !== stop; n = n.parentElement) {
      if (n.tagName === "A") {
        const href = (n.getAttribute("href") || "").trim();
        return href && href !== "#" && !/^javascript:/i.test(href) ? href : "";
      }
    }
    return "";
  }
  function widthOf(el, stop) {
    let share = 1;
    for (let n = el; n && n !== stop; n = n.parentElement) {
      const col = n.className && typeof n.className === "string" ? n.className.match(/aem-GridColumn--default--(\d+)/) : null;
      const grid = n.parentElement && typeof n.parentElement.className === "string" ? n.parentElement.className.match(/aem-Grid--(?:default--)?(\d+)/) : null;
      if (col && grid) share *= Math.min(1, parseInt(col[1], 10) / parseInt(grid[1], 10));
    }
    return share;
  }
  function youtubeWatch(src) {
    const m = (src || "").match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/i);
    return m ? `https://www.youtube.com/watch?v=${m[1]}` : src;
  }
  function copyInline(source, target, document) {
    source.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        const text = node.textContent.replace(/​/g, "").replace(/[\s ]+/g, " ");
        if (text) target.append(document.createTextNode(text));
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName.toLowerCase();
      if (tag === "img" || tag === "script" || tag === "style") return;
      const map = { b: "strong", strong: "strong", i: "em", em: "em", a: "a", br: "br", sup: "sup", sub: "sub", u: "u" };
      if (!map[tag] || map[tag] !== "a" && map[tag] !== "br" && target.closest && target.closest(map[tag])) {
        copyInline(node, target, document);
        return;
      }
      const el = document.createElement(map[tag]);
      if (tag === "a") {
        const href = (node.getAttribute("href") || "").trim();
        if (!href) {
          copyInline(node, target, document);
          return;
        }
        el.setAttribute("href", relativize3(href));
      }
      copyInline(node, el, document);
      if (tag === "br" || clean5(el.textContent)) target.append(el);
    });
    return target;
  }
  function inline(source, target, document) {
    copyInline(source, target, document);
    const edge = (first) => {
      for (; ; ) {
        const n = first ? target.firstChild : target.lastChild;
        if (!n) return;
        if (n.nodeName === "BR" || n.nodeType === 3 && !n.textContent.trim()) {
          n.remove();
          continue;
        }
        if (n.nodeType === 3) n.textContent = first ? n.textContent.replace(/^\s+/, "") : n.textContent.replace(/\s+$/, "");
        return;
      }
    };
    edge(true);
    edge(false);
    return target;
  }
  function soleLink(el) {
    const links = [...el.querySelectorAll("a[href]")].filter((a) => clean5(a.textContent));
    if (links.length !== 1) return null;
    return clean5(links[0].textContent) === clean5(el.textContent) ? links[0] : null;
  }
  function collect(panel) {
    const items = [];
    const imageItem = (img) => {
      const src = imgSrc4(img);
      if (!src) return;
      items.push({
        type: "img",
        src,
        alt: clean5(img.getAttribute("alt")),
        href: linkOf(img, panel),
        width: widthOf(img, panel),
        node: img
      });
    };
    const walk = (node) => {
      if (node.nodeType === 3) {
        if (clean5(node.textContent) && node.parentElement && node.parentElement.classList.contains("cmp-text")) {
          items.push({ type: "text", tag: "p", node: node.parentElement, loose: node });
        }
        return;
      }
      if (node.nodeType !== 1 || isHiddenClass(node)) return;
      const tag = node.tagName;
      if (["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "BUTTON", "FORM", "svg", "SVG"].includes(tag)) return;
      if (node.classList.contains("dynamic-media-container__image")) {
        const picture = node.querySelector("picture");
        const src = picture ? pictureSrc2(picture) : node.querySelector("img") ? imgSrc4(node.querySelector("img")) : "";
        if (src) items.push({ type: "bg", src, alt: "" });
        return;
      }
      const style = node.getAttribute("style") || "";
      const bgMatch = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      if (bgMatch) items.push({ type: "bg", src: bgMatch[1], alt: "" });
      if (node.hasAttribute("data-asset-path") && !node.querySelector("img")) {
        const type = (node.getAttribute("data-asset-type") || "").toLowerCase();
        const path = encodeURI(node.getAttribute("data-asset-path").replace(/^\/+/, ""));
        if (/video/.test(type)) {
          const server2 = (node.getAttribute("data-videoserver") || VIDEO_SERVER2).replace(/\/?$/, "/");
          items.push({ type: "link", href: `${server2}${path}`, text: clean5(node.getAttribute("data-title")) || `${server2}${path}` });
        } else if (path) {
          const server2 = (node.getAttribute("data-imageserver") || IMAGE_SERVER2).replace(/\/?$/, "/");
          items.push({
            type: "img",
            src: `${server2}${path}`,
            alt: clean5(node.getAttribute("data-alt")),
            href: "",
            width: widthOf(node, panel),
            node
          });
        }
        return;
      }
      if (tag === "IFRAME") {
        const src = node.getAttribute("src") || node.getAttribute("data-src") || "";
        if (/^https?:/i.test(src)) items.push({ type: "link", href: youtubeWatch(src), text: youtubeWatch(src) });
        return;
      }
      if (tag === "IMG") {
        imageItem(node);
        return;
      }
      if (tag === "PICTURE") {
        const img = node.querySelector("img");
        if (img) imageItem(img);
        return;
      }
      if (/^H[1-6]$/.test(tag) || tag === "P") {
        node.querySelectorAll("img").forEach(imageItem);
        if (!clean5(node.textContent)) return;
        const link = soleLink(node);
        if (link) {
          items.push({ type: "button", href: relativize3(link.getAttribute("href")), text: clean5(link.textContent) });
          return;
        }
        items.push({ type: "text", tag: tag === "P" ? "p" : tag === "H1" ? "h2" : tag.toLowerCase(), node });
        return;
      }
      if (tag === "UL" || tag === "OL") {
        if (clean5(node.textContent)) items.push({ type: "list", tag: tag.toLowerCase(), node });
        return;
      }
      if (tag === "A") {
        const href = (node.getAttribute("href") || "").trim();
        if (node.querySelector("img, picture") || !clean5(node.textContent)) {
          [...node.childNodes].forEach(walk);
          return;
        }
        if (href && href !== "#") {
          items.push({ type: "button", href: relativize3(href), text: clean5(node.textContent) });
          return;
        }
      }
      [...node.childNodes].forEach(walk);
    };
    [...panel.childNodes].forEach(walk);
    const seenLoose = /* @__PURE__ */ new Set();
    return items.filter((item) => {
      if (!item.loose) return true;
      if (seenLoose.has(item.node)) return false;
      seenLoose.add(item.node);
      return true;
    });
  }
  function isLogo(item) {
    return /logo/i.test(`${item.alt} ${item.src.split("?")[0]}`);
  }
  function render(items, document) {
    const bgs = items.filter((i) => i.type === "bg");
    let rest = items.filter((i) => i.type !== "bg");
    const out = [];
    for (let i = 0; i < rest.length; ) {
      const runs = [];
      let j = i;
      let headingTag = null;
      let maxParas = Infinity;
      while (j < rest.length && rest[j].type === "img" && rest[j + 1] && rest[j + 1].type === "text" && /^h/.test(rest[j + 1].tag) && (!headingTag || rest[j + 1].tag === headingTag)) {
        let k = j + 2;
        while (k < rest.length && k - j - 2 < maxParas && rest[k].type === "text" && rest[k].tag === "p") k += 1;
        if (!headingTag) {
          const next = rest[k + 1];
          if (!(rest[k] && rest[k].type === "img" && next && next.type === "text" && next.tag === rest[j + 1].tag)) break;
          headingTag = rest[j + 1].tag;
          maxParas = k - j - 2;
        }
        runs.push(rest.slice(j, k));
        j = k;
      }
      if (runs.length >= 2) {
        out.push({ type: "features", runs });
        i = j;
      } else {
        out.push(rest[i]);
        i += 1;
      }
    }
    rest = out;
    const hasText = rest.some((i) => i.type !== "img");
    if (!bgs.length && hasText) {
      const images = rest.filter((i) => i.type === "img");
      if (images.length) {
        let main;
        if (rest[0].type === "img") {
          main = images.find((i) => !isLogo(i)) || images[0];
        } else {
          main = images.filter((i) => !isLogo(i)).sort((a, b) => b.width - a.width)[0] || images[0];
        }
        rest = [__spreadProps(__spreadValues({}, main), { alone: true }), ...rest.filter((i) => i !== main)];
      }
    }
    const imgEl = (item) => {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt;
      if (!item.href) return img;
      const a = document.createElement("a");
      a.href = relativize3(item.href);
      a.append(img);
      return a;
    };
    const nodes = [];
    for (let i = 0; i < rest.length; i += 1) {
      const item = rest[i];
      if (item.type === "img") {
        const p = document.createElement("p");
        p.append(imgEl(item));
        if (!item.alone) {
          while (rest[i + 1] && rest[i + 1].type === "img" && !rest[i + 1].alone) {
            i += 1;
            p.append(" ", imgEl(rest[i]));
          }
        }
        nodes.push(p);
      } else if (item.type === "text") {
        const el = document.createElement(item.tag);
        if (item.loose) {
          [...item.node.childNodes].filter((n) => n.nodeType === 3).forEach((n) => el.append(document.createTextNode(clean5(n.textContent))));
        } else {
          inline(item.node, el, document);
        }
        if (clean5(el.textContent)) nodes.push(el);
      } else if (item.type === "list") {
        const list = document.createElement(item.tag);
        [...item.node.children].filter((li) => li.tagName === "LI").forEach((li) => {
          const entry = inline(li, document.createElement("li"), document);
          if (clean5(entry.textContent)) list.append(entry);
        });
        if (list.children.length) nodes.push(list);
      } else if (item.type === "button" || item.type === "link") {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = item.href;
        a.textContent = item.text;
        p.append(a);
        nodes.push(p);
      } else if (item.type === "features") {
        const ul = document.createElement("ul");
        item.runs.forEach((run) => {
          const li = document.createElement("li");
          run.forEach((part, n) => {
            if (part.type === "img") {
              li.append(imgEl(part));
              return;
            }
            const text = inline(part.node, document.createElement(/^h/.test(part.tag) ? "strong" : "span"), document);
            if (!clean5(text.textContent)) return;
            if (n > 0) li.append(document.createElement("br"));
            li.append(...text.tagName === "SPAN" ? [...text.childNodes] : [text]);
          });
          ul.append(li);
        });
        nodes.push(ul);
      }
    }
    bgs.forEach((bg) => {
      const p = document.createElement("p");
      const img = document.createElement("img");
      img.src = bg.src;
      img.alt = "";
      p.append(img);
      nodes.push(p);
    });
    return nodes;
  }
  function parse5(element, { document }) {
    const tabs = own2(element, ".cmp-tabs__tab");
    const panels = own2(element, ".cmp-tabs__tabpanel");
    const cells = [];
    tabs.forEach((tab, i) => {
      const label = clean5(tab.textContent);
      const id = tab.getAttribute("aria-controls");
      const panel = id && panels.find((p) => p.id === id) || panels[i];
      const content = panel ? render(collect(panel), document) : [];
      if (!label && !content.length) return;
      cells.push([label || `Tab ${i + 1}`, content.length ? content : ""]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-vertical.js
  var IMAGE_SERVER3 = "https://gdrv.scene7.com/is/image/";
  var ORIGIN_RE4 = /^https?:\/\/(?:www\.)?granddesignrv\.com/i;
  function clean6(text) {
    return (text || "").replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
  }
  function relativize4(href) {
    if (!href) return "";
    const h = href.trim();
    if (!ORIGIN_RE4.test(h) || /^https?:\/\/[^/]+\/content\/dam\//i.test(h)) return h;
    const path = h.replace(ORIGIN_RE4, "").replace(/^\/content\/granddesignrv\/us\/en/, "").replace(/\.html(?=$|[?#])/, "");
    return path || "/";
  }
  function isHidden3(el, root) {
    for (let n = el; n && n !== root; n = n.parentElement) {
      if (n.classList && n.classList.contains("aem-GridColumn--default--hide")) return true;
    }
    return false;
  }
  function imgSrc5(img) {
    const src = img.getAttribute("src") || "";
    if (src && !/^(data|blob):/i.test(src)) return src;
    const wrapper = img.closest("[data-cmp-src]");
    if (wrapper) {
      const widths = (wrapper.getAttribute("data-cmp-widths") || "").split(",").map(Number).filter(Boolean);
      const width = widths.length ? Math.max(...widths) : 1600;
      return wrapper.getAttribute("data-cmp-src").replace(/%7B\.width%7D|\{\.width\}/gi, String(width));
    }
    return img.getAttribute("data-src") || "";
  }
  function own3(tabs, selector) {
    return [...tabs.querySelectorAll(selector)].filter((el) => el.closest(".cmp-tabs") === tabs);
  }
  function inline2(source, target, document) {
    source.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        target.append(document.createTextNode(node.textContent.replace(/ /g, " ")));
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName.toLowerCase();
      const map = { b: "strong", strong: "strong", i: "em", em: "em", a: "a", br: "br", sup: "sup", sub: "sub" };
      if (!map[tag]) {
        inline2(node, target, document);
        return;
      }
      const el = document.createElement(map[tag]);
      if (tag === "a" && node.getAttribute("href")) el.setAttribute("href", relativize4(node.getAttribute("href")));
      inline2(node, el, document);
      target.append(el);
    });
    return target;
  }
  function panelImage(panel, root, document, label) {
    const viewer = [...panel.querySelectorAll("[data-asset-path]")].find((el) => !isHidden3(el, root) && /^(image|spinset)?$/i.test(el.getAttribute("data-asset-type") || ""));
    const img = [...panel.querySelectorAll("img")].find((i) => !isHidden3(i, root) && imgSrc5(i));
    let src = img ? imgSrc5(img) : "";
    if (!src && viewer) {
      const server2 = (viewer.getAttribute("data-imageserver") || IMAGE_SERVER3).replace(/\/?$/, "/");
      src = `${server2}${encodeURI(viewer.getAttribute("data-asset-path").replace(/^\/+/, ""))}`;
    }
    if (!src) return null;
    const out = document.createElement("img");
    out.src = src;
    out.alt = clean6(img && img.getAttribute("alt")) || clean6(viewer && viewer.getAttribute("data-alt")) || label;
    return out;
  }
  function richText(panel, root, document) {
    const out = [];
    panel.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li").forEach((el) => {
      if (isHidden3(el, root) || !clean6(el.textContent)) return;
      if (el.parentElement.closest("h1, h2, h3, h4, h5, h6, p, li")) return;
      const heading = /^H\d$/.test(el.tagName);
      out.push(inline2(el, document.createElement(heading ? "h3" : "p"), document));
    });
    return out;
  }
  function parse6(element, { document }) {
    const tabs = own3(element, ".cmp-tabs__tab");
    const panels = own3(element, ".cmp-tabs__tabpanel");
    const cells = [];
    tabs.forEach((tab, i) => {
      const label = clean6(tab.textContent);
      const id = tab.getAttribute("aria-controls");
      const panel = id && panels.find((p) => p.id === id) || panels[i];
      const content = [];
      if (panel) {
        const img = panelImage(panel, element, document, label);
        if (img) {
          const p = document.createElement("p");
          p.append(img);
          content.push(p);
        }
        const titleEl = [...panel.querySelectorAll(".cmp-image__title")].find((el) => !isHidden3(el, element));
        const descEl = [...panel.querySelectorAll(".cmp-image__description")].find((el) => !isHidden3(el, element));
        if (titleEl || descEl) {
          if (titleEl && clean6(titleEl.textContent)) {
            const h3 = document.createElement("h3");
            h3.textContent = clean6(titleEl.textContent);
            content.push(h3);
          }
          if (descEl && clean6(descEl.textContent)) content.push(inline2(descEl, document.createElement("p"), document));
        } else {
          const text = richText(panel, element, document);
          if (text.length && text[0].tagName !== "H3" && label) {
            const h3 = document.createElement("h3");
            h3.textContent = label;
            text.unshift(h3);
          }
          content.push(...text);
        }
      }
      if (!label && !content.length) return;
      cells.push([label, content.length ? content : ""]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-vertical", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-specs.js
  var ORIGIN_RE5 = /^https?:\/\/(?:www\.)?granddesignrv\.com/i;
  function clean7(text) {
    return (text || "").replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
  }
  function relativize5(href) {
    if (!href) return "";
    const h = href.trim();
    if (/^\/content\/granddesignrv\//.test(h) || ORIGIN_RE5.test(h)) {
      if (/\/content\/dam\//i.test(h)) return h;
      const path = h.replace(ORIGIN_RE5, "").replace(/^\/content\/granddesignrv\/us\/en/, "").replace(/\.html(?=$|[?#])/, "");
      return path || "/";
    }
    return h;
  }
  function columnsOf(table) {
    return [...table.querySelectorAll(".specColContent")].filter((col) => clean7((col.querySelector(".specCellHeader") || {}).textContent));
  }
  function isHidden4(el) {
    return !!el.closest(".aem-GridColumn--default--hide");
  }
  function parse7(element, { document }) {
    if (!element.isConnected) return;
    const all = [...document.querySelectorAll(".spectable")];
    const candidates = all.length ? all : [element];
    const ranked = candidates.map((t) => ({ t, score: columnsOf(t).length * 100 + t.querySelectorAll(".specLabel").length - (isHidden4(t) ? 1e4 : 0) })).sort((a, b) => b.score - a.score);
    const source = ranked[0].t;
    const labels = [...source.querySelectorAll(".specCol .specLabel")].filter((l) => !l.classList.contains("end-filler")).map((l) => clean7(l.textContent));
    const columns = columnsOf(source);
    const desktopLinks = [...source.querySelectorAll(".specContent a[href]")].filter((a) => !a.closest(".button-specCell-mobile"));
    const urlByName = {};
    source.querySelectorAll(".header-floorplan-select option").forEach((opt) => {
      const url = opt.getAttribute("data-floorplan-url");
      if (url) urlByName[clean7(opt.getAttribute("value") || opt.textContent).toUpperCase()] = relativize5(url);
    });
    const cells = [];
    if (columns.length && labels.length) {
      const names = columns.map((col) => clean7(col.querySelector(".specCellHeader").textContent));
      cells.push(["", ...names]);
      const values = columns.map((col) => [...col.querySelectorAll(".specCell")].filter((c) => !/button-specCell/.test(c.className)).map((c) => clean7(c.textContent)));
      labels.forEach((label, r) => {
        cells.push([label, ...values.map((v) => v[r] || "")]);
      });
      const links = columns.map((col, i) => {
        const own4 = col.querySelector("a[href]");
        const paired = own4 || (desktopLinks.length === columns.length ? desktopLinks[i] : null);
        const href = paired ? relativize5(paired.getAttribute("href")) : urlByName[names[i].toUpperCase()];
        if (!href) return "";
        const link = document.createElement("a");
        link.href = href;
        link.textContent = clean7(paired && paired.textContent) || "VIEW";
        return link;
      });
      if (links.some(Boolean)) cells.push(["", ...links]);
    }
    candidates.forEach((t) => {
      if (t !== element && t.isConnected) t.remove();
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "table-specs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote-rating.js
  function clean8(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function getRating(element) {
    const stars = element.querySelector(".cmp-customercomments__stars");
    if (!stars) return 0;
    const m = (stars.getAttribute("class") || "").match(/cmp-customercomments__stars--(\d+)/);
    let n = m ? parseInt(m[1], 10) : stars.querySelectorAll(".cmp-customercomments__star").length;
    if (!n || n < 0) return 0;
    return Math.min(n, 5);
  }
  function parse8(element, { document }) {
    const cells = [];
    const quotation = [];
    const rating = getRating(element);
    if (rating) {
      const p = document.createElement("p");
      p.textContent = "\u2605".repeat(rating);
      quotation.push(p);
    }
    const body = element.querySelector(".quote-body");
    if (body && clean8(body.textContent)) {
      const p = document.createElement("p");
      p.textContent = clean8(body.textContent);
      quotation.push(p);
    }
    if (quotation.length) cells.push([quotation]);
    const author = element.querySelector(".author");
    if (author && clean8(author.textContent)) {
      const p = document.createElement("p");
      p.textContent = clean8(author.textContent);
      cells.push([p]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "quote-rating", cells });
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
      const server2 = (viewer.getAttribute("data-imageserver") || "https://gdrv.scene7.com/is/image/").replace(/\/?$/, "/");
      const img = doc.createElement("img");
      img.src = `${server2}${viewer.getAttribute("data-asset-path")}`;
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

  // tools/importer/import-model.js
  var PAGE_TEMPLATE = {
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
        "name": "hero-model",
        "instances": [
          ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1):has(.cmp-container--gradient-black)",
          ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1)"
        ]
      },
      {
        "name": "tabs-swatch",
        "instances": [
          ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(2) .cmp-tabs:not(.cmp-tabs .cmp-tabs)",
          ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(3) .cmp-tabs:not(.cmp-tabs .cmp-tabs)"
        ]
      },
      {
        "name": "video-inline",
        "instances": [
          '.root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(3) .dynamicmedia:has([data-asset-type="videoavs"])',
          '.root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(3) .dynamicmedia[data-asset-type="videoavs"]'
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
          ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1) .container.full-width:has(h1)",
          ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1) .container.full-width:has(h2)"
        ],
        "style": "dark",
        "blocks": [],
        "defaultContent": [
          ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1) .container.full-width:has(h1) h1",
          ".root > .cmp-container > .container.responsivegrid > .cmp-container > .aem-Grid > :nth-child(1) .container.full-width:has(h1) .button a"
        ]
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
  var parsers = {
    "model-subnav": parse,
    "hero-model": parse2,
    "tabs-swatch": parse3,
    "video-inline": parse4,
    "tabs-feature": parse5,
    "tabs-vertical": parse6,
    "table-specs": parse7,
    "quote-rating": parse8
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
  var import_model_default = {
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
  return __toCommonJS(import_model_exports);
})();
