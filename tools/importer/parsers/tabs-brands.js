/* eslint-disable */
/* global WebImporter */

/**
 * tabs-brands parser.
 * Source: React HomepageSlider (.cmp-homepageslider). Only the active tab is
 * rendered in .tab-content, so ALL tabs are read from the JSON in the
 * data-prop-tabscontent attribute on the slider root:
 *   [{ tabTitle, allTabTitle, allTabTitleLink, allTabIcon,
 *      slideitemslist: [{ imagePath, imageTitle, floorplanCount, basemsrp,
 *                         buttonText, buttonLink }] }]
 * Falls back to the rendered DOM (active tab only) if the attribute is missing.
 * Output: one row per tab: [tab label, panel: "All <type>" link, then per model:
 * image, model name, floorplans/MSRP line, CTA link].
 * The sibling nav.tabs is removed; .brandselectortitle h1 and .description p
 * stay as default content.
 */

const ORIGIN = 'https://www.granddesignrv.com';

function absUrl(path) {
  if (!path) return '';
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path;
  return `${ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

function linkPara(document, href, text) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = absUrl(href);
  a.textContent = text;
  p.append(a);
  return p;
}

function textPara(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function modelContent(document, { imageSrc, imageAlt, title, info, linkHref, linkText }) {
  const out = [];
  if (imageSrc) {
    const p = document.createElement('p');
    const img = document.createElement('img');
    img.src = absUrl(imageSrc);
    img.alt = imageAlt || title || '';
    p.append(img);
    out.push(p);
  }
  if (title) {
    const h = document.createElement('h3');
    h.textContent = title;
    out.push(h);
  }
  if (info) out.push(textPara(document, info));
  if (linkHref) out.push(linkPara(document, linkHref, linkText || 'Shop This Brand'));
  return out;
}

function infoLine(item) {
  const parts = [];
  if (item.floorplanCount) parts.push(`${item.floorplanCount} Floorplans`);
  if (item.basemsrp) parts.push(`Base MSRP: $${item.basemsrp}*`);
  return parts.join(' | ');
}

function readTabsJson(slider) {
  if (!slider) return null;
  const raw = slider.getAttribute('data-prop-tabscontent');
  if (!raw) return null;
  try {
    let json = raw;
    if (/&(quot|#34);/.test(json)) {
      json = json.replace(/&#34;|&quot;/g, '"').replace(/&amp;/g, '&');
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
        linkText: item.buttonText,
      }));
    });
    return [tab.tabTitle || '', panel.length ? panel : ''];
  });
}

function rowFromDom(document, element, slider) {
  const activeTab = slider && slider.querySelector('nav.tabs button.active, nav.tabs button');
  const label = activeTab ? activeTab.textContent.trim() : '';
  const panel = [];
  const all = element.querySelector('.button-container a[href], a.all-trailers-button[href]');
  if (all) panel.push(linkPara(document, all.getAttribute('href'), all.textContent.replace(/\s+/g, ' ').trim()));

  const img = element.querySelector('.slide.selected img, .carousel-image.selected, .carousel-image');
  const title = element.querySelector('.carousel-info .image-title');
  const info = element.querySelector('.carousel-info .floorplans-info');
  const cta = element.querySelector('.carousel-info .shop-button-wrapper a[href], .carousel-info a[href]');
  panel.push(...modelContent(document, {
    imageSrc: img ? img.getAttribute('src') : '',
    imageAlt: title ? title.textContent.trim() : '',
    title: title ? title.textContent.trim() : '',
    info: info ? info.textContent.replace(/[\s ]+/g, ' ').trim() : '',
    linkHref: cta ? cta.getAttribute('href') : '',
    linkText: cta ? cta.textContent.trim() : '',
  }));
  return [label, panel.length ? panel : ''];
}

export default function parse(element, { document }) {
  const slider = element.closest('.cmp-homepageslider');
  const tabs = readTabsJson(slider);
  const cells = tabs ? rowsFromJson(document, tabs) : [rowFromDom(document, element, slider)];

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-brands', cells });

  if (!slider) {
    element.replaceWith(block);
    return;
  }

  // The slider is a live React root that re-renders its children after parsing,
  // which would restore the source tab bar and panel. Replace the whole root with
  // static nodes: the heading and intro (default content), then the block.
  // The source tab bar (nav.tabs) is dropped; the block rebuilds it.
  const wrapper = document.createElement('div');
  slider.querySelectorAll('.brandselectortitle h1, .description p').forEach((el) => {
    wrapper.append(el.cloneNode(true));
  });
  wrapper.append(block);
  slider.replaceWith(wrapper);
}
