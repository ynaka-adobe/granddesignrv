function audiencePaletteVisible(sidekick) {
  const roots = [sidekick];
  for (let index = 0; index < roots.length; index += 1) {
    const root = roots[index];
    if ([...root.querySelectorAll('iframe[src]')].some((frame) => {
      const url = new URL(frame.getAttribute('src'), window.location.href);
      return url.pathname === '/tools/audiences/audiences.html'
        && frame.getClientRects().length > 0;
    })) return true;
    if (root.shadowRoot) roots.push(root.shadowRoot);
    root.querySelectorAll('*').forEach((element) => {
      if (element.shadowRoot) roots.push(element.shadowRoot);
    });
  }
  return false;
}

function controlledSections() {
  const audienceKey = /^data-audience[:-]+(?!manifest$|resolution$)[a-z0-9][a-z0-9-]*$/i;
  return [...document.querySelectorAll('main[data-audience], main [data-audience], main > div')].filter((element) => {
    if (element.hasAttribute('data-audience')) return true;
    if (element.parentElement?.tagName !== 'MAIN') return false;
    return element.getAttributeNames().some((name) => audienceKey.test(name))
      || [...element.querySelectorAll('.section-metadata > div > div:first-child')]
        .some((cell) => /^audience[\s:-]+(?!manifest$|resolution$)[a-z0-9][a-z0-9-]*$/i
          .test(cell.textContent.trim()));
  });
}

export default function watchAudiencePalette(sidekick) {
  let timer;
  const marked = new Set();
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('../styles/audience-debug.css', import.meta.url).href;
  const setEnabled = (enabled) => {
    document.body.classList.toggle('audience-debug', enabled);
    const sections = enabled ? controlledSections() : [];
    marked.forEach((section) => {
      if (!sections.includes(section)) {
        delete section.dataset.audienceDebug;
        marked.delete(section);
      }
    });
    sections.forEach((section) => {
      // AEM leaves unmatched sections unmarked; their original content is the control.
      section.dataset.audienceDebug = section.dataset.audience || 'default';
      marked.add(section);
    });
    if (enabled && !stylesheet.isConnected) document.head.append(stylesheet);
    if (!enabled) stylesheet.remove();
  };
  const stop = () => {
    clearInterval(timer);
    setEnabled(false);
    window.removeEventListener('pagehide', stop);
  };
  const refresh = () => {
    if (!sidekick.isConnected) {
      stop();
      return;
    }
    setEnabled(audiencePaletteVisible(sidekick));
  };
  // Palette close/reopen and new nested shadow roots do not emit a public Sidekick event.
  timer = setInterval(refresh, 250);
  window.addEventListener('pagehide', stop);
  refresh();
  return stop;
}
