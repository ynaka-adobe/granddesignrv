const OPTIONS = {
  isProd: () => !['localhost', '127.0.0.1'].includes(window.location.hostname)
    && !/\.(aem|hlx)\.page$/.test(window.location.hostname),
  audiences: {
    mobile: () => window.innerWidth < 600,
    desktop: () => window.innerWidth >= 600,
  },
};

let plugin;

export function hasExperimentation(doc) {
  const namespace = /^(experiment|campaign|audience)(?:$|[\s:-])/i;
  return [...doc.head.querySelectorAll('meta[name], meta[property]')]
    .some((meta) => namespace.test(meta.getAttribute('name') || meta.getAttribute('property')))
    || [...doc.querySelectorAll('main > div')].some((section) => section.getAttributeNames()
      .some((name) => /^data-(experiment|campaign|audience)(?:$|[:-])/i.test(name)))
    || [...doc.querySelectorAll('.section-metadata > div > div:first-child')]
      .some((cell) => namespace.test(cell.textContent.trim()));
}

export async function runExperimentation(doc) {
  if (!hasExperimentation(doc)) return;
  try {
    // eslint-disable-next-line import/no-relative-packages
    plugin = await import('../plugins/experimentation/src/index.js');
    await plugin.loadEager(doc, OPTIONS);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('AEM experimentation could not be applied', error);
  }
}

export async function showExperimentationOverlay(doc) {
  if (!plugin) return;
  try {
    await plugin.loadLazy(doc, OPTIONS);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('AEM experimentation preview could not be loaded', error);
  }
}
