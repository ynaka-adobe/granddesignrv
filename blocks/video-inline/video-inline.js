/*
 * video-inline
 * Click-to-play inline video with a poster image. Nothing loads until the visitor
 * presses play; the video never autoplays on its own.
 *
 * Authoring (one cell): poster image + link to the video.
 *   Scene7 adaptive video sets (/is/content/<company>/<name>-AVS) play as HLS where the
 *   browser supports it, otherwise as the set's progressive MP4 rendition (and its
 *   caption track when the set has one). Plain .mp4/.webm and other /is/content/ links
 *   play directly.
 */

let instance = 0;

const VIDEO_LINK = /(\/is\/content\/|\.(mp4|webm|mov|m4v|m3u8)(\?|#|$))/i;

function findVideoLink(block) {
  const links = [...block.querySelectorAll('a[href]')];
  return links.find((a) => VIDEO_LINK.test(a.href)) || links[0] || null;
}

function isScene7Set(url) {
  return url.pathname.startsWith('/is/content/') && !/\.[a-z0-9]{2,4}$/i.test(url.pathname);
}

/** read a Scene7 video set: best progressive MP4 for this viewport + caption track */
async function resolveScene7Set(url) {
  const company = url.pathname.replace('/is/content/', '');
  const res = await fetch(`${url.origin}/is/image/${company}?req=set,json`);
  if (!res.ok) throw new Error(`video set ${res.status}`);
  const text = await res.text();
  const json = JSON.parse(text.replace(/^[^(]*\(/, '').replace(/,\s*"[^"]*"\s*\);?\s*$/, ''));
  const items = [].concat(json?.set?.item || []);

  const target = window.innerWidth < 900 ? 730 : 1080;
  const videos = items
    .filter((item) => item.v && item.v.suffix === 'mp4')
    .map((item) => ({ path: item.v.path, height: Number(item.v.dy) || 0 }))
    .sort((a, b) => a.height - b.height);
  const fit = videos.filter((v) => v.height <= target);
  const pick = fit[fit.length - 1] || videos[0];

  const vtt = items.find((item) => item.c && item.c.suffix === 'vtt');
  return {
    src: pick ? `${url.origin}/is/content/${pick.path}` : '',
    captions: vtt ? `${url.origin}/is/content/${vtt.c.path}` : '',
  };
}

async function resolveSources(href) {
  const url = new URL(href, window.location.href);
  if (!isScene7Set(url)) return { src: url.href, captions: '' };

  const probe = document.createElement('video');
  if (probe.canPlayType('application/vnd.apple.mpegurl')) {
    return { src: `${url.href}.m3u8`, captions: '', hls: true };
  }
  try {
    const set = await resolveScene7Set(url);
    if (set.src) return set;
  } catch (e) {
    // fall through to the HLS manifest; some browsers can still play it
  }
  return { src: `${url.href}.m3u8`, captions: '', hls: true };
}

function sourceType(src, hls) {
  if (hls || /\.m3u8(\?|#|$)/i.test(src)) return 'application/vnd.apple.mpegurl';
  if (/\.webm(\?|#|$)/i.test(src)) return 'video/webm';
  return 'video/mp4';
}

async function play(block, href, label, button) {
  if (block.dataset.videoStatus) return;
  block.dataset.videoStatus = 'loading';
  button.disabled = true;

  const { src, captions, hls } = await resolveSources(href);
  const video = document.createElement('video');
  video.className = 'video-inline-player';
  video.controls = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.preload = 'auto';
  if (label) video.setAttribute('aria-label', label);
  const poster = block.querySelector('.video-inline-poster img');
  if (poster) video.poster = poster.currentSrc || poster.src;

  const source = document.createElement('source');
  source.src = src;
  source.type = sourceType(src, hls);
  video.append(source);

  if (captions) {
    const track = document.createElement('track');
    track.kind = 'captions';
    track.src = captions;
    track.srclang = document.documentElement.lang || 'en';
    track.label = 'Captions';
    video.append(track);
  }

  block.querySelector('.video-inline-stage').append(video);
  block.dataset.videoStatus = 'playing';
  video.play().then(() => video.focus()).catch(() => {
    // playback refused (e.g. data saver): the native controls stay available
    video.focus();
  });
}

export default function decorate(block) {
  instance += 1;
  const picture = block.querySelector('picture');
  const link = findVideoLink(block);
  if (!link) return;
  const { href } = link;
  const linkText = link.textContent.trim();
  const img = picture?.querySelector('img');
  const label = (img && img.alt) || (linkText && !VIDEO_LINK.test(linkText) ? linkText : '') || 'Video';

  const stage = document.createElement('div');
  stage.className = 'video-inline-stage';

  if (picture) {
    const poster = document.createElement('div');
    poster.className = 'video-inline-poster';
    if (img) img.loading = 'lazy';
    poster.append(picture);
    stage.append(poster);
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'video-inline-play';
  button.setAttribute('aria-label', `Play video: ${label}`);
  button.id = `video-inline-${instance}-play`;
  const icon = document.createElement('span');
  icon.className = 'video-inline-play-icon';
  icon.setAttribute('aria-hidden', 'true');
  button.append(icon);
  stage.append(button);

  block.replaceChildren(stage);

  const start = () => play(block, href, label, button);
  button.addEventListener('click', start);
  stage.querySelector('.video-inline-poster')?.addEventListener('click', start);
}
