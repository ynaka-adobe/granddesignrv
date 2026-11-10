import { createOptimizedPicture, fetchPlaceholders } from '../../scripts/aem.js';

/*
 * carousel-hero: full-bleed hero carousel.
 * Authoring: one row per slide; cell 1 = slide image, cell 2 = heading, text, CTA (optional).
 * Indicator tabs use the slide heading text when one exists, so they can read as labels.
 */

const AUTOPLAY_DELAY = 5000; // source carousel: data-cmp-autoplay, data-cmp-delay="5000"

// slides keep their own height (as on the source), so the track follows the active slide
function syncTrackHeight(block) {
  const track = block.querySelector('.carousel-hero-slides');
  const active = block.querySelectorAll('.carousel-hero-slide')[parseInt(block.dataset.activeSlide || 0, 10)];
  if (track && active) track.style.height = `${active.offsetHeight}px`;
}

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-hero');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;
  syncTrackHeight(block);

  block.querySelectorAll('.carousel-hero-slide').forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) link.setAttribute('tabindex', '-1');
      else link.removeAttribute('tabindex');
    });
  });

  block.querySelectorAll('.carousel-hero-slide-indicator').forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', 'true');
      button.setAttribute('aria-current', 'true');
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-hero-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-hero-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-hero-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.carousel-hero-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.carousel-hero-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-hero-slide').forEach((slide) => slideObserver.observe(slide));

  // keep the track height in step with the active slide when the layout reflows
  new ResizeObserver(() => syncTrackHeight(block))
    .observe(block.querySelector('.carousel-hero-slides'));
}

function bindAutoplay(block, toggle, labels) {
  let timer;
  let paused = false; // transient: hover / focus inside the carousel
  // persistent: the user pressed pause (WCAG 2.2.2); reduced motion starts stopped
  let stopped = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stop = () => { clearInterval(timer); timer = undefined; };
  const start = () => {
    stop();
    if (paused || stopped) return;
    timer = setInterval(() => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    }, AUTOPLAY_DELAY);
  };
  const pause = () => { paused = true; stop(); };
  const resume = () => { paused = false; start(); };
  const syncToggle = () => {
    toggle.setAttribute('aria-label', stopped ? labels.play : labels.pause);
    toggle.classList.toggle('is-stopped', stopped);
  };

  toggle.addEventListener('click', () => {
    stopped = !stopped;
    syncToggle();
    start();
  });
  block.addEventListener('mouseenter', pause);
  block.addEventListener('mouseleave', resume);
  block.addEventListener('focusin', pause);
  block.addEventListener('focusout', (e) => {
    if (!block.contains(e.relatedTarget)) resume();
  });
  // restart the countdown after a manual slide change
  block.querySelector('.carousel-hero-slide-indicators').addEventListener('click', start);
  syncToggle();
  start();
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-hero-${carouselId}-slide-${slideIndex}`;
  slide.classList.add('carousel-hero-slide');

  const columns = [...row.querySelectorAll(':scope > div')];
  columns.forEach((column, colIdx) => {
    // a single cell holding only a picture is treated as the image cell
    const isImage = colIdx === 0 && column.querySelector('picture')
      && column.textContent.trim() === '';
    column.classList.add(isImage ? 'carousel-hero-slide-image' : 'carousel-hero-slide-content');
    if (!column.children.length && !column.textContent.trim()) return;
    slide.append(column);
  });

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    if (!heading.id) heading.id = `${slide.id}-title`;
    slide.setAttribute('aria-labelledby', heading.id);
  }

  return slide;
}

function optimizeImages(block) {
  block.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, true, [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }]));
  });

  // first slide image is the LCP candidate; later slides start hidden
  block.querySelectorAll('.carousel-hero-slide').forEach((slide, idx) => {
    const img = slide.querySelector('.carousel-hero-slide-image img');
    if (!img) return;
    if (idx === 0) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    } else {
      img.loading = 'lazy';
      img.fetchPriority = 'low';
    }
  });
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.id = `carousel-hero-${carouselId}`;
  const rows = [...block.querySelectorAll(':scope > div')];
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  const { carousel: roleDescription } = placeholders;
  block.setAttribute('aria-roledescription', roleDescription || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-hero-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-hero-slides');

  let slideIndicators;
  let autoplayToggle;
  const autoplayLabels = {
    pause: placeholders.pauseSlideshow || 'Pause slideshow',
    play: placeholders.playSlideshow || 'Play slideshow',
  };
  if (!isSingleSlide) {
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-hero-slide-indicators');
    autoplayToggle = document.createElement('button');
    autoplayToggle.type = 'button';
    autoplayToggle.className = 'carousel-hero-autoplay-toggle';
    nav.append(autoplayToggle, slideIndicators);
    block.append(nav);

    const navButtons = document.createElement('div');
    navButtons.classList.add('carousel-hero-navigation-buttons');
    navButtons.innerHTML = `
      <button type="button" class="carousel-hero-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="carousel-hero-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;
    container.append(navButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-hero-slide-indicator');
      indicator.dataset.targetSlide = idx;
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-controls', slide.id);
      const label = slide.querySelector('h1, h2, h3, h4, h5, h6')?.textContent.trim();
      const fallback = `${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}`;
      button.setAttribute('aria-label', label || fallback);
      const text = document.createElement('span');
      text.className = 'carousel-hero-slide-indicator-label';
      text.textContent = label || `${idx + 1}`;
      button.append(text);
      indicator.append(button);
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);
  optimizeImages(block);

  if (!isSingleSlide) {
    block.dataset.activeSlide = 0;
    bindEvents(block);
    bindAutoplay(block, autoplayToggle, autoplayLabels);
  }
}
