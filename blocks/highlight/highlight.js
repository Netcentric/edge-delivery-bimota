import { isInViewport, onSlideUpOrDown, throttle } from '../../scripts/helpers.js';

const setScaleForPicture = (block, picture, onSetScale) => {
  const setScale = () => {
    const isNotMobile = window.matchMedia('(width >= 768px)').matches;
    const mobileAspectRatio = 3 / 4;
    const noneMobileAspectRatio = 16 / 9;
    const aspectRatio = isNotMobile ? noneMobileAspectRatio : mobileAspectRatio;

    const maxWidth = document.body.clientWidth;
    const maxHeight = maxWidth / aspectRatio;

    const initialWidth = block.clientWidth;
    block.style.height = maxHeight;

    const initScale = initialWidth / maxWidth;

    picture.style.transform = `scale(${initScale})`;
    onSetScale(initScale);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0) {
        setScale(block, picture);
        observer.disconnect();
      }
    });
  }, { threshold: [0.1], rootMargin: '100px' });

  observer.observe(block);

  window.addEventListener('resize', throttle(() => {
    setScale(block, picture);
  }, 250));
};

const getActiveSlideIndex = (block) => [...block.querySelectorAll('.highlight-slide')]
  .findIndex((slide) => slide.classList.contains('active'));

const scrollToSlide = (slidersContainer, slideIndex) => {
  slidersContainer.style.transform = `translateY(-${slideIndex * 100}%)`;
  slidersContainer.querySelectorAll('.highlight-slide').forEach((slide, index) => {
    const addOrRemove = index === slideIndex ? 'add' : 'remove';
    slide.classList[addOrRemove]('active');
  });
};

const trapScrollingForSlides = (block, {
  hasNextSlide, hasPrevSlide, move,
}) => {
  let restoreScolling = null;
  let prevY = window.scrollY;
  let blockedScrollYPosition = null;
  let paused = false;

  window.addEventListener('scroll', () => {
    if (paused) {
      window.scrollTo({ top: blockedScrollYPosition, behavior: 'instant' });
      return;
    }

    const hasSlideInDirection = prevY < window.scrollY ? hasNextSlide() : hasPrevSlide();
    prevY = window.scrollY;

    if (isInViewport(block)) {
      block.classList.add('active');

      if (hasSlideInDirection) {
        paused = true;
        blockedScrollYPosition = window.scrollY;

        window.scrollTo({ top: blockedScrollYPosition, behavior: 'instant' });
        restoreScolling = onSlideUpOrDown({
          move: (direction) => move(direction, restoreScolling),
          onEnd: () => { paused = false; },
        });
        return;
      }
    } else {
      block.classList.remove('active');
    }

    if (restoreScolling) {
      restoreScolling();
      restoreScolling = null;
    }
  });
};

const addFlag = (block) => {
  const falgEl = `
    <svg width="60" height="50" viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="8.57143" height="50" fill="#ED1C24"/>
      <rect x="17.1431" width="8.57143" height="50" fill="#ED1C24"/>
      <rect x="34.2856" width="8.57143" height="50" fill="black"/>
      <rect x="51.4287" width="8.57143" height="50" fill="black"/>
    </svg>
  `;

  const flagWrapper = document.createElement('div');
  flagWrapper.classList.add('flag-wrapper');
  flagWrapper.innerHTML = (falgEl);
  block.append(flagWrapper);
};

export default async function decorate(block) {
  const [pictureWrapper, ...slides] = block.querySelectorAll(':scope > div');
  const slidesWrapper = document.createElement('div');
  const slidesContainer = document.createElement('div');

  slides.forEach((slide, index) => {
    slide.classList.add('highlight-slide');
    slide.querySelectorAll('h1, h2, h3, h4, h5, h6')
      .forEach((heading) => heading.classList.add('h1'));

    if (index === 0) {
      slide.classList.add('active');
    }
  });

  slidesWrapper.classList.add('highlight-slides-wrapper');
  slidesContainer.classList.add('highlight-slides-container', 'h6');
  slidesContainer.append(...slides);
  slidesWrapper.append(slidesContainer);
  block.append(slidesWrapper);

  const picture = pictureWrapper.querySelector('picture');
  pictureWrapper.replaceWith(picture);

  addFlag(block);
  const onSetScaleForPicture = (value) => {
    const space = ((1 - value) / 2) * 100;
    block.style.setProperty('--flag-margin', `${space}%`);
  };
  setScaleForPicture(block, picture, onSetScaleForPicture);

  // trapping the scrolling so the user will scroll the next slides of the slider
  const container = block.querySelector('.highlight-slides-container');
  const hasPrevSlide = () => {
    const activeSlideIndex = getActiveSlideIndex(block);
    return activeSlideIndex > 0;
  };

  const hasNextSlide = () => {
    const activeSlideIndex = getActiveSlideIndex(block);
    const slideCount = block.querySelectorAll('.highlight-slide').length;

    return activeSlideIndex < slideCount - 1;
  };

  const prevSlide = (onNoPreSlide) => {
    const activeSlideIndex = getActiveSlideIndex(block);

    if (!hasPrevSlide()) {
      onNoPreSlide();
      return;
    }

    scrollToSlide(container, activeSlideIndex - 1);
  };
  const nextSlide = (onNoNextSlide) => {
    const activeSlideIndex = getActiveSlideIndex(block);

    if (!hasNextSlide()) {
      onNoNextSlide();
      return;
    }

    scrollToSlide(container, activeSlideIndex + 1);
  };

  const move = throttle((direction, onNoSlide) => {
    if (direction === 'up') {
      if (!hasPrevSlide()) {
        onNoSlide();
        return;
      }

      prevSlide();
    } else {
      if (!hasNextSlide()) {
        onNoSlide();
        return;
      }

      nextSlide();
    }
  }, 1000);

  trapScrollingForSlides(block, {
    hasNextSlide, hasPrevSlide, move,
  });
}
