import { autoScrollSlidesWhenInView } from '../../scripts/helpers.js';

export default function decorate(block) {
  const animationTime = [...block.classList]
    .find((el) => el.startsWith('time-'))
    ?.split('time-')[1].replace('-', '.');
  const content = block.querySelector(':scope > div');
  content.classList.add('specification-content');
  const textContent = block.querySelector(':scope > div > div:first-child');
  const imagesWrapper = block.querySelector(':scope > div > div:nth-child(2)');
  const statisticsWrapper = document.createElement('div');

  statisticsWrapper.classList.add('specification-statistics');
  textContent.classList.add('specification-text-content');

  // adding proper styles for stats labels and values
  textContent.querySelectorAll('p').forEach((paragraph) => {
    const strongEls = paragraph.querySelectorAll('strong');
    const hasButton = paragraph.classList.contains('button-container');

    if (strongEls.length > 0) {
      paragraph.classList.add('font-small', 'specification-value');
      strongEls.forEach((s) => {
        s.classList.add('h5');
      });
    } else if (!hasButton) {
      paragraph.classList.add('font-small', 'specification-label');
    }
  });

  imagesWrapper.classList.add('specification-images');

  // grouping all of the stats label and values
  const specificationStatsWrapper = document.createElement('div');
  specificationStatsWrapper.classList.add('specification-stats-wrapper');
  textContent.insertBefore(specificationStatsWrapper, textContent.querySelector('.specification-label'));

  textContent.querySelectorAll('.specification-label').forEach((el) => {
    const stat = document.createElement('div');
    stat.classList.add('specification-stat');
    let valueEl = el.nextElementSibling;

    while (valueEl && valueEl.classList.contains('specification-value')) {
      const siblingEl = valueEl.nextElementSibling;
      stat.append(valueEl);
      valueEl = siblingEl;
    }

    stat.prepend(el);

    specificationStatsWrapper.append(stat);
  });

  const getActiveSlideIndex = () => [...block.querySelectorAll('.specification-images > *')]
    .findIndex((slide) => slide.classList.contains('active'));

  const scrollToSlide = (_, slideIndex) => {
    [...block.querySelectorAll('.specification-images > *')]
      .forEach((el, index) => {
        if (slideIndex === index) {
          el.style.opacity = '1';
          el.classList.add('active');
        } else {
          el.style.opacity = '0';
          el.classList.remove('active');
        }
      });
  };

  scrollToSlide(block, 0);

  const slideCount = block.querySelectorAll('.specification-images > *').length;

  autoScrollSlidesWhenInView(block, {
    getActiveIndex: getActiveSlideIndex,
    slideCount,
    scrollToSlide,
    animationTime,
  });
}
