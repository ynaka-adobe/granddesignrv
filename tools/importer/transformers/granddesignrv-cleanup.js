/* eslint-disable */
/* global WebImporter */

/**
 * Grand Design RV cleanup transformer.
 *
 * Source is AEM Core Components (aem-Grid) with duplicated desktop/mobile
 * copies of the same content. Mobile-only copies carry
 * `aem-GridColumn--default--hide` and are removed here; the desktop copies
 * (`aem-GridColumn--phone--hide`) are the ones mapped to blocks and are kept.
 *
 * Never touches `.cmp-homepageslider` or its `data-prop-tabscontent`
 * attribute: the tabs-brands parser reads all tab content from that JSON.
 */

const TRACKING_SRC = /(googlesyndication\.com|doubleclick\.net|analytics\.twitter\.com|\/\/t\.co\/|clarity\.ms|demdex\.net|bat\.bing\.com|facebook\.com\/tr|google\.com\/recaptcha|gstatic\.com\/recaptcha)/i;

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
      // Never remove the brand slider (or anything containing it).
      if (el.matches('.cmp-homepageslider') || el.querySelector('.cmp-homepageslider')) return;
      el.remove();
    });
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Site header experience fragment (logo, nav, search).
    safeQueryAll(element, '.cmp-experiencefragment--header').forEach((xf) => {
      const wrapper = xf.closest('.experiencefragment') || xf;
      wrapper.remove();
    });

    removeAll(element, [
      // Header / footer chrome
      'header.headergv',
      '.topNav',
      'footer.experiencefragment',
      '.cmp-experiencefragment--footer',

      // Cookie + GPC consent banners
      '.cookie-banner',
      '#cookie-banner',
      '#gpc-acknowledgement',

      // "Ask an Expert" floating form / modal (lightbox content)
      '.cmp-button__modal',
      '.askexpert',
      '.cmp-askexpert',
      'button.glightbox',

      // Adobe Target cloud service + reCAPTCHA badge
      'div.cloudservice.testandtarget',
      '.grecaptcha-badge',

      // Mobile-only duplicate copies (desktop copies carry --phone--hide)
      '.aem-GridColumn--default--hide',

      // Carousel controls (Previous/Next/Pause/Play + indicator lists)
      '.cmp-carousel .cmp-carousel__actions',
      '.cmp-carousel .cmp-carousel__indicators',
      '.cmp-carousel button.cmp-carousel__action',
    ]);

    // Empty feature carousel inside #homepage-boxes: remove its grid wrapper.
    safeQueryAll(element, '#homepage-boxes #home-feature-carousel').forEach((carousel) => {
      const wrapper = carousel.closest('.carousel.panelcontainer') || carousel;
      wrapper.remove();
    });

    // Tracking pixels and third-party iframes.
    safeQueryAll(element, 'img, iframe').forEach((el) => {
      const src = el.getAttribute('src') || '';
      const title = el.getAttribute('title') || '';
      if (TRACKING_SRC.test(src) || /reCAPTCHA|Adobe ID Syncing/i.test(title)) {
        el.remove();
      }
    });
    // Remaining empty iframes (reCAPTCHA helpers) carry no authorable content.
    safeQueryAll(element, 'iframe:not([src])').forEach((el) => el.remove());

    // Non-content elements.
    removeAll(element, ['script', 'style', 'noscript', 'link', 'meta']);

    // Core Components lazy images: the rendered <img> may carry a blob:/data:
    // placeholder (or no src). Restore the real image URL from the wrapper's
    // data-cmp-src, filling its {.width} placeholder with the largest width.
    // (data-cmp-is is dropped by the component JS once initialised.)
    safeQueryAll(element, '[data-cmp-src]').forEach((wrapper) => {
      const img = wrapper.querySelector('img');
      if (!img) return;
      const src = img.getAttribute('src') || '';
      if (src && !/^(blob|data):/i.test(src)) return;
      const widths = (wrapper.getAttribute('data-cmp-widths') || '').split(',').map(Number).filter(Boolean);
      const width = widths.length ? Math.max(...widths) : 1600;
      const real = wrapper.getAttribute('data-cmp-src')
        .replace(/%7B\.width%7D|\{\.width\}/gi, String(width));
      img.setAttribute('src', real);
      img.removeAttribute('srcset');
    });

    // Image links without a target (<a href=""> around a banner) carry no link.
    safeQueryAll(element, 'a.cmp-image__link').forEach((a) => {
      const href = (a.getAttribute('href') || '').trim();
      if (href && href !== '#') return;
      a.replaceWith(...a.childNodes);
    });
  }

  if (hookName === 'afterTransform') {
    // Final sweep for anything re-surfaced or left after parsing.
    removeAll(element, [
      'header.headergv',
      'footer.experiencefragment',
      '.cookie-banner',
      'div.cloudservice.testandtarget',
      '.grecaptcha-badge',
      'iframe',
      'script',
      'style',
      'noscript',
      'link',
    ]);

    // Strip tracking / data-layer attributes. Keep data-prop-* (slider JSON)
    // and data-excat-* (section markers handled by the sections transformer).
    safeQueryAll(element, '*').forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (
          name.startsWith('data-cmp-')
          || name.startsWith('data-track')
          || name.startsWith('data-analytics')
          || name === 'rollick-pagetype'
          || name.startsWith('on')
        ) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }
}
