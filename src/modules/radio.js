import { RADIO_STATIONS } from './streams.js';
import { icon, equalizerMarkup } from './utils.js';

function stationCardMarkup(station) {
  const style = `--logo-bg:${station.logoBg};--logo-ink:${station.logoInk};--station-accent:${station.accent}`;
  return `
    <li class="station-card" data-station-id="${station.id}" style="${style}">
      <button class="station-card__button" type="button" aria-pressed="false">
        <span class="station-card__head">
          <span class="station-card__logo" data-brand="${station.id}">${station.logoText}</span>
          ${equalizerMarkup()}
        </span>
        <span class="station-card__frequency">${station.frequency}</span>
        <span class="station-card__city">${station.city}</span>
        <span class="station-card__foot">
          <span class="live-badge" data-badge hidden><span class="live-badge__dot" aria-hidden="true"></span>EN DIRECTO</span>
          <span class="station-card__action" aria-hidden="true">${icon('play')}${icon('pause', { hidden: true })}</span>
          <span class="visually-hidden" data-state-label></span>
        </span>
      </button>
    </li>`;
}

export function initRadioView({ onSelect }) {
  const grid = document.querySelector('#station-grid');
  grid.innerHTML = RADIO_STATIONS.map(stationCardMarkup).join('');

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('.station-card__button');
    if (!button) return;
    const card = button.closest('.station-card');
    const station = RADIO_STATIONS.find((item) => item.id === card.dataset.stationId);
    if (station) onSelect(station);
  });

  return function updateRadioView({ current, state }) {
    const activeId = current?.kind === 'radio' ? current.id : null;

    for (const card of grid.querySelectorAll('.station-card')) {
      const isActive = card.dataset.stationId === activeId;
      const isPlaying = isActive && state === 'playing';
      const isLoading = isActive && state === 'loading';
      const button = card.querySelector('.station-card__button');
      const label = card.querySelector('[data-state-label]');

      card.classList.toggle('is-active', isActive);
      card.classList.toggle('is-playing', isPlaying || isLoading);
      button.setAttribute('aria-pressed', String(isPlaying));
      card.querySelector('[data-badge]').hidden = !isPlaying;
      card.querySelector('.icon--play').hidden = isPlaying || isLoading;
      card.querySelector('.icon--pause').hidden = !(isPlaying || isLoading);

      if (!isActive) {
        label.textContent = '';
      } else if (state === 'loading') {
        label.textContent = '· conectando';
      } else if (state === 'paused') {
        label.textContent = '· en pausa';
      } else if (state === 'error') {
        label.textContent = '· sin señal';
      } else {
        label.textContent = '';
      }
    }
  };
}
