/* eslint-disable */
/* global WebImporter */

/**
 * hero-banner parser.
 * Source: .launchhero > section.cmp-launch-hero with a background <video>
 * (Scene7 /is/content/ source, optional poster) and .cmp-launch-hero__inner
 * text (eyebrow, heading, subheading, body, CTA).
 * Output (one column):
 *   row 1: background image (video poster) or a link to the video URL
 *   row 2: eyebrow, h1 heading, subheading, body, CTA link
 * The scroll link (#launch-updates-form) is ignored.
 */

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function buildMedia(document, element) {
  const video = element.querySelector('video');
  const poster = video && video.getAttribute('poster');
  if (poster) {
    const img = document.createElement('img');
    img.src = poster;
    img.alt = '';
    return img;
  }
  const bgImg = element.querySelector('.cmp-launch-hero__image img, picture img');
  if (bgImg && bgImg.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = bgImg.getAttribute('src');
    img.alt = (bgImg.getAttribute('alt') || '').trim();
    return img;
  }
  const source = video && (video.querySelector('source[src]') || (video.getAttribute('src') ? video : null));
  const videoSrc = source && source.getAttribute('src');
  if (videoSrc) {
    const a = document.createElement('a');
    a.href = videoSrc;
    a.textContent = videoSrc;
    return a;
  }
  return null;
}

export default function parse(element, { document }) {
  const cells = [];
  const inner = element.querySelector('.cmp-launch-hero__inner') || element;

  const media = buildMedia(document, element);
  if (media) cells.push([media]);

  const content = [];
  const eyebrow = inner.querySelector('.cmp-launch-hero__eyebrow');
  if (eyebrow && clean(eyebrow.textContent)) {
    const p = document.createElement('p');
    p.textContent = clean(eyebrow.textContent);
    content.push(p);
  }
  const heading = inner.querySelector('.cmp-launch-hero__heading, h1, h2');
  if (heading && clean(heading.textContent)) {
    const h1 = document.createElement('h1');
    h1.textContent = clean(heading.textContent);
    content.push(h1);
  }
  inner.querySelectorAll('.cmp-launch-hero__subheading, .cmp-launch-hero__body').forEach((el) => {
    if (!clean(el.textContent)) return;
    const p = document.createElement('p');
    p.innerHTML = el.innerHTML.trim();
    content.push(p);
  });
  inner.querySelectorAll('a.cmp-launch-hero__cta[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || !clean(link.textContent)) return;
    const a = document.createElement('a');
    a.href = href;
    a.textContent = clean(link.textContent);
    const p = document.createElement('p');
    p.append(a);
    content.push(p);
  });
  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
