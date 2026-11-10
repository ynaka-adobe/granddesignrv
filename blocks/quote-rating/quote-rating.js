/*
 * quote-rating: testimonial with a star rating, quotation and attribution.
 * Authoring: row 1 = quotation (optional first line holding the rating, e.g. "★★★★★",
 * "5", "5/5" or "Rating: 5"), row 2 = attribution (author, location).
 * A star line in the quotation is lifted into a rating element.
 */

const MAX_RATING = 5;

function parseRating(text) {
  const t = text.trim();
  if (!t) return null;
  const stars = t.match(/^[★☆*\s]+$/);
  if (stars) {
    const filled = (t.match(/[★*]/g) || []).length;
    return filled > 0 && filled <= MAX_RATING ? filled : null;
  }
  const num = t.match(/^(?:rating:?\s*)?(\d(?:\.\d)?)\s*(?:\/\s*5|out of 5)?\s*(?:stars?)?$/i);
  if (num) {
    const value = parseFloat(num[1]);
    return value > 0 && value <= MAX_RATING ? value : null;
  }
  return null;
}

function buildRating(value) {
  const rating = document.createElement('div');
  rating.className = 'quote-rating-stars';
  rating.dataset.rating = value;
  rating.setAttribute('role', 'img');
  rating.setAttribute('aria-label', `${value} out of ${MAX_RATING} stars`);
  for (let i = 1; i <= MAX_RATING; i += 1) {
    const star = document.createElement('span');
    star.className = 'quote-rating-star';
    if (i <= Math.floor(value)) star.classList.add('quote-rating-star-full');
    else if (i - value < 1) star.classList.add('quote-rating-star-half');
    star.setAttribute('aria-hidden', 'true');
    rating.append(star);
  }
  return rating;
}

export default async function decorate(block) {
  // accept one cell per row, or both cells in a single row
  const cells = [...block.children].flatMap((row) => [...row.children]);
  const [quotation, attribution] = cells;
  const blockquote = document.createElement('blockquote');

  if (quotation) {
    // wrap a bare text cell so the rating line can be detected
    if (!quotation.children.length && quotation.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = quotation.textContent;
      quotation.textContent = '';
      quotation.append(p);
    }
    const first = quotation.firstElementChild;
    const value = first ? parseRating(first.textContent) : null;
    if (value !== null) {
      blockquote.append(buildRating(value));
      first.remove();
    }
    quotation.className = 'quote-rating-quotation';
    blockquote.append(quotation);
  }

  if (attribution && attribution.textContent.trim()) {
    attribution.className = 'quote-rating-attribution';
    attribution.querySelectorAll('em').forEach((em) => {
      const cite = document.createElement('cite');
      cite.innerHTML = em.innerHTML;
      em.replaceWith(cite);
    });
    blockquote.append(attribution);
  }

  block.textContent = '';
  block.append(blockquote);
}
