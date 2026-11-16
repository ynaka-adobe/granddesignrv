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

    // Lightbox "Brochure Request" buttons open a modal form (removed below);
    // keep them as links to the brochure page so the CTA survives.
    safeQueryAll(element, '.button button.cmp-button.glightbox').forEach((btn) => {
      const label = btn.textContent.replace(/\s+/g, ' ').trim();
      if (!/brochure/i.test(`${label} ${btn.getAttribute('aria-label') || ''}`)) return;
      const link = element.ownerDocument.createElement('a');
      link.className = 'cmp-button';
      link.setAttribute('href', '/shopping-tools/brochures/brochure-download');
      link.textContent = label;
      btn.replaceWith(link);
    });

    // Ask An Expert page only: the on-page questionnaire (Vue app, no EDS form backend) is kept
    // as default content: each rendered step's question as an h2, its options and any other
    // field labels as lists. Steps the app has not rendered yet and the reCAPTCHA are not
    // authored. Runs before the generic `.askexpert` removal below; the lightbox copies inside
    // .cmp-button__modal are still dropped.
    if (payload && payload.template && payload.template.name === 'card-grid-landing') {
      const doc = element.ownerDocument;
      const clean = (el) => el.textContent.replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
      safeQueryAll(element, '.askexpert').forEach((app) => {
        if (app.closest('.cmp-button__modal')) return;
        const text = doc.createElement('div');
        text.className = 'text';
        const cmpText = doc.createElement('div');
        cmpText.className = 'cmp-text';
        text.append(cmpText);
        const list = (items) => {
          if (!items.length) return;
          const ul = doc.createElement('ul');
          items.forEach((t) => {
            const li = doc.createElement('li');
            li.textContent = t;
            ul.append(li);
          });
          cmpText.append(ul);
        };
        safeQueryAll(app, 'fieldset').forEach((fs) => {
          const legend = fs.querySelector('legend');
          if (legend && clean(legend)) {
            const h2 = doc.createElement('h2');
            h2.textContent = clean(legend);
            cmpText.append(h2);
          }
          list(safeQueryAll(fs, '.ask-expert__radio-text, .ask-expert__checkbox-text').map(clean).filter(Boolean));
          list(safeQueryAll(fs, 'label')
            .filter((l) => !l.querySelector('input[type="radio"], input[type="checkbox"], .ask-expert__radio-text'))
            .map(clean).filter(Boolean));
        });
        if (cmpText.children.length) app.replaceWith(text);
      });
    }

    // Shop Inventory / Partners / Our Story only. The dealer-inventory search (React app, no EDS
    // backend) is kept as default content inside its .shopInventory wrapper (a section selector):
    // the button and field labels as a list (source order), the radius options as a list, then the
    // "Get Started" message. Its hidden contact-dealer <dialog> form and the empty, hidden
    // find-a-dealer app are not authored. Separator rules are dropped (the Partners top rule is
    // drawn by the section's `rule-top` style; the others are hidden spacers).
    if (payload && payload.template && payload.template.name === 'display-heading-form-page') {
      const doc = element.ownerDocument;
      const clean = (el) => el.textContent.replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
      safeQueryAll(element, '.shopInventory').forEach((app) => {
        const text = doc.createElement('div');
        text.className = 'text';
        const cmpText = doc.createElement('div');
        cmpText.className = 'cmp-text';
        text.append(cmpText);
        const list = (items) => {
          if (!items.length) return;
          const ul = doc.createElement('ul');
          items.forEach((t) => {
            const li = doc.createElement('li');
            li.textContent = t;
            ul.append(li);
          });
          cmpText.append(ul);
        };
        const filters = app.querySelector('.filters') || app;
        list(safeQueryAll(filters, 'button, label')
          .filter((el) => !el.closest('dialog')).map(clean).filter(Boolean));
        list(safeQueryAll(filters, 'select option').map(clean).filter(Boolean));
        safeQueryAll(app, '.default-message h1, .default-message h2, .default-message h3, .default-message p')
          .forEach((el) => {
            if (!clean(el)) return;
            const copy = doc.createElement(/^H\d$/.test(el.tagName) ? 'h2' : 'p');
            copy.textContent = clean(el);
            cmpText.append(copy);
          });
        if (cmpText.children.length) app.replaceChildren(text);
        else app.remove();
      });
      removeAll(element, ['.findadealer', '.separator']);
    }

    // Dealership RV Shows / Awards only.
    // - The show calendar (Vue app fed by an events API, no EDS backend) is kept as default content
    //   inside its .showcalendar wrapper (a section selector), as a visitor sees it at load time:
    //   the search/date labels and filter buttons as a list (source order; icon-only view toggles
    //   are dropped), the result count, then the empty/results message. Not rendered yet (raw
    //   HTML): its configured empty message.
    // - Source titles are all <h1>: the display heading (heading-scale-feature) stays h1, red
    //   award titles (heading-scale-primary) become h2, smaller titles (secondary) h3; the
    //   "Related posts" heading becomes h2.
    // - Lazy DM images: the rendered src is the 320px candidate with raw spaces; use the encoded
    //   data-cmp-src at its largest width instead.
    // - Separator rules are dropped (drawn by the sections' `rule-top` style or hidden spacers).
    if (payload && payload.template && payload.template.name === 'display-heading-landing') {
      const doc = element.ownerDocument;
      const clean = (el) => el.textContent.replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
      safeQueryAll(element, '.showcalendar').forEach((app) => {
        const text = doc.createElement('div');
        text.className = 'text';
        const cmpText = doc.createElement('div');
        cmpText.className = 'cmp-text';
        text.append(cmpText);
        const cal = app.querySelector('.show-calendar');
        if (cal) {
          // one item per label/button text run: fields (input/select), labels and buttons end a run
          const items = [];
          let run = '';
          const flush = () => {
            const t = run.replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
            if (t) items.push(t);
            run = '';
          };
          const walk = (node) => {
            node.childNodes.forEach((n) => {
              if (n.nodeType === 3) { run += ` ${n.textContent}`; return; }
              if (n.nodeType !== 1 || /^(svg|script|style)$/i.test(n.tagName)) return;
              const boundary = /^(INPUT|SELECT|TEXTAREA|LABEL|BUTTON)$/.test(n.tagName);
              if (boundary) flush();
              walk(n);
              if (boundary) flush();
            });
          };
          safeQueryAll(cal, '.show-calendar__toolbar').forEach((bar) => { walk(bar); flush(); });
          if (items.length) {
            const ul = doc.createElement('ul');
            items.forEach((t) => {
              const li = doc.createElement('li');
              li.textContent = t;
              ul.append(li);
            });
            cmpText.append(ul);
          }
          safeQueryAll(cal, '.show-calendar__results h2, .show-calendar__results h3, .show-calendar__results p')
            .forEach((el) => {
              if (!clean(el)) return;
              const copy = doc.createElement(/^H\d$/.test(el.tagName) ? 'h3' : 'p');
              copy.textContent = clean(el);
              cmpText.append(copy);
            });
        } else {
          const holder = app.querySelector('[data-empty-message]');
          const msg = holder ? holder.getAttribute('data-empty-message').trim() : '';
          if (msg) {
            const p = doc.createElement('p');
            p.textContent = msg;
            cmpText.append(p);
          }
        }
        if (cmpText.children.length) app.replaceChildren(text);
        else app.remove();
      });
      // spacer headings (&nbsp; only) in rich text
      safeQueryAll(element, '.cmp-text h1, .cmp-text h2, .cmp-text h3, .cmp-text h4, .cmp-text h5, .cmp-text h6')
        .forEach((h) => { if (!clean(h) && !h.querySelector('img')) h.remove(); });
      safeQueryAll(element, '.title h1.cmp-title__text').forEach((h) => {
        const title = h.closest('.title');
        if (title.classList.contains('heading-scale-feature')) return;
        const nh = doc.createElement(title.classList.contains('heading-scale-primary') ? 'h2' : 'h3');
        nh.className = h.className;
        nh.append(...h.childNodes);
        h.replaceWith(nh);
      });
      safeQueryAll(element, 'h3.related-content__title').forEach((h) => {
        const nh = doc.createElement('h2');
        nh.className = h.className;
        nh.append(...h.childNodes);
        h.replaceWith(nh);
      });
      safeQueryAll(element, '.cmp-image[data-cmp-src]').forEach((wrapper) => {
        const img = wrapper.querySelector('img');
        const widths = (wrapper.getAttribute('data-cmp-widths') || '').split(',').map(Number).filter(Boolean);
        if (!img || !widths.length) return;
        img.setAttribute('src', wrapper.getAttribute('data-cmp-src')
          .replace(/%7B\.width%7D|\{\.width\}/gi, String(Math.max(...widths))));
        img.removeAttribute('srcset');
      });
      removeAll(element, ['.separator']);
    }

    // Article pages (Owner Support Archive, Rally Calendar, National Rally, Factory Tours) only.
    // - Lightbox form buttons ("Submit or Revise A Rally"): the modal's form has no EDS backend;
    //   the modal itself names an e-mail fallback ("submit the information in an email to …"), so
    //   the button is kept as a link to that mailto address. Buttons whose modal has no mailto,
    //   and the sub-nav / "Ask An Expert" lightboxes, are left to the generic removal below.
    // - Hosted forms in an iframe (dm.granddesignrv.com, e.g. the Factory Tour Request Form; the
    //   importer cannot read its cross-origin content) become a link to the form page.
    // - Source titles are all <h1>: the first content title stays h1, later ones become h2
    //   (heading-scale-secondary subtitles h3). Sub-nav and modal titles are not touched.
    // - Separator rules are dropped (visible rules and hidden spacers would open extra sections).
    if (payload && payload.template && payload.template.name === 'article-page') {
      const doc = element.ownerDocument;
      const clean = (el) => el.textContent.replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
      safeQueryAll(element, '.button button.cmp-button.glightbox').forEach((btn) => {
        if (btn.closest('.sticky-nav, .cmp-button__modal')) return;
        const label = clean(btn);
        if (!label || /ask an expert/i.test(label)) return;
        const modal = btn.parentElement && btn.parentElement.querySelector(':scope > .cmp-button__modal');
        const mail = modal && modal.querySelector('form') && modal.querySelector('a[href^="mailto:"]');
        if (!mail) return;
        const link = doc.createElement('a');
        link.className = 'cmp-button';
        link.setAttribute('href', mail.getAttribute('href').trim());
        link.textContent = label;
        btn.replaceWith(link);
      });
      safeQueryAll(element, '.embed iframe[src^="https://dm.granddesignrv.com/"]').forEach((frame) => {
        const url = frame.getAttribute('src').trim();
        const slug = decodeURIComponent(url.replace(/[?#].*$/, '').replace(/\/$/, '').split('/').pop() || '');
        const text = doc.createElement('div');
        text.className = 'text';
        text.innerHTML = '<div class="cmp-text"><p><a></a></p></div>';
        const a = text.querySelector('a');
        a.setAttribute('href', url);
        a.textContent = slug ? `${slug.replace(/[-_]+/g, ' ').trim()} Form` : url;
        (frame.closest('.embed') || frame).replaceWith(text);
      });
      let first = true;
      safeQueryAll(element, '.title h1.cmp-title__text').forEach((h) => {
        if (h.closest('.sticky-nav, .cmp-button__modal, .cmp-experiencefragment--footer, footer')) return;
        if (first) { first = false; return; }
        const title = h.closest('.title');
        const nh = doc.createElement(title.classList.contains('heading-scale-secondary') ? 'h3' : 'h2');
        nh.className = h.className;
        nh.append(...h.childNodes);
        h.replaceWith(nh);
      });
      // Batch 2 (Adventure More, News, Find A Dealer, Brochure Download); each step only acts on
      // its own app's markup, so the other article pages are unchanged.
      // - Listing apps (blog posts / news page filter; no EDS backend): the filter buttons become a
      //   plain list (as a visitor sees them at load time); the pager (Next + dots) and the card
      //   footers (icon + "VIEW POST", hidden on the source) are not authored. The featured post
      //   and the rendered cards are parsed as blocks.
      //   The import runs on the live page: each app root is first swapped for a static copy, so
      //   React no longer owns (and re-renders, e.g. back to its empty state) the nodes the
      //   cleanup and the parsers rewrite.
      safeQueryAll(element, '[data-react-component]').forEach((root) => {
        if (!root.querySelector('.cmp-blog-posts, .cmp-pageFilter')) return;
        const copy = root.cloneNode(true);
        copy.removeAttribute('data-react-component');
        root.replaceWith(copy);
      });
      safeQueryAll(element, '.cmp-blog-posts, .cmp-pageFilter').forEach((app) => {
        safeQueryAll(app, '.filter-items__filters__list').forEach((filters) => {
          const items = safeQueryAll(filters, 'button').map(clean).filter(Boolean);
          if (!items.length) { filters.remove(); return; }
          const ul = doc.createElement('ul');
          items.forEach((t) => {
            const li = doc.createElement('li');
            li.textContent = t;
            ul.append(li);
          });
          filters.replaceWith(ul);
        });
        removeAll(app, ['.filter-items__load-more', '.card__footer']);
      });
      // - Dealer locator (Google map + search, no EDS backend): kept inside its .findadealer
      //   wrapper as default content: the search controls as a list in source order (labels,
      //   button texts, field placeholders, the state select's prompt), then the overlay message
      //   shown at load time. The map, the hidden overlays and the country radios are not authored.
      safeQueryAll(element, '.cmp-findadealer').forEach((app) => {
        const text = doc.createElement('div');
        text.className = 'text';
        const cmpText = doc.createElement('div');
        cmpText.className = 'cmp-text';
        text.append(cmpText);
        const box = app.querySelector('.find-a-dealer-container') || app;
        const items = safeQueryAll(box, '.dealer-search-brand-selector__label, input[placeholder]:not([type="hidden"]), select, .dealer-search-layout__divider, button')
          .filter((el) => !el.closest('.results-container, #map'))
          .map((el) => {
            if (el.tagName === 'INPUT') return el.getAttribute('placeholder').trim();
            if (el.tagName === 'SELECT') return clean(el.querySelector('option') || el);
            return clean(el);
          })
          .filter(Boolean);
        if (items.length) {
          const ul = doc.createElement('ul');
          items.forEach((t) => {
            const li = doc.createElement('li');
            li.textContent = t;
            ul.append(li);
          });
          cmpText.append(ul);
        }
        safeQueryAll(box, '.fad-overlay > [class*="--active"]').forEach((overlay) => {
          safeQueryAll(overlay, '.fad-overlay__message, p').forEach((el) => {
            if (!clean(el)) return;
            const copy = doc.createElement(el.matches('.fad-overlay__message') ? 'h3' : 'p');
            copy.textContent = clean(el);
            cmpText.append(copy);
          });
        });
        if (cmpText.children.length) app.replaceChildren(text);
        else app.remove();
      });
      // - On-page forms (News "Media Contact Information"; no EDS form backend): the field labels,
      //   the request-description prompt and the submit label are kept as a list. Lightbox forms
      //   are left to the generic modal removal.
      safeQueryAll(element, '.gdrv-form form.cmp-form').forEach((form) => {
        if (form.closest('.cmp-button__modal')) return;
        const items = safeQueryAll(form, 'label, .cmp-text p, button').map(clean).filter(Boolean);
        if (!items.length) { form.remove(); return; }
        const text = doc.createElement('div');
        text.className = 'text';
        text.innerHTML = '<div class="cmp-text"><ul></ul></div>';
        items.forEach((t) => {
          const li = doc.createElement('li');
          li.textContent = t;
          text.querySelector('ul').append(li);
        });
        form.replaceWith(text);
      });
      removeAll(element, ['.separator']);
    }

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

      // Model pages: "Inventory Inquiry" side panel (floor plan / location form) next to the sub-nav
      '.root > .cmp-container > .inventory',
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

    // Contact page only: the source's separator rules between department groups sit right next to
    // the inserted section breaks (the rule is drawn by the `rule-top` section style instead); their
    // hr.cmp-separator__horizontal-rule would otherwise open extra empty sections. Removed here, not
    // in beforeTransform, because the contact-page section selectors rely on them (+ / nth-child).
    if (payload && payload.template && payload.template.name === 'contact-page') {
      safeQueryAll(element, '.outer-block .separator').forEach((sep) => sep.remove());
    }

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
