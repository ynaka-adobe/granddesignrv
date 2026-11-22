function hostUrl() {
  const params = new URLSearchParams(window.location.search);
  const referrer = params.get('referrer') || document.referrer;
  if (!referrer) throw new Error('Open Audiences from the Sidekick on a site page.');
  const url = new URL(referrer);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Unsupported page URL.');
  return url;
}

function audienceRows(section, host) {
  const excluded = ['manifest', 'resolution'];
  const fromAttributes = section.getAttributeNames()
    .map((attribute) => [attribute, /^data-audience[:-]+([a-z0-9][a-z0-9-]*)$/i.exec(attribute)])
    .filter(([, match]) => match && !excluded.includes(match[1].toLowerCase()))
    .map(([attribute, match]) => ({
      name: match[1].toLowerCase(),
      variant: new URL(section.getAttribute(attribute), host).pathname,
    }));
  const fromBlocks = [...section.querySelectorAll('.section-metadata > div')]
    .map((row) => {
      const [key, value] = [...row.children];
      const match = /^audience[\s:-]+([a-z0-9][a-z0-9-]*)$/i.exec(key?.textContent.trim() || '');
      if (!match || excluded.includes(match[1].toLowerCase()) || !value) return null;
      const link = value.querySelector('a');
      return {
        name: match[1].toLowerCase(),
        variant: new URL(link?.getAttribute('href') || value.textContent.trim(), host).pathname,
      };
    })
    .filter(Boolean);
  return [...new Map([...fromAttributes, ...fromBlocks]
    .map((audience) => [audience.name, audience])).values()];
}

function navigate(host, audience) {
  const url = new URL(host);
  url.searchParams.delete('audience');
  if (audience) url.searchParams.set('audience', audience);
  window.open(url.href, '_top');
}

function render(entries, host) {
  const list = document.getElementById('aud-list');
  list.replaceChildren();
  entries.forEach(({ label, audiences }) => {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = label;
    item.append(title);
    [...audiences, { name: 'default', variant: 'Default content' }].forEach((audience) => {
      const row = document.createElement('div');
      row.className = 'aud-row';
      const text = document.createElement('span');
      text.textContent = `${audience.name}: ${audience.variant}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Preview';
      button.setAttribute('aria-label', `Preview ${audience.name} for ${label}`);
      button.addEventListener('click', () => navigate(host, audience.name));
      row.append(text, button);
      item.append(row);
    });
    list.append(item);
  });
}

(async function init() {
  const status = document.getElementById('aud-status');
  try {
    const host = hostUrl();
    document.getElementById('aud-page').textContent = `${host.origin}${host.pathname}`;
    document.getElementById('aud-reset').addEventListener('click', () => navigate(host));
    // Use the palette's code origin to avoid cross-origin reads on production domains.
    const path = host.pathname.endsWith('/') ? `${host.pathname}index` : host.pathname;
    const response = await fetch(`${path.replace(/\.html$/, '')}.plain.html`, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Page returned ${response.status}`);
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const entries = [...doc.querySelectorAll('body > div, main > div')]
      .map((section, index) => ({
        label: section.querySelector('h1, h2, h3')?.textContent.trim() || `Section ${index + 1}`,
        audiences: audienceRows(section, host),
      }))
      .filter((entry) => entry.audiences.length);
    status.textContent = entries.length
      ? `${entries.length} section(s) with audiences.`
      : 'No section on this page declares an audience.';
    render(entries, host);
  } catch (error) {
    status.textContent = `Could not read the page: ${error.message}`;
  }
}());
