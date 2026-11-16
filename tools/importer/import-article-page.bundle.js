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

  // tools/importer/import-article-page.js
  var import_article_page_exports = {};
  __export(import_article_page_exports, {
    default: () => import_article_page_default
  });

  // tools/importer/parsers/carousel-hero.js
  function hasText(el) {
    return !!(el && el.textContent.replace(/ /g, " ").trim());
  }
  function cleanImageSrc(src) {
    return (src || "").replace(/[?&]\$Mobile\$$/, "").replace(/\?\$Mobile\$&/, "?");
  }
  function buildImage(document, slide) {
    const srcImg = slide.querySelector(".dynamic-media-container__image img") || slide.querySelector("picture img, img");
    if (!srcImg) return null;
    const src = srcImg.getAttribute("src") || srcImg.getAttribute("data-src") || "";
    if (!src) return null;
    const img = document.createElement("img");
    img.src = cleanImageSrc(src);
    img.alt = (srcImg.getAttribute("alt") || srcImg.getAttribute("title") || "").trim();
    return img;
  }
  function buildText(document, slide) {
    const content = [];
    const nodes = slide.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, .cmp-herov2__text, .cmp-text > p, a[href]"
    );
    nodes.forEach((node) => {
      if (node.closest(".dynamic-media-container__image")) return;
      if (node.matches("a[href]")) {
        if (node.closest(".cmp-herov2__text, .cmp-text > p")) return;
        if (!hasText(node)) return;
        const a = document.createElement("a");
        a.href = node.getAttribute("href");
        a.textContent = node.textContent.replace(/\s+/g, " ").trim();
        const p2 = document.createElement("p");
        p2.append(a);
        content.push(p2);
        return;
      }
      if (!hasText(node)) return;
      if (/^H[1-6]$/.test(node.tagName)) {
        const h = document.createElement(node.tagName.toLowerCase());
        h.textContent = node.textContent.replace(/\s+/g, " ").trim();
        content.push(h);
        return;
      }
      const p = document.createElement("p");
      p.innerHTML = node.innerHTML.trim();
      content.push(p);
    });
    return content;
  }
  function parse(element, { document }) {
    const cells = [];
    let slides = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    if (!slides.length) slides = Array.from(element.querySelectorAll(".dynamic-media-container"));
    slides.forEach((slide) => {
      const img = buildImage(document, slide);
      const text = buildText(document, slide);
      if (!img && !text.length) return;
      cells.push([img || "", text.length ? text : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-callouts.js
  var ORIGIN = "https://www.granddesignrv.com";
  var LABEL_LINKS = {
    "find a dealer": `${ORIGIN}/shopping-tools/find-a-dealer`,
    "shop inventory": `${ORIGIN}/shop-inventory`,
    "factory tour": `${ORIGIN}/shopping-tools/factory-tours`,
    "ask an expert": `${ORIGIN}/ask-an-expert`
  };
  function normalizeAemPath(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    if (path.includes("/experience-fragments/")) return "";
    let p = path.replace(/^\/content\/granddesignrv\/us\/en/, "").replace(/\.html$/, "");
    if (!p.startsWith("/")) p = `/${p}`;
    return `${ORIGIN}${p}`;
  }
  function findLink(card, label) {
    let node = card;
    while (node && node.getAttribute) {
      const onclick = node.getAttribute("onclick") || "";
      const m = onclick.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
      if (m) {
        const href = normalizeAemPath(m[1]);
        if (href) return href;
        break;
      }
      const a = node.querySelector && node.querySelector("a[href]");
      if (a) return a.getAttribute("href");
      if (node.matches && node.matches(".cmp-container") && node !== card) break;
      node = node.parentElement;
    }
    return LABEL_LINKS[label.toLowerCase()] || "";
  }
  function getIcon(document, card) {
    const srcImg = card.querySelector(".cmp-image img, img");
    const holder = card.querySelector(".cmp-image");
    const src = srcImg && (srcImg.getAttribute("src") || srcImg.getAttribute("data-src")) || holder && holder.getAttribute("data-cmp-src") || "";
    if (!src) return null;
    const img = document.createElement("img");
    img.src = src;
    img.alt = (srcImg && (srcImg.getAttribute("alt") || srcImg.getAttribute("title")) || "").trim();
    return img;
  }
  function textLabels(element) {
    return Array.from(element.querySelectorAll(".cmp-text h2, .cmp-text h3, .cmp-text h4"));
  }
  function parse2(element, { document }) {
    const cells = [];
    let titles = Array.from(element.querySelectorAll(".cmp-title"));
    if (!titles.length) titles = textLabels(element);
    titles.forEach((title) => {
      const label = title.textContent.replace(/\s+/g, " ").trim();
      if (!label) return;
      const card = title.closest(".cmp-container") || title.parentElement;
      const icon = getIcon(document, card);
      const href = findLink(card, label);
      const heading2 = document.createElement("h3");
      if (href) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = label;
        heading2.append(a);
      } else {
        heading2.textContent = label;
      }
      cells.push([icon || "", heading2]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-callouts", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function hasText2(el) {
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
  function parse3(element, { document }) {
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
        if (!hasText2(p)) return;
        const np = document.createElement("p");
        np.innerHTML = p.innerHTML.trim();
        content.push(np);
      });
      card.querySelectorAll("a.cmp-button[href], .button a[href]").forEach((link, i, all) => {
        if (Array.prototype.indexOf.call(all, link) !== i) return;
        if (!hasText2(link)) return;
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

  // tools/importer/parsers/tabs-brands.js
  var ORIGIN2 = "https://www.granddesignrv.com";
  function absUrl(path) {
    if (!path) return "";
    if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
    return `${ORIGIN2}${path.startsWith("/") ? "" : "/"}${path}`;
  }
  function linkPara(document, href, text) {
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = absUrl(href);
    a.textContent = text;
    p.append(a);
    return p;
  }
  function textPara(document, text) {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  }
  function modelContent(document, { imageSrc, imageAlt, title, info, linkHref, linkText }) {
    const out = [];
    if (imageSrc) {
      const p = document.createElement("p");
      const img = document.createElement("img");
      img.src = absUrl(imageSrc);
      img.alt = imageAlt || title || "";
      p.append(img);
      out.push(p);
    }
    if (title) {
      const h = document.createElement("h3");
      h.textContent = title;
      out.push(h);
    }
    if (info) out.push(textPara(document, info));
    if (linkHref) out.push(linkPara(document, linkHref, linkText || "Shop This Brand"));
    return out;
  }
  function infoLine(item) {
    const parts = [];
    if (item.floorplanCount) parts.push(`${item.floorplanCount} Floorplans`);
    if (item.basemsrp) parts.push(`Base MSRP: $${item.basemsrp}*`);
    return parts.join(" | ");
  }
  function readTabsJson(slider) {
    if (!slider) return null;
    const raw = slider.getAttribute("data-prop-tabscontent");
    if (!raw) return null;
    try {
      let json = raw;
      if (/&(quot|#34);/.test(json)) {
        json = json.replace(/&#34;|&quot;/g, '"').replace(/&amp;/g, "&");
      }
      const data = JSON.parse(json);
      return Array.isArray(data) && data.length ? data : null;
    } catch (e) {
      return null;
    }
  }
  function rowsFromJson(document, tabs) {
    return tabs.map((tab) => {
      const panel = [];
      if (tab.allTabTitle && tab.allTabTitleLink) {
        panel.push(linkPara(document, tab.allTabTitleLink, tab.allTabTitle));
      }
      (tab.slideitemslist || []).forEach((item) => {
        panel.push(...modelContent(document, {
          imageSrc: item.imagePath,
          imageAlt: item.imageTitle,
          title: item.imageTitle,
          info: infoLine(item),
          linkHref: item.buttonLink,
          linkText: item.buttonText
        }));
      });
      return [tab.tabTitle || "", panel.length ? panel : ""];
    });
  }
  function rowFromDom(document, element, slider) {
    const activeTab = slider && slider.querySelector("nav.tabs button.active, nav.tabs button");
    const label = activeTab ? activeTab.textContent.trim() : "";
    const panel = [];
    const all = element.querySelector(".button-container a[href], a.all-trailers-button[href]");
    if (all) panel.push(linkPara(document, all.getAttribute("href"), all.textContent.replace(/\s+/g, " ").trim()));
    const img = element.querySelector(".slide.selected img, .carousel-image.selected, .carousel-image");
    const title = element.querySelector(".carousel-info .image-title");
    const info = element.querySelector(".carousel-info .floorplans-info");
    const cta = element.querySelector(".carousel-info .shop-button-wrapper a[href], .carousel-info a[href]");
    panel.push(...modelContent(document, {
      imageSrc: img ? img.getAttribute("src") : "",
      imageAlt: title ? title.textContent.trim() : "",
      title: title ? title.textContent.trim() : "",
      info: info ? info.textContent.replace(/[\s ]+/g, " ").trim() : "",
      linkHref: cta ? cta.getAttribute("href") : "",
      linkText: cta ? cta.textContent.trim() : ""
    }));
    return [label, panel.length ? panel : ""];
  }
  function parse4(element, { document }) {
    const slider = element.closest(".cmp-homepageslider");
    const tabs = readTabsJson(slider);
    const cells = tabs ? rowsFromJson(document, tabs) : [rowFromDom(document, element, slider)];
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-brands", cells });
    if (!slider) {
      element.replaceWith(block);
      return;
    }
    const wrapper = document.createElement("div");
    slider.querySelectorAll(".brandselectortitle h1, .description p").forEach((el) => {
      wrapper.append(el.cloneNode(true));
    });
    wrapper.append(block);
    slider.replaceWith(wrapper);
  }

  // tools/importer/parsers/hero-banner.js
  function clean(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function buildMedia(document, element) {
    const video = element.querySelector("video");
    const poster = video && video.getAttribute("poster");
    if (poster) {
      const img = document.createElement("img");
      img.src = poster;
      img.alt = "";
      return img;
    }
    const bgImg = element.querySelector(".cmp-launch-hero__image img, picture img");
    if (bgImg && bgImg.getAttribute("src")) {
      const img = document.createElement("img");
      img.src = bgImg.getAttribute("src");
      img.alt = (bgImg.getAttribute("alt") || "").trim();
      return img;
    }
    const source = video && (video.querySelector("source[src]") || (video.getAttribute("src") ? video : null));
    const videoSrc = source && source.getAttribute("src");
    if (videoSrc) {
      const a = document.createElement("a");
      a.href = videoSrc;
      a.textContent = videoSrc;
      return a;
    }
    return null;
  }
  function parse5(element, { document, params }) {
    const keepAnchor = !!(params && params.keepAnchorCta);
    const cells = [];
    const inner = element.querySelector(".cmp-launch-hero__inner") || element;
    const media = buildMedia(document, element);
    if (media) cells.push([media]);
    const content = [];
    const eyebrow = inner.querySelector(".cmp-launch-hero__eyebrow");
    if (eyebrow && clean(eyebrow.textContent)) {
      const p = document.createElement("p");
      p.textContent = clean(eyebrow.textContent);
      content.push(p);
    }
    const heading2 = inner.querySelector(".cmp-launch-hero__heading, h1, h2");
    if (heading2 && clean(heading2.textContent)) {
      const h1 = document.createElement("h1");
      h1.textContent = clean(heading2.textContent);
      content.push(h1);
    }
    inner.querySelectorAll(".cmp-launch-hero__subheading, .cmp-launch-hero__body").forEach((el) => {
      if (!clean(el.textContent)) return;
      const p = document.createElement("p");
      p.innerHTML = el.innerHTML.trim();
      content.push(p);
    });
    inner.querySelectorAll("a.cmp-launch-hero__cta[href]").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") && !(keepAnchor && href.length > 1) || !clean(link.textContent)) return;
      const a = document.createElement("a");
      a.href = href;
      a.textContent = clean(link.textContent);
      const p = document.createElement("p");
      p.append(a);
      content.push(p);
    });
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote-rating.js
  function clean2(text) {
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
  function parse6(element, { document }) {
    const cells = [];
    const quotation = [];
    const rating = getRating(element);
    if (rating) {
      const p = document.createElement("p");
      p.textContent = "\u2605".repeat(rating);
      quotation.push(p);
    }
    const body = element.querySelector(".quote-body");
    if (body && clean2(body.textContent)) {
      const p = document.createElement("p");
      p.textContent = clean2(body.textContent);
      quotation.push(p);
    }
    if (quotation.length) cells.push([quotation]);
    const author = element.querySelector(".author");
    if (author && clean2(author.textContent)) {
      const p = document.createElement("p");
      p.textContent = clean2(author.textContent);
      cells.push([p]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "quote-rating", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/model-subnav.js
  var ORIGIN_RE = /^https?:\/\/(?:www\.)?granddesignrv\.com/i;
  function clean3(text) {
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
    a.textContent = clean3(link ? link.textContent : labelEl && labelEl.textContent) || "Download Brochure";
    return a;
  }
  function floorplanItem(card, document) {
    const li = document.createElement("li");
    const parts = [];
    const name = clean3((card.querySelector(".option-card__spec__name") || {}).textContent) || clean3(card.getAttribute("title")).toUpperCase();
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
      const title = clean3((item.querySelector(".option-card__spec__title") || {}).textContent);
      const value = clean3((item.querySelector(".option-card__spec__value:not(.option-card__spec__name)") || {}).textContent);
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
    cells.push([clean3(titleEl && titleEl.textContent), ""]);
    const links = document.createElement("ul");
    nav.querySelectorAll(".cmp-list a[href]").forEach((link) => {
      if (!isAuthored(link)) return;
      const label = clean3(link.textContent) || clean3(link.getAttribute("title"));
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
  function parse7(element, { document }) {
    const secondaryNav = element.closest(SECONDARY_NAV) || element.querySelector(SECONDARY_NAV);
    if (secondaryNav) {
      parseSecondaryNav(element, secondaryNav, document);
      return;
    }
    const cells = [];
    const nameEl = element.querySelector(".subnav-left__item__title, .subnav-left__items__brand");
    const modelName = clean3(nameEl && nameEl.textContent) || clean3((document.title || "").split("|").pop());
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
      const label = clean3(link.textContent) || clean3(link.getAttribute("title"));
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

  // tools/importer/parsers/hero.js
  function clean4(text) {
    return (text || "").replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
  }
  function pictureSrc(picture) {
    const source = [...picture.querySelectorAll("source[srcset]")].map((s) => s.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0]).find(Boolean);
    const img = picture.querySelector("img");
    const src = source || img && (img.getAttribute("src") || img.getAttribute("data-src")) || "";
    return /^(data|blob):/i.test(src) ? "" : src;
  }
  function parse8(element, { document }) {
    const picture = element.querySelector(".dynamic-media-container__image picture");
    const src = picture ? pictureSrc(picture) : "";
    const title = [...element.querySelectorAll(".cmp-title")].find((t) => clean4(t.textContent));
    if (!src && !title) {
      element.remove();
      return;
    }
    let image = "";
    if (src) {
      const srcImg = picture.querySelector("img");
      image = document.createElement("img");
      image.src = src;
      image.alt = clean4(srcImg && srcImg.getAttribute("alt"));
    }
    let heading2 = "";
    if (title) {
      heading2 = document.createElement("h1");
      heading2.textContent = clean4(title.textContent);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells: [[image], [heading2]] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-image-text.js
  function hasText3(el) {
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
      if (!hasText3(el)) return;
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
  function plainImageColumn(element, next) {
    if (!next || !next.matches(".container.responsivegrid")) return null;
    if (!element.querySelector(".cmp-title h1")) return null;
    if (!next.querySelector(".cmp-image img") || next.querySelector(".cmp-title, .cmp-text")) return null;
    return next;
  }
  function parseFeaturedPost(element, document) {
    const card = element.querySelector(".card") || element;
    const titleEl = card.querySelector(".card__title");
    const title = titleEl ? cleanText(titleEl) : "";
    const app = element.closest("[data-prop-featured-post]");
    const path = app ? app.getAttribute("data-prop-featured-post").trim() : "";
    const href = path.replace(/^\/content\/granddesignrv\/us\/en(?=\/)/, "").replace(/\.html$/, "");
    const content = [];
    if (title) {
      const h3 = document.createElement("h3");
      if (href.startsWith("/")) {
        const a = document.createElement("a");
        a.setAttribute("href", href);
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      content.push(h3);
    }
    card.querySelectorAll(".card__byline, .card__body").forEach((el) => {
      if (!hasText3(el)) return;
      const p = document.createElement("p");
      p.textContent = cleanText(el);
      content.push(p);
    });
    let image = "";
    const srcImg = card.querySelector(".card__media img, img");
    const src = srcImg ? srcImg.getAttribute("src") || "" : "";
    if (src && !/^(data|blob):/i.test(src)) {
      image = document.createElement("img");
      image.src = /%[0-9a-f]{2}/i.test(src) ? src : encodeURI(src);
      image.alt = title;
    }
    if (!image && !content.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-image-text", cells: [[image, content.length ? content : ""]] });
    element.replaceWith(block);
  }
  function parse9(element, { document }) {
    if (element.matches(".featured-post")) {
      parseFeaturedPost(element, document);
      return;
    }
    const next = element.nextElementSibling;
    const right = next && next.classList.contains("inner-block__right") ? next : null;
    const imageColumn = right ? null : plainImageColumn(element, next);
    if (imageColumn) {
      parseTextFirst(element, imageColumn, document);
      return;
    }
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
      if (h1 && hasText3(h1)) {
        const nh = document.createElement("h1");
        nh.textContent = cleanText(h1);
        content.push(nh);
      }
      const h2 = [...right.querySelectorAll(".cmp-title h2, .cmp-title h3, .cmp-title h4, h2")].find((h) => hasText3(h) && !h.closest(".cmp-text"));
      if (h2) {
        const nh = document.createElement("h2");
        nh.textContent = cleanText(h2);
        content.push(nh);
      }
      right.querySelectorAll(".cmp-text p, .cmp-text h2, .cmp-text h3, .cmp-text h4").forEach((p) => {
        if (!hasText3(p)) return;
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

  // tools/importer/parsers/table.js
  function clean5(text) {
    return (text || "").replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
  }
  function relativize3(href) {
    if (!href) return href;
    const m = href.match(/^https?:\/\/(?:www\.)?granddesignrv\.com(\/[^#]*)?(#.*)?$/i);
    const path = m ? `${m[1] || "/"}${m[2] || ""}` : href;
    return path.replace(/^\/content\/granddesignrv\/us\/en(?=\/)/, "").replace(/\.html(?=$|[?#])/, "");
  }
  function cellContent(document, cell) {
    const links = [...cell.querySelectorAll("a[href]")].filter((a) => clean5(a.textContent));
    if (links.length === 1 && clean5(links[0].textContent) === clean5(cell.textContent)) {
      const a = document.createElement("a");
      a.href = relativize3(links[0].getAttribute("href"));
      a.textContent = clean5(links[0].textContent);
      return a;
    }
    return clean5(cell.textContent);
  }
  function parse10(element, { document }) {
    const table = element.matches("table") ? element : element.querySelector("table");
    if (!table) return;
    const cells = [];
    table.querySelectorAll("tr").forEach((tr) => {
      const row = [...tr.children].filter((c) => /^T[HD]$/.test(c.tagName)).map((c) => cellContent(document, c));
      if (row.some((c) => typeof c === "string" ? c : c.textContent)) cells.push(row);
    });
    if (!cells.length) {
      table.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "table", cells });
    const wrapper = table.parentElement && table.parentElement.matches(".table-container") ? table.parentElement : table;
    wrapper.replaceWith(block);
  }

  // tools/importer/parsers/video-inline.js
  var IMAGE_SERVER = "https://gdrv.scene7.com/is/image/";
  var VIDEO_SERVER = "https://gdrv.scene7.com/is/content/";
  function clean6(text) {
    return (text || "").replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
  }
  function server(value, fallback) {
    const v = (value || "").trim();
    return /^https?:\/\//i.test(v) ? v.replace(/\/?$/, "/") : fallback;
  }
  function parse11(element, { document }) {
    const viewer = element.matches("[data-asset-path]") ? element : element.querySelector('[data-asset-type="videoavs"][data-asset-path]') || element.querySelector("[data-asset-path]");
    const assetPath = viewer ? (viewer.getAttribute("data-asset-path") || "").trim().replace(/^\/+/, "") : "";
    const content = [];
    if (assetPath) {
      const encoded = encodeURI(assetPath);
      const videoUrl = `${server(viewer.getAttribute("data-videoserver") || viewer.getAttribute("data-contenturl"), VIDEO_SERVER)}${encoded}`;
      const posterUrl = `${server(viewer.getAttribute("data-imageserver"), IMAGE_SERVER)}${encoded}`;
      const title = clean6(viewer.getAttribute("data-title"));
      const alt = clean6(viewer.getAttribute("data-alt")) || title || clean6((viewer.getAttribute("data-asset-name") || "").replace(/\.(mp4|mov|m4v|webm)$/i, "").replace(/\.+$/, ""));
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

  // tools/importer/parsers/cards.js
  function clean7(text) {
    return (text || "").replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
  }
  function encodeSrc(src) {
    if (!src) return "";
    return /%[0-9a-f]{2}/i.test(src) ? src : encodeURI(src);
  }
  var ORIGIN3 = "https://www.granddesignrv.com";
  function relativize4(href) {
    if (!href) return href;
    const m = href.match(/^https?:\/\/(?:www\.)?granddesignrv\.com(\/[^#]*)?(#.*)?$/i);
    if (!m) return href;
    return `${(m[1] || "/").replace(/\.html$/, "")}${m[2] || ""}`;
  }
  function absolute2(href) {
    if (!href || /^[a-z]+:/i.test(href)) return href;
    return `${ORIGIN3}${href.startsWith("/") ? "" : "/"}${href}`;
  }
  function linkFor(href) {
    return /\/content\/dam\//i.test(href) ? absolute2(href) : relativize4(href);
  }
  function heading(document, tag, text, href) {
    const h = document.createElement(tag);
    if (href) {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = text;
      h.append(a);
    } else {
      h.textContent = text;
    }
    return h;
  }
  function cardImage(document, srcImg, alt) {
    const src = srcImg ? encodeSrc(srcImg.getAttribute("src") || srcImg.getAttribute("data-src")) : "";
    if (!src || /^(data|blob):/i.test(src)) return "";
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    return img;
  }
  function blogPosts(app, url) {
    const path = app && app.getAttribute("data-prop-blog-path");
    if (!path || typeof XMLHttpRequest === "undefined") return [];
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", new URL(`/bin/api/blogpostlist?type=list&blogpath=${encodeURIComponent(path)}`, url).href, false);
      xhr.send();
      if (xhr.status !== 200) return [];
      return JSON.parse(xhr.responseText).pages || [];
    } catch (e) {
      return [];
    }
  }
  function parseListing(element, document, url) {
    const app = element.closest("[data-prop-blog-path]");
    const norm = (s) => clean7(s).toLowerCase();
    let posts = null;
    const cells = [];
    [...element.children].filter((c) => c.matches(".card")).forEach((card) => {
      const titleEl = card.querySelector(".card__title, .page__title");
      const title = clean7(titleEl && titleEl.textContent);
      if (!title) return;
      const srcImg = card.querySelector("img");
      let href = (card.querySelector(".page__title a[href], .page__image a[href]") || { getAttribute: () => "" }).getAttribute("href");
      if (!href && app) {
        if (posts === null) posts = blogPosts(app, url);
        const src = srcImg ? srcImg.getAttribute("src") : "";
        const post = posts.find((p) => norm(p.title) === norm(title)) || posts.find((p) => src && p.image === src);
        href = post ? post.link : "";
      }
      const text = [heading(document, "h3", title, href ? linkFor(href) : "")];
      card.querySelectorAll(".card__byline").forEach((el) => {
        if (!clean7(el.textContent)) return;
        const p = document.createElement("p");
        p.textContent = clean7(el.textContent);
        text.push(p);
      });
      cells.push([cardImage(document, srcImg, title), text]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "cards", cells }));
  }
  function parseDownloads(element, document) {
    const run = [element];
    for (let n = element.nextElementSibling; n && n.matches(".container.responsivegrid") && n.querySelector(".cmp-download"); n = n.nextElementSibling) {
      run.push(n);
    }
    const cells = [];
    run.forEach((item) => {
      const dl = item.querySelector(".cmp-download");
      const title = clean7((dl.querySelector(".cmp-download__title") || {}).textContent);
      const action = dl.querySelector("a.cmp-download__action[href], a.cmp-download__title-link[href]");
      const href = action ? linkFor(action.getAttribute("href").trim()) : "";
      const srcImg = [...item.querySelectorAll("img")].find((img) => !img.closest(".cmp-download"));
      const text = [];
      if (title) text.push(heading(document, "h3", title, href));
      const props = [...dl.querySelectorAll(".cmp-download__property")].map((prop) => clean7(prop.textContent)).filter(Boolean);
      props.forEach((t) => {
        const p = document.createElement("p");
        p.textContent = t;
        text.push(p);
      });
      if (href) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = clean7(dl.querySelector(".cmp-download__action").textContent) || "Download";
        p.append(a);
        text.push(p);
      }
      if (text.length) cells.push([cardImage(document, srcImg, clean7(srcImg && srcImg.getAttribute("alt")) || title), text]);
    });
    run.slice(1).forEach((item) => item.remove());
    if (!cells.length) {
      element.remove();
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "cards", cells }));
  }
  function parse12(element, { document, url }) {
    if (element.matches(".filter-items__items__list")) {
      parseListing(element, document, url);
      return;
    }
    if (element.matches(".container.responsivegrid") && element.querySelector(".cmp-download")) {
      parseDownloads(element, document);
      return;
    }
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    element.querySelectorAll(".gallery-items a.teaser").forEach((teaser) => {
      if (teaser.closest(".hidden-teasers")) return;
      const srcImg = teaser.querySelector(".teaser-content__thumbnail img, img");
      const src = srcImg ? encodeSrc(srcImg.getAttribute("src") || srcImg.getAttribute("data-src")) : "";
      if (!src || /^(data|blob):/i.test(src) || seen.has(src)) return;
      seen.add(src);
      const img = document.createElement("img");
      img.src = src;
      img.alt = clean7(srcImg.getAttribute("alt") || teaser.getAttribute("data-alt") || teaser.getAttribute("title"));
      const title = clean7((teaser.querySelector(".teaser-content__title") || {}).textContent);
      let text = "";
      if (title) {
        text = document.createElement("h3");
        text.textContent = title;
      }
      cells.push([img, text]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function clean8(text) {
    return (text || "").replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
  }
  function listItem(document, li) {
    const item = document.createElement("li");
    const label = li.querySelector(".cmp-performance-details__label");
    const value = li.querySelector(".cmp-performance-details__value");
    const copy = li.querySelector(".cmp-performance-details__copy");
    if (label || value) {
      if (label && clean8(label.textContent)) {
        const strong = document.createElement("strong");
        strong.textContent = clean8(label.textContent);
        item.append(strong);
      }
      if (value && clean8(value.textContent)) {
        if (item.childNodes.length) item.append(document.createElement("br"));
        item.append(document.createTextNode(clean8(value.textContent)));
      }
    } else if (copy) {
      const title = copy.querySelector("strong, b");
      if (title && clean8(title.textContent)) {
        const strong = document.createElement("strong");
        strong.textContent = clean8(title.textContent);
        item.append(strong);
      }
      const rest = clean8([...copy.childNodes].filter((n) => n !== title).map((n) => n.textContent).join(" "));
      if (rest) {
        if (item.childNodes.length) item.append(document.createElement("br"));
        item.append(document.createTextNode(rest));
      }
    } else if (clean8(li.textContent)) {
      item.textContent = clean8(li.textContent);
    }
    return clean8(item.textContent) ? item : null;
  }
  var GRID_COL = /\baem-GridColumn--default--(\d+)\b/;
  function gridWidth(el) {
    const m = (el.className || "").match(GRID_COL);
    return m ? Number(m[1]) : 0;
  }
  function relativize5(href) {
    if (!href) return href;
    const m = href.match(/^https?:\/\/(?:www\.)?granddesignrv\.com(\/[^#]*)?(#.*)?$/i);
    if (!m) return href;
    return `${(m[1] || "/").replace(/\.html$/, "")}${m[2] || ""}`;
  }
  function gridColumnCell(document, column) {
    const cell = [];
    column.querySelectorAll(".cmp-title, .cmp-text, .cmp-image img, .button a.cmp-button[href]").forEach((el) => {
      if (el.classList.contains("cmp-title")) {
        if (!clean8(el.textContent)) return;
        const h2 = document.createElement("h2");
        h2.textContent = clean8(el.textContent);
        cell.push(h2);
      } else if (el.classList.contains("cmp-text")) {
        [...el.children].forEach((child) => {
          if (!clean8(child.textContent)) return;
          const copy = child.cloneNode(true);
          copy.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", relativize5(a.getAttribute("href"))));
          cell.push(copy);
        });
      } else if (el.tagName === "IMG") {
        const src = el.getAttribute("src") || el.getAttribute("data-src") || "";
        if (!src) return;
        const img = document.createElement("img");
        img.src = src;
        img.alt = clean8(el.getAttribute("alt") || el.getAttribute("title"));
        const p = document.createElement("p");
        p.append(img);
        cell.push(p);
      } else if (clean8(el.textContent)) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = relativize5(el.getAttribute("href"));
        a.textContent = clean8(el.textContent);
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
      if (title && clean8(title.textContent)) {
        const h3 = document.createElement("h3");
        h3.textContent = clean8(title.textContent);
        cell.push(h3);
      }
      card.querySelectorAll(".blog-card__meta__copy").forEach((copy) => {
        if (!clean8(copy.textContent)) return;
        const p = document.createElement("p");
        p.textContent = clean8(copy.textContent);
        cell.push(p);
      });
      const more = card.querySelector("a.blog-card__meta__read-more[href]");
      if (more && clean8(more.textContent)) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = relativize5(more.getAttribute("href"));
        a.textContent = clean8(more.textContent);
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
  function parse13(element, { document }) {
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
    const heading2 = [...inner.querySelectorAll("h2")].find((h) => !h.closest(".cmp-performance-details__group"));
    if (heading2 && clean8(heading2.textContent)) {
      const h2 = document.createElement("h2");
      h2.textContent = clean8(heading2.textContent);
      before.push(h2);
    }
    const row = [];
    inner.querySelectorAll(".cmp-performance-details__group").forEach((group) => {
      const cell = [];
      const title = group.querySelector("h3, h4");
      if (title && clean8(title.textContent)) {
        const h3 = document.createElement("h3");
        h3.textContent = clean8(title.textContent);
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
      if (!clean8(note.textContent)) return;
      const p = document.createElement("p");
      p.textContent = clean8(note.textContent);
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
        const clean9 = (el) => el.textContent.replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
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
            if (legend && clean9(legend)) {
              const h2 = doc.createElement("h2");
              h2.textContent = clean9(legend);
              cmpText.append(h2);
            }
            list(safeQueryAll(fs, ".ask-expert__radio-text, .ask-expert__checkbox-text").map(clean9).filter(Boolean));
            list(safeQueryAll(fs, "label").filter((l) => !l.querySelector('input[type="radio"], input[type="checkbox"], .ask-expert__radio-text')).map(clean9).filter(Boolean));
          });
          if (cmpText.children.length) app.replaceWith(text);
        });
      }
      if (payload && payload.template && payload.template.name === "display-heading-form-page") {
        const doc = element.ownerDocument;
        const clean9 = (el) => el.textContent.replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
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
          list(safeQueryAll(filters, "button, label").filter((el) => !el.closest("dialog")).map(clean9).filter(Boolean));
          list(safeQueryAll(filters, "select option").map(clean9).filter(Boolean));
          safeQueryAll(app, ".default-message h1, .default-message h2, .default-message h3, .default-message p").forEach((el) => {
            if (!clean9(el)) return;
            const copy = doc.createElement(/^H\d$/.test(el.tagName) ? "h2" : "p");
            copy.textContent = clean9(el);
            cmpText.append(copy);
          });
          if (cmpText.children.length) app.replaceChildren(text);
          else app.remove();
        });
        removeAll(element, [".findadealer", ".separator"]);
      }
      if (payload && payload.template && payload.template.name === "display-heading-landing") {
        const doc = element.ownerDocument;
        const clean9 = (el) => el.textContent.replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
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
              if (!clean9(el)) return;
              const copy = doc.createElement(/^H\d$/.test(el.tagName) ? "h3" : "p");
              copy.textContent = clean9(el);
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
          if (!clean9(h) && !h.querySelector("img")) h.remove();
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
      if (payload && payload.template && payload.template.name === "article-page") {
        const doc = element.ownerDocument;
        const clean9 = (el) => el.textContent.replace(/[ ​]/g, " ").replace(/\s+/g, " ").trim();
        safeQueryAll(element, ".button button.cmp-button.glightbox").forEach((btn) => {
          if (btn.closest(".sticky-nav, .cmp-button__modal")) return;
          const label = clean9(btn);
          if (!label || /ask an expert/i.test(label)) return;
          const modal = btn.parentElement && btn.parentElement.querySelector(":scope > .cmp-button__modal");
          const mail = modal && modal.querySelector("form") && modal.querySelector('a[href^="mailto:"]');
          if (!mail) return;
          const link = doc.createElement("a");
          link.className = "cmp-button";
          link.setAttribute("href", mail.getAttribute("href").trim());
          link.textContent = label;
          btn.replaceWith(link);
        });
        safeQueryAll(element, '.embed iframe[src^="https://dm.granddesignrv.com/"]').forEach((frame) => {
          const url = frame.getAttribute("src").trim();
          const slug = decodeURIComponent(url.replace(/[?#].*$/, "").replace(/\/$/, "").split("/").pop() || "");
          const text = doc.createElement("div");
          text.className = "text";
          text.innerHTML = '<div class="cmp-text"><p><a></a></p></div>';
          const a = text.querySelector("a");
          a.setAttribute("href", url);
          a.textContent = slug ? `${slug.replace(/[-_]+/g, " ").trim()} Form` : url;
          (frame.closest(".embed") || frame).replaceWith(text);
        });
        let first = true;
        safeQueryAll(element, ".title h1.cmp-title__text").forEach((h) => {
          if (h.closest(".sticky-nav, .cmp-button__modal, .cmp-experiencefragment--footer, footer")) return;
          if (first) {
            first = false;
            return;
          }
          const title = h.closest(".title");
          const nh = doc.createElement(title.classList.contains("heading-scale-secondary") ? "h3" : "h2");
          nh.className = h.className;
          nh.append(...h.childNodes);
          h.replaceWith(nh);
        });
        safeQueryAll(element, "[data-react-component]").forEach((root) => {
          if (!root.querySelector(".cmp-blog-posts, .cmp-pageFilter")) return;
          const copy = root.cloneNode(true);
          copy.removeAttribute("data-react-component");
          root.replaceWith(copy);
        });
        safeQueryAll(element, ".cmp-blog-posts, .cmp-pageFilter").forEach((app) => {
          safeQueryAll(app, ".filter-items__filters__list").forEach((filters) => {
            const items = safeQueryAll(filters, "button").map(clean9).filter(Boolean);
            if (!items.length) {
              filters.remove();
              return;
            }
            const ul = doc.createElement("ul");
            items.forEach((t) => {
              const li = doc.createElement("li");
              li.textContent = t;
              ul.append(li);
            });
            filters.replaceWith(ul);
          });
          removeAll(app, [".filter-items__load-more", ".card__footer"]);
        });
        safeQueryAll(element, ".cmp-findadealer").forEach((app) => {
          const text = doc.createElement("div");
          text.className = "text";
          const cmpText = doc.createElement("div");
          cmpText.className = "cmp-text";
          text.append(cmpText);
          const box = app.querySelector(".find-a-dealer-container") || app;
          const items = safeQueryAll(box, '.dealer-search-brand-selector__label, input[placeholder]:not([type="hidden"]), select, .dealer-search-layout__divider, button').filter((el) => !el.closest(".results-container, #map")).map((el) => {
            if (el.tagName === "INPUT") return el.getAttribute("placeholder").trim();
            if (el.tagName === "SELECT") return clean9(el.querySelector("option") || el);
            return clean9(el);
          }).filter(Boolean);
          if (items.length) {
            const ul = doc.createElement("ul");
            items.forEach((t) => {
              const li = doc.createElement("li");
              li.textContent = t;
              ul.append(li);
            });
            cmpText.append(ul);
          }
          safeQueryAll(box, '.fad-overlay > [class*="--active"]').forEach((overlay) => {
            safeQueryAll(overlay, ".fad-overlay__message, p").forEach((el) => {
              if (!clean9(el)) return;
              const copy = doc.createElement(el.matches(".fad-overlay__message") ? "h3" : "p");
              copy.textContent = clean9(el);
              cmpText.append(copy);
            });
          });
          if (cmpText.children.length) app.replaceChildren(text);
          else app.remove();
        });
        safeQueryAll(element, ".gdrv-form form.cmp-form").forEach((form) => {
          if (form.closest(".cmp-button__modal")) return;
          const items = safeQueryAll(form, "label, .cmp-text p, button").map(clean9).filter(Boolean);
          if (!items.length) {
            form.remove();
            return;
          }
          const text = doc.createElement("div");
          text.className = "text";
          text.innerHTML = '<div class="cmp-text"><ul></ul></div>';
          items.forEach((t) => {
            const li = doc.createElement("li");
            li.textContent = t;
            text.querySelector("ul").append(li);
          });
          form.replaceWith(text);
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

  // tools/importer/import-article-page.js
  var PAGE_TEMPLATE = {
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
          '.aem-Grid:has(> .container.responsivegrid.inner-block__center > .cmp-container[onclick*="location.href"] .cmp-image)'
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
          '.outer-block .inner-block__right .dynamicmedia:has([data-asset-type="videoavs"])'
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
          '.aem-Grid:has(> .container.responsivegrid.inner-block__center > .cmp-container[onclick*="location.href"] .cmp-image)'
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
          '.aem-Grid > .title.cmp-title--blog:has(+ .container.responsivegrid .blogposts [data-prop-blog-path$="/adventure-more/live"])'
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
          '.aem-Grid > .container.responsivegrid:has(> .cmp-container > .aem-Grid > .blogposts [data-prop-blog-path$="/adventure-more/learn"])'
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
          '.aem-Grid > .container.responsivegrid:has(> .cmp-container > .aem-Grid > .blogposts [data-prop-blog-path$="/adventure-more/community"])'
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
          '.aem-Grid > .container.responsivegrid:has(> .cmp-container > .aem-Grid > .blogposts [data-prop-blog-path$="/adventure-more/buy"])'
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
  var parsers = {
    "carousel-hero": parse,
    "cards-callouts": parse2,
    "cards-promo": parse3,
    "tabs-brands": parse4,
    "hero-banner": parse5,
    "quote-rating": parse6,
    "model-subnav": parse7,
    "hero": parse8,
    "columns-image-text": parse9,
    "table": parse10,
    "video-inline": parse11,
    "cards": parse12,
    "columns": parse13
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
  var import_article_page_default = {
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
  return __toCommonJS(import_article_page_exports);
})();
