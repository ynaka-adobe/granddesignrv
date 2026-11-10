import { createOptimizedPicture } from '../../scripts/aem.js';

function optimize(img) {
  const url = new URL(img.src, window.location.href);
  if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
  const pic = createOptimizedPicture(img.src, img.alt, true, [
    { media: '(min-width: 900px)', width: '1200' },
    { width: '750' },
  ]);
  img.closest('picture').replaceWith(pic);
}

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`columns-image-text-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-image-text-row');
    [...row.children].forEach((col) => {
      const pics = col.querySelectorAll('picture');
      if (pics.length === 1 && !col.textContent.trim()) {
        col.classList.add('columns-image-text-img-col');
        const img = pics[0].querySelector('img');
        if (img) optimize(img);
      } else {
        col.classList.add('columns-image-text-text-col');
      }
    });
  });

  // in the first section the photo is the page's largest paint: fetch it first
  if (block.closest('.section') === document.querySelector('main .section')) {
    const img = block.querySelector('.columns-image-text-img-col img');
    if (img) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
  }
}
