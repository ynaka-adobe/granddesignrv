const MEDIA_SERVER = 'https://gdrv.scene7.com';

export function buildImageURL(rows) {
  let assetID;
  let preset;
  let type = 'image';
  const params = new URLSearchParams();
  rows.forEach(([key, value]) => {
    const name = key.trim();
    // eslint-disable-next-line no-control-regex
    if (!name || /[\u0000-\u001f\u007f]/.test(name)) {
      throw new Error('Each row needs a valid parameter name.');
    }
    if (name.toLowerCase() === 'assetid') assetID = value.trim();
    else if (name.toLowerCase().replace(/[\s_-]/g, '') === 'imagepreset') preset = value.trim();
    else if (name.toLowerCase() === 'type') type = value.trim().toLowerCase();
    else params.set(name, value.trim());
  });
  if (!assetID) throw new Error('Add an assetID row with a non-empty asset ID.');
  const segments = assetID.split('/');
  // eslint-disable-next-line no-control-regex
  if (/[:\\\u0000-\u001f\u007f]/.test(assetID)
      || segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    throw new Error('assetID must be an asset path, not a URL or a relative traversal path.');
  }
  if (!['image', 'content'].includes(type)) {
    throw new Error('type must be image or content.');
  }
  const url = new URL(`${MEDIA_SERVER}/is/${type}/granddesignrv/${segments.map(encodeURIComponent).join('/')}`);
  const query = [];
  if (preset !== undefined) {
    const name = preset.startsWith('$') && preset.endsWith('$') ? preset.slice(1, -1) : preset;
    // eslint-disable-next-line no-control-regex
    if (!name.trim() || /[$\u0000-\u001f\u007f]/.test(name)) {
      throw new Error('image preset must be a non-empty name, optionally wrapped once in dollar signs.');
    }
    query.push(`$${encodeURIComponent(name)}$`);
  }
  if (params.size) query.push(params.toString());
  url.search = query.join('&');
  return { url: url.href, assetID };
}

function showError(block, message) {
  const error = document.createElement('p');
  error.className = 'dynamic-media-error';
  error.setAttribute('role', 'alert');
  error.textContent = `Dynamic Media: ${message}`;
  block.replaceChildren(error);
  // eslint-disable-next-line no-console
  console.error(error.textContent);
}

export default function decorate(block) {
  let image;
  try {
    const rows = [...block.children].map((row) => {
      if (row.children.length !== 2) throw new Error('Use exactly two cells per row: key and value.');
      return [...row.children].map((cell) => cell.textContent.trim());
    });
    image = buildImageURL(rows);
  } catch (error) {
    showError(block, error.message);
    return;
  }
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.alt = image.assetID;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener('error', () => {
    showError(block, 'The image could not load. Check the asset ID, parameters and Dynamic Media publication.');
  }, { once: true });
  img.src = image.url;
  picture.append(img);
  block.replaceChildren(picture);
}
