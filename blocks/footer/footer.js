/*
 * Footer: renders the footer fragment (footer.plain.html). All copy, links and images come from
 * the fragment; this block only adds layout classes and turns icon images into tintable icons.
 *   section 1: link columns (heading + list, repeated)
 *   sections 2-8: brand logo, address, phone numbers, disclaimer, legal links, social icons, CTA
 */

async function fetchFooter() {
  // metadata-independent: /content first (local preview), then root (DA/EDS)
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  // resolve fragment-relative image paths against the fragment URL
  tmp.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  return tmp;
}

/* group each heading with the list that follows it into a column */
function buildColumns(section) {
  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  [...section.querySelectorAll(':scope > h2, :scope > h3')].forEach((heading) => {
    const column = document.createElement('div');
    column.className = 'footer-column';
    const list = heading.nextElementSibling;
    column.append(heading);
    if (list && list.tagName === 'UL') column.append(list);
    columns.append(column);
  });
  section.replaceChildren(columns);
}

/* icon-only links: the image becomes a CSS mask so the icon can take the link colour */
function decorateIconLinks(section) {
  section.querySelectorAll('a').forEach((a) => {
    const img = a.querySelector('img');
    if (!img || a.textContent.trim()) return;
    a.setAttribute('aria-label', img.alt);
    const icon = document.createElement('span');
    icon.className = 'footer-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.style.setProperty('--icon', `url("${img.src}")`);
    img.replaceWith(icon);
  });
}

export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const footer = document.createElement('div');
  footer.className = 'footer-inner';
  const sections = [...fragment.children].filter((el) => el.tagName === 'DIV');
  const names = ['links', 'brand', 'address', 'contact', 'legal-notice', 'legal-links', 'social', 'cta'];
  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';

  sections.forEach((section, i) => {
    section.className = `footer-section footer-${names[i] || `section-${i + 1}`}`;
    if (i === 0) {
      buildColumns(section);
      footer.append(section);
    } else {
      bottom.append(section);
    }
  });

  const social = bottom.querySelector('.footer-social');
  if (social) decorateIconLinks(social);
  const cta = bottom.querySelector('.footer-cta a');
  if (cta) cta.className = 'footer-cta-link';

  footer.append(bottom);
  block.append(footer);
}
