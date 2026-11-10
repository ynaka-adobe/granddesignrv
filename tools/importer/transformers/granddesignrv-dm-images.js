/* eslint-disable */
/* global WebImporter */

/**
 * Grand Design RV Dynamic Media / Scene7 image transformer.
 *
 * afterTransform only (parsers need <img> nodes before then). Rewrites DM
 * <img> elements to anchors that survive the markdown round-trip:
 *   - Unlinked image: <a href="DM-URL">alt</a>
 *   - Linked image (image is sole meaningful child of <a>): keep navigation
 *     href, move DM URL to title, replace link content with alt text.
 *   - Mixed-content anchors are skipped with a warning.
 * Empty alt becomes the visible sentinel 'Image without alt text', which the
 * scripts.js auto-block translates back to alt="".
 */

const EMPTY_ALT_SENTINEL = 'Image without alt text';

function detectDynamicMediaUrl(urlStr) {
  if (!/^(https?:\/\/|\/\/)/i.test(urlStr || '')) return false;
  let u;
  try { u = new URL(urlStr, 'https://x/'); } catch (e) { return false; }
  if (u.pathname.startsWith('/is/image/')) return 'scene7';
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) {
    return 'dm-openapi';
  }
  return false;
}

function isSoleMeaningfulChild(anchor, img) {
  const clone = anchor.cloneNode(true);
  clone.querySelectorAll('img, picture, source').forEach((n) => n.remove());
  if (clone.textContent.trim() !== '') return false;
  const imgs = anchor.querySelectorAll('img');
  return imgs.length === 1 && imgs[0] === img;
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;

  const doc = element.ownerDocument;

  Array.from(element.querySelectorAll('img')).forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (!detectDynamicMediaUrl(src)) return;

    const alt = (img.getAttribute('alt') || '').trim() || EMPTY_ALT_SENTINEL;
    const anchor = img.closest('a');

    if (anchor) {
      if (!isSoleMeaningfulChild(anchor, img)) {
        // eslint-disable-next-line no-console
        console.warn(`[dm-images] skipping mixed-content anchor for ${src}`);
        return;
      }
      anchor.setAttribute('title', src);
      anchor.textContent = alt;
      return;
    }

    const link = doc.createElement('a');
    link.setAttribute('href', src);
    link.textContent = alt;
    const picture = img.parentElement && img.parentElement.tagName === 'PICTURE'
      ? img.parentElement
      : null;
    (picture || img).replaceWith(link);
  });
}
