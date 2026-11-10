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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
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
  function parse2(element, { document }) {
    const cells = [];
    const titles = Array.from(element.querySelectorAll(".cmp-title"));
    titles.forEach((title) => {
      const label = title.textContent.replace(/\s+/g, " ").trim();
      if (!label) return;
      const card = title.closest(".cmp-container") || title.parentElement;
      const icon = getIcon(document, card);
      const href = findLink(card, label);
      const heading = document.createElement("h3");
      if (href) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = label;
        heading.append(a);
      } else {
        heading.textContent = label;
      }
      cells.push([icon || "", heading]);
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
  function parse5(element, { document }) {
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
    const heading = inner.querySelector(".cmp-launch-hero__heading, h1, h2");
    if (heading && clean(heading.textContent)) {
      const h1 = document.createElement("h1");
      h1.textContent = clean(heading.textContent);
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
      if (!href || href.startsWith("#") || !clean(link.textContent)) return;
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
  function transform2(hookName, element, payload) {
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
  function transform3(hookName, element, payload) {
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

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "carousel-hero": parse,
    "cards-callouts": parse2,
    "cards-promo": parse3,
    "tabs-brands": parse4,
    "hero-banner": parse5,
    "quote-rating": parse6
  };
  var transformers = [transform, transform2, transform3];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
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
  var import_home_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
