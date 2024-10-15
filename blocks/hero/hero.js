import { customDecoreateIcons, getTextLabel } from '../../scripts/scripts.js';

const addPauseButton = (block) => {
  const pauseButton = document.createElement('button');
  pauseButton.classList.add('hero-pause-button');
  pauseButton.setAttribute('aria-label', getTextLabel('pause'));
  pauseButton.innerHTML = `
    <span class="icon icon-pause"></span>
    <span class="icon icon-play hidden"></span>
  `;

  pauseButton.addEventListener('click', () => {
    const video = block.querySelector('video');
    const [pauseIcon, playIcon] = pauseButton.querySelectorAll('span');

    if (video.paused) {
      video.play();
      pauseIcon.classList.remove('hidden');
      playIcon.classList.add('hidden');
      pauseButton.setAttribute('aria-label', getTextLabel('pause'));
    } else {
      video.pause();
      pauseIcon.classList.add('hidden');
      playIcon.classList.remove('hidden');
      pauseButton.setAttribute('aria-label', getTextLabel('play'));
    }
  });

  customDecoreateIcons(pauseButton);
  block.append(pauseButton);
};

const addScrollIcon = (block) => {
  const scrollEl = document.createElement('span');
  scrollEl.classList.add('hero-scroll-icon');
  scrollEl.innerHTML = '<span class="icon icon-arrow-down"></span>';

  customDecoreateIcons(scrollEl);
  block.append(scrollEl);
};

const addLogoFlag = (block) => {
  const flagEl = document.createElement('span');
  flagEl.classList.add('hero-flag');
  flagEl.innerHTML = `
    <svg width="60" height="50" viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="8.57143" height="50" fill="#ED1C24"/>
      <rect x="17.1431" width="8.57143" height="50" fill="#ED1C24"/>
      <rect x="34.2856" width="8.57143" height="50" fill="black"/>
      <rect x="51.4287" width="8.57143" height="50" fill="black"/>
    </svg>
  `;
  customDecoreateIcons(flagEl);
  block.append(flagEl);
};

const calcTimeLeft = (eventDate) => {
  const currentDate = new Date();
  const timeDiff = eventDate - currentDate;
  const DAY = 24 * 60 * 60 * 1000; // day in miliseconds
  const HOUR = 60 * 60 * 1000; // hour in miliseconds
  const MINUTE = 60 * 1000; // minute in miliseconds

  if (timeDiff < 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
    };
  }

  const days = Math.floor(timeDiff / DAY);
  const hours = Math.floor((timeDiff % DAY) / HOUR);
  const minutes = Math.floor((timeDiff % HOUR) / MINUTE);

  return {
    days,
    hours,
    minutes,
  };
};

const generateTimeElements = (block) => {
  const timeElements = document.createRange().createContextualFragment(`
    <div class="hero-countdown">
        <div class="hero-time">
          <div class="hero-days"></div>
          <div class="hero-days-label"></div>
        </div>
        <div>:</div>
        <div class="hero-time">
          <div class="hero-hours"></div>
          <div class="hero-hours-label"></div>
        </div>
        <div>:</div>
        <div class="hero-time">
          <div class="hero-minutes"></div>
          <div class="hero-minutes-label"></div>
        </div>
      </div>
    </div>
  `);
  const mountPoint = [...block.querySelectorAll('p')].find((el) => el.textContent.toUpperCase() === '%TIME%');

  if (!mountPoint) {
    // eslint-disable-next-line no-console
    console.error('Hero block: The mount point for countdown not found. Plase make sure you put %TIME% in the separate paragraph!!!');
  }

  mountPoint.replaceWith(timeElements.children[0]);
};

const startCountdown = (block, eventDate) => {
  const MINUTE_IN_MILISECONDS = 60000;
  const daysEl = block.querySelector('.hero-days');
  const hoursEl = block.querySelector('.hero-hours');
  const minutesEl = block.querySelector('.hero-minutes');
  const daysLabel = block.querySelector('.hero-days-label');
  const hoursLabel = block.querySelector('.hero-hours-label');
  const minutesLabel = block.querySelector('.hero-minutes-label');

  const updateCountdow = () => {
    const { days, hours, minutes } = calcTimeLeft(eventDate);

    daysEl.textContent = days < 10 ? `0${days}` : days;
    hoursEl.textContent = hours < 10 ? `0${hours}` : hours;
    minutesEl.textContent = minutes < 10 ? `0${minutes}` : minutes;
    daysLabel.textContent = getTextLabel(days > 1 ? 'days' : 'day');
    hoursLabel.textContent = getTextLabel(hours > 1 ? 'hours' : 'hour');
    minutesLabel.textContent = getTextLabel(minutes > 1 ? 'minutes' : 'minute');
  };

  setInterval(updateCountdow, MINUTE_IN_MILISECONDS);
  updateCountdow();
};

export default function decorate(block) {
  const firstCell = block.querySelector(':scope > div > div');
  const picture = firstCell.querySelector('picture');
  const video = firstCell.querySelector('video');
  const headings = firstCell.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const links = firstCell.querySelectorAll('a');
  const dateEl = block.querySelector(':scope > div:nth-child(2) > div');

  if (picture) {
    picture.parentElement.replaceWith(picture);
  }

  if (video) {
    video.parentElement.classList.add('video-wrapper');
    addPauseButton(block);
  }

  const textWrapper = document.createElement('div');
  textWrapper.classList.add('hero-text-wrapper', 'h6', 'dark');
  textWrapper.append(...firstCell.querySelectorAll(':scope > *:not(picture, video)'));

  firstCell.append(textWrapper);
  headings.forEach((h) => { h.classList.add('h1'); });
  links.forEach((link, index) => { link.classList.add(index ? 'secondary' : 'primary'); });

  addScrollIcon(block);
  addLogoFlag(block);

  if (dateEl) {
    let date;
    try {
      date = new Date(dateEl.textContent);
      dateEl.remove();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('The 2nd row of data for the hero block should be a date.');
      return;
    }

    block.classList.add('countdown');
    textWrapper.classList.remove('h6');
    generateTimeElements(block);
    startCountdown(block, date);
  }
}
