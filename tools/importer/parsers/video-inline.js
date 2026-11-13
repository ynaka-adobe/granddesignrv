/* eslint-disable */
/* global WebImporter */

/**
 * video-inline parser.
 * Source: Dynamic Media video component (.dynamicmedia) in a model page's brand story. The live
 * DOM only holds a blob: <video>, so the video is rebuilt from the component's data attributes:
 *   data-asset-path   granddesignrv/<name>-AVS     (adaptive video set)
 *   data-asset-type   videoavs
 *   data-videoserver  https://gdrv.scene7.com/is/content/
 *   data-imageserver  https://gdrv.scene7.com/is/image/  (serves the set's poster frame)
 *   data-title / data-alt (optional)
 * The attributes sit on .dynamicmedia itself or on its inner .s7dm-dynamic-media viewer.
 * Output (Video convention, 1 cell): <p>poster img</p><p><a href="{videoserver}{asset}">title or URL</a></p>
 */

const IMAGE_SERVER = 'https://gdrv.scene7.com/is/image/';
const VIDEO_SERVER = 'https://gdrv.scene7.com/is/content/';

function clean(text) {
  return (text || '').replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
}

function server(value, fallback) {
  const v = (value || '').trim();
  return /^https?:\/\//i.test(v) ? v.replace(/\/?$/, '/') : fallback;
}

export default function parse(element, { document }) {
  const viewer = element.matches('[data-asset-path]')
    ? element
    : (element.querySelector('[data-asset-type="videoavs"][data-asset-path]') || element.querySelector('[data-asset-path]'));
  const assetPath = viewer ? (viewer.getAttribute('data-asset-path') || '').trim().replace(/^\/+/, '') : '';

  const content = [];
  if (assetPath) {
    const encoded = encodeURI(assetPath);
    const videoUrl = `${server(viewer.getAttribute('data-videoserver') || viewer.getAttribute('data-contenturl'), VIDEO_SERVER)}${encoded}`;
    const posterUrl = `${server(viewer.getAttribute('data-imageserver'), IMAGE_SERVER)}${encoded}`;
    const title = clean(viewer.getAttribute('data-title'));
    const alt = clean(viewer.getAttribute('data-alt')) || title
      || clean((viewer.getAttribute('data-asset-name') || '').replace(/\.(mp4|mov|m4v|webm)$/i, '').replace(/\.+$/, ''));

    const posterP = document.createElement('p');
    const img = document.createElement('img');
    img.src = posterUrl;
    img.alt = alt;
    posterP.append(img);
    content.push(posterP);

    const linkP = document.createElement('p');
    const a = document.createElement('a');
    a.href = videoUrl;
    a.textContent = title || videoUrl;
    linkP.append(a);
    content.push(linkP);
  } else {
    // plain <video> with a real source (no Dynamic Media data)
    const video = element.querySelector('video');
    const source = video && video.querySelector('source[src]');
    const src = video ? (video.getAttribute('src') || (source && source.getAttribute('src')) || '') : '';
    if (src && !/^blob:/i.test(src)) {
      const poster = video.getAttribute('poster');
      if (poster) {
        const p = document.createElement('p');
        const img = document.createElement('img');
        img.src = poster;
        img.alt = '';
        p.append(img);
        content.push(p);
      }
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = src;
      a.textContent = src;
      p.append(a);
      content.push(p);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'video-inline', cells: [[content]] });
  element.replaceWith(block);
}
