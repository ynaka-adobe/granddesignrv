/* eslint-disable */
/* global WebImporter */

/**
 * columns parser (launch-page "performance details").
 * Source: .performancedetails > section.cmp-performance-details > .cmp-performance-details__inner
 *   h2                                   section heading ("Built On Proven Performance")
 *   .cmp-performance-details__grid > article.cmp-performance-details__group (one per column)
 *     h3                                 group heading
 *     ul.cmp-performance-details__list > li
 *       .cmp-performance-details__label + .cmp-performance-details__value   (spec list)
 *       .cmp-performance-details__copy (<strong> title + text)               (feature list)
 *   p.cmp-performance-details__note      footnote
 * Icons (<i class="fad ...">) carry no authorable content and are dropped.
 * Output: <h2> (default content), columns block with one row, one cell per group (the two
 * groups sit side by side on the source): [h3 + <ul> of "<strong>label</strong><br>value"],
 * then the note <p> (default content).
 */

function clean(text) {
  return (text || '').replace(/[ ​]/g, ' ').replace(/\s+/g, ' ').trim();
}

function listItem(document, li) {
  const item = document.createElement('li');
  const label = li.querySelector('.cmp-performance-details__label');
  const value = li.querySelector('.cmp-performance-details__value');
  const copy = li.querySelector('.cmp-performance-details__copy');
  if (label || value) {
    if (label && clean(label.textContent)) {
      const strong = document.createElement('strong');
      strong.textContent = clean(label.textContent);
      item.append(strong);
    }
    if (value && clean(value.textContent)) {
      if (item.childNodes.length) item.append(document.createElement('br'));
      item.append(document.createTextNode(clean(value.textContent)));
    }
  } else if (copy) {
    const title = copy.querySelector('strong, b');
    if (title && clean(title.textContent)) {
      const strong = document.createElement('strong');
      strong.textContent = clean(title.textContent);
      item.append(strong);
    }
    const rest = clean([...copy.childNodes].filter((n) => n !== title).map((n) => n.textContent).join(' '));
    if (rest) {
      if (item.childNodes.length) item.append(document.createElement('br'));
      item.append(document.createTextNode(rest));
    }
  } else if (clean(li.textContent)) {
    item.textContent = clean(li.textContent);
  }
  return clean(item.textContent) ? item : null;
}

export default function parse(element, { document }) {
  const inner = element.querySelector('.cmp-performance-details__inner') || element;
  const before = [];
  const after = [];

  const heading = [...inner.querySelectorAll('h2')].find((h) => !h.closest('.cmp-performance-details__group'));
  if (heading && clean(heading.textContent)) {
    const h2 = document.createElement('h2');
    h2.textContent = clean(heading.textContent);
    before.push(h2);
  }

  // one row, one column per group
  const row = [];
  inner.querySelectorAll('.cmp-performance-details__group').forEach((group) => {
    const cell = [];
    const title = group.querySelector('h3, h4');
    if (title && clean(title.textContent)) {
      const h3 = document.createElement('h3');
      h3.textContent = clean(title.textContent);
      cell.push(h3);
    }
    group.querySelectorAll('ul, ol').forEach((list) => {
      const ul = document.createElement('ul');
      [...list.children].filter((li) => li.tagName === 'LI').forEach((li) => {
        const item = listItem(document, li);
        if (item) ul.append(item);
      });
      if (ul.children.length) cell.push(ul);
    });
    if (cell.length) row.push(cell);
  });

  inner.querySelectorAll('.cmp-performance-details__note').forEach((note) => {
    if (!clean(note.textContent)) return;
    const p = document.createElement('p');
    p.textContent = clean(note.textContent);
    after.push(p);
  });

  if (!row.length) {
    element.replaceWith(...before, ...after);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells: [row] });
  element.replaceWith(...before, block, ...after);
}
