/**
 * hero-banner
 * Full-bleed banner with a background image or video and centered text.
 *
 * Authoring (one column):
 *   row 1: background image, or a link to a video (Scene7 /is/content/, .mp4, .webm, .mov)
 *   row 2: optional eyebrow paragraph, heading, subheading, body text, CTA link
 *
 * The background media is moved into a dedicated `.hero-banner-media` layer.
 * A video link becomes a muted, inline, autoplaying background <video>.
 */

const VIDEO_URL = /(\/is\/content\/|\.(mp4|webm|mov|m4v)(\?|#|$))/i;

function videoType(href) {
  if (/\.webm(\?|#|$)/i.test(href)) return 'video/webm';
  return 'video/mp4';
}

function findVideoLink(block) {
  return [...block.querySelectorAll('a[href]')].find((a) => {
    if (!VIDEO_URL.test(a.href)) return false;
    // only treat it as background media when the link stands alone in its paragraph/cell
    const holder = a.closest('p') || a.parentElement;
    return holder && holder.textContent.trim() === a.textContent.trim();
  });
}

function createVideo(href) {
  const video = document.createElement('video');
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('tabindex', '-1');
  video.preload = 'none';

  // the clip is ~2MB and sits below the fold:
  // attach the source only when the banner nears the viewport
  const source = document.createElement('source');
  source.type = videoType(href);
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    source.src = href;
    video.append(source);
    video.preload = 'auto';
    video.load();
  }, { rootMargin: '200px 0px' });
  observer.observe(video);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    // show the final frame instead of playing
    video.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(video.duration)) video.currentTime = video.duration;
    }, { once: true });
  } else {
    video.autoplay = true;
    video.setAttribute('autoplay', '');
    video.addEventListener('canplay', () => {
      video.play().catch(() => { /* autoplay blocked: first frame stays visible */ });
    }, { once: true });
  }
  return video;
}

/** remove wrappers that were left empty after the media moved out */
function pruneEmpty(el, block) {
  let node = el;
  while (node && node !== block && !node.textContent.trim() && !node.querySelector('picture, img, video')) {
    const parent = node.parentElement;
    node.remove();
    node = parent;
  }
}

export default function decorate(block) {
  const media = document.createElement('div');
  media.className = 'hero-banner-media';

  const link = findVideoLink(block);
  const picture = block.querySelector('picture');

  if (link) {
    const holder = link.closest('p') || link;
    const parent = holder.parentElement;
    media.append(createVideo(link.href));
    holder.remove();
    pruneEmpty(parent, block);
    block.classList.add('has-video');
  } else if (picture) {
    const parent = picture.parentElement;
    media.append(picture);
    pruneEmpty(parent, block);
    block.classList.add('has-image');
  }

  [...block.children].forEach((row) => row.classList.add('hero-banner-content'));

  // eyebrow: a short paragraph authored directly before the heading
  const heading = block.querySelector('h1, h2');
  const prev = heading && heading.previousElementSibling;
  if (prev && prev.tagName === 'P' && !prev.querySelector('a, picture')) {
    prev.classList.add('hero-banner-eyebrow');
  }

  if (media.children.length) block.prepend(media);
}
