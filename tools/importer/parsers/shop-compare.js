/* eslint-disable */
/* global WebImporter */

/**
 * shop-compare parser.
 * Source: the Shop and Compare floor plan finder (.brandFilter), a client-side app. Its listing comes
 * from the floor plan data sheet, so only its configuration is authored:
 *   Data              link to the data sheet (/data/floorplans.json)
 *   Category Order    category checkbox labels, in source order
 *   <filter name>     info tooltip text of each filter (Category, Sleeps, Weight, Length, Hitch-Weight)
 *   Dealer Stock Note note shown on dealer-stock cards
 *   Footnote          footnote under the comparison table
 * Output: key/value rows (cell 1 key, cell 2 value).
 *
 * The rendered result cards (.floor-plan-container) wrap <button>s in <a>s, an invalid nesting that
 * HTML parsers flatten, so their count and grouping differ between the live page and a re-parsed
 * copy. This parser therefore never iterates cards or buttons: it reads only the filter groups
 * (.filters details, a stable wrapper) and the text of the first dealer-stock note found in
 * document order, which is the same on every card.
 */

const DATA_PATH = '/data/floorplans.json';
// only rendered once the comparison dialog is filled in; this is the source's text
const DEFAULT_FOOTNOTE = '*Bathroom Access with slides in';

function clean(text) {
  return (text || '').replace(/[\u00a0\u200b]/g, (c) => (c === '\u200b' ? '' : ' ')).replace(/\s+/g, ' ').trim();
}

/* rich text limited to paragraphs, lists and bold, without attributes or empty nodes */
function richText(source, document) {
  const out = document.createElement('div');
  const copy = (from, to) => {
    from.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        to.append(document.createTextNode(node.textContent.replace(/\u00a0/g, ' ').replace(/\u200b/g, '')));
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName.toLowerCase();
      const keep = { p: 'p', ul: 'ul', ol: 'ol', li: 'li', b: 'strong', strong: 'strong', i: 'em', em: 'em', a: 'a' }[tag];
      if (!keep) { copy(node, to); return; }
      const el = document.createElement(keep);
      if (keep === 'a' && node.getAttribute('href')) el.setAttribute('href', node.getAttribute('href'));
      copy(node, el);
      if (clean(el.textContent)) to.append(el);
    });
  };
  copy(source, out);
  // loose text (no block wrapper) becomes a paragraph
  if (!out.querySelector('p, ul, ol') && clean(out.textContent)) {
    const p = document.createElement('p');
    p.append(...out.childNodes);
    out.append(p);
  }
  return [...out.childNodes].filter((n) => n.nodeType === 1 || clean(n.textContent));
}

function ownText(el) {
  return clean([...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' '));
}

const consumed = new WeakSet();

export default function parse(element, { document }) {
  if (consumed.has(element) || !element.isConnected) return;
  consumed.add(element);

  const rows = [];

  const link = document.createElement('a');
  link.href = DATA_PATH;
  link.textContent = DATA_PATH;
  rows.push(['Data', link]);

  const groups = [...element.querySelectorAll('.filters details')];
  const categoryGroup = groups.find((d) => /category/i.test(ownText(d.querySelector('summary h3') || d)));
  if (categoryGroup) {
    const names = [...categoryGroup.querySelectorAll('label')].map((l) => clean(l.textContent)).filter(Boolean);
    if (names.length) rows.push(['Category Order', names.join(', ')]);
  }

  groups.forEach((d) => {
    const heading = d.querySelector('summary h3');
    const tip = heading && heading.querySelector('.tooltip-text');
    const key = heading && ownText(heading);
    if (!key || !tip || !clean(tip.textContent)) return;
    rows.push([key, richText(tip, document)]);
  });

  // first note in document order (identical on every dealer-stock card)
  const note = element.querySelector('.info');
  if (note && clean(note.textContent)) rows.push(['Dealer Stock Note', richText(note, document)]);

  const dialogText = clean((element.querySelector('dialog') || {}).textContent);
  const match = dialogText.match(/\*Bathroom Access[^|]*?slides in/i);
  const footnote = document.createElement('p');
  footnote.textContent = match ? clean(match[0]) : DEFAULT_FOOTNOTE;
  rows.push(['Footnote', footnote]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'shop-compare', cells: rows });
  element.replaceWith(block);
}
