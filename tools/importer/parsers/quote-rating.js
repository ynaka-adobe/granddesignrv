/* eslint-disable */
/* global WebImporter */

/**
 * quote-rating parser (one block per .customercomment .q.grid-item).
 * Source: .q-content with CSS stars (.cmp-customercomments__stars--N containing
 * N <i class="cmp-customercomments__star">), .quote-body and .author.
 * Output (one column):
 *   row 1: <p>★★★★★</p> (N stars, parsed by quote-rating.js) + <p>quotation</p>
 *   row 2: <p>attribution</p>
 */

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function getRating(element) {
  const stars = element.querySelector('.cmp-customercomments__stars');
  if (!stars) return 0;
  const m = (stars.getAttribute('class') || '').match(/cmp-customercomments__stars--(\d+)/);
  let n = m ? parseInt(m[1], 10) : stars.querySelectorAll('.cmp-customercomments__star').length;
  if (!n || n < 0) return 0;
  return Math.min(n, 5);
}

export default function parse(element, { document }) {
  const cells = [];

  const quotation = [];
  const rating = getRating(element);
  if (rating) {
    const p = document.createElement('p');
    p.textContent = '★'.repeat(rating);
    quotation.push(p);
  }
  const body = element.querySelector('.quote-body');
  if (body && clean(body.textContent)) {
    const p = document.createElement('p');
    p.textContent = clean(body.textContent);
    quotation.push(p);
  }
  if (quotation.length) cells.push([quotation]);

  const author = element.querySelector('.author');
  if (author && clean(author.textContent)) {
    const p = document.createElement('p');
    p.textContent = clean(author.textContent);
    cells.push([p]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-rating', cells });
  element.replaceWith(block);
}
