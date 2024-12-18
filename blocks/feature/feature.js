import {
  onAppReady,
} from '../../scripts/helpers.js';

const setActiveSlide = (newActiveIndex, block) => {
  const slides = block.querySelectorAll('.feature-slides > div');
  const navItems = [...block.querySelectorAll('.feature-slide-nav-item')];

  slides.forEach((slide, index) => {
    if (newActiveIndex === index) {
      slide.style.opacity = '1';
      slide.style.zIndex = '1';
      slide.classList.add('active');
      navItems[index].classList.add('active');
    } else {
      slide.style.opacity = '0';
      slide.style.zIndex = '0';
      slide.classList.remove('active');
      navItems[index].classList.remove('active');
    }
  });
};

const createNavigation = (block, slideCount, onClick) => {
  const slidesDots = (new Array(slideCount))
    .fill(0)
    .map((_, index) => {
      const navItem = document.createElement('button');
      navItem.classList.add('feature-slide-nav-item');

      if (!index) {
        navItem.classList.add('active');
      }

      const dotEl = document.createElement('span');
      dotEl.classList.add('feature-slide-nav-dot');
      dotEl.textContent = index + 1;

      navItem.append(dotEl);
      navItem.addEventListener('click', () => onClick(index, block));

      return navItem;
    });

  const wrapper = document.createElement('div');
  wrapper.classList.add('feature-slides-nav');
  wrapper.append(...slidesDots);
  block.append(wrapper);
};

export default async function decorate(block) {
  const slideCount = block.querySelectorAll(':scope > div').length;
  const slideWrapper = document.createElement('div');
  slideWrapper.classList.add('feature-slides');

  block.querySelectorAll(':scope > div').forEach((el, index) => {
    if (!index) {
      el.replaceWith(slideWrapper);
    }

    el.classList.add('feature-slide');
    slideWrapper.append(el);
  });

  block.querySelectorAll('.feature-slides > div > div').forEach((column) => {
    const type = column.querySelector('picture') ? 'image' : 'text';
    column.classList.add(`feature-${type}`);
  });

  const headings = block.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headings.forEach((heading) => {
    heading.classList.add('h5');
  });

  createNavigation(block, slideCount, setActiveSlide);
  setActiveSlide(0, block);

  // making sure that the slide gets enought space to display slide navigation
  const onResize = () => {
    const firstTextEl = block.querySelector('.feature-text');
    const navEl = block.querySelector('.feature-slides-nav');
    const minHeight = window.getComputedStyle(navEl).height;

    firstTextEl.style.minHeight = `calc(${minHeight} + 20px)`;
  };

  onAppReady(onResize);

  window.addEventListener('resize', onResize);
}
