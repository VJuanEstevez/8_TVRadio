import { TV_CHANNELS } from './streams.js';
import { equalizerMarkup, announce } from './utils.js';

function channelCardMarkup(channel) {
  const style = `--logo-bg:${channel.logoBg};--logo-ink:${channel.logoInk};--station-accent:${channel.accent}`;
  const search = [channel.name, channel.network, channel.id].join(' ').toLowerCase();
  return `
    <li class="channel-card" data-channel-id="${channel.id}" data-search="${search}" style="${style}">
      <button class="channel-card__button" type="button" aria-pressed="false">
        <span class="channel-card__logo" data-brand="${channel.id}">${channel.logoText}</span>
        <span class="channel-card__body">
          <span class="channel-card__network">${channel.network}</span>
          <span class="channel-card__state" data-state-label></span>
        </span>
        ${equalizerMarkup()}
      </button>
    </li>`;
}

export function initTvView({ engine, onSelect }) {
  const stage = document.querySelector('#video-stage');
  const placeholder = document.querySelector('#video-placeholder');
  const overlay = document.querySelector('#video-overlay');
  const overlayName = document.querySelector('#video-channel-name');
  const qualityChip = document.querySelector('#video-quality');
  const list = document.querySelector('#channel-list');

  stage.prepend(engine.video);

  list.innerHTML = TV_CHANNELS.map(channelCardMarkup).join('');
  const cards = Array.from(list.querySelectorAll('.channel-card'));

  list.addEventListener('click', (event) => {
    const button = event.target.closest('.channel-card__button');
    if (!button) return;
    const card = button.closest('.channel-card');
    const channel = TV_CHANNELS.find((item) => item.id === card.dataset.channelId);
    if (channel) onSelect(channel);
  });

  const toggleButton = document.querySelector('#video-toggle');
  const stopButton = document.querySelector('#video-stop');
  const muteButton = document.querySelector('#video-mute');
  const volumeSlider = document.querySelector('#video-volume');
  const fullscreenButton = document.querySelector('#video-fullscreen');
  const pipButton = document.querySelector('#video-pip');
  const stateBadge = document.querySelector('#video-state');

  const canFullscreenElement = 'requestFullscreen' in stage;
  const canFullscreenVideo = 'webkitEnterFullscreen' in engine.video;
  if (!canFullscreenElement && !canFullscreenVideo) fullscreenButton.hidden = true;
  pipButton.hidden = !('pictureInPictureEnabled' in document) || !document.pictureInPictureEnabled;

  toggleButton.addEventListener('click', () => {
    const { current } = engine.getSnapshot();
    if (current?.kind !== 'tv') {
      announce('Elige un canal de televisión para verlo en directo');
      return;
    }
    engine.toggle();
  });

  stopButton.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
    engine.stop();
  });

  muteButton.addEventListener('click', () => engine.setMuted(!engine.getSnapshot().muted));

  volumeSlider.addEventListener('input', () => {
    engine.setVolume(Number(volumeSlider.value) / 100);
  });

  fullscreenButton.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    if (canFullscreenElement) {
      stage.requestFullscreen().catch(() => announce('No se puede activar la pantalla completa'));
    } else if (canFullscreenVideo && engine.video.readyState > 0) {
      engine.video.webkitEnterFullscreen();
    } else {
      announce('Inicia la reproducción para usar la pantalla completa');
    }
  });

  pipButton.addEventListener('click', async () => {
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else if (engine.video.readyState > 0) await engine.video.requestPictureInPicture();
    } catch {
      announce('La ventana flotante no está disponible en este momento');
    }
  });

  stage.addEventListener('click', (event) => {
    if (event.target.closest('button, input, label')) return;
    const { current } = engine.getSnapshot();
    if (current?.kind === 'tv') engine.toggle();
    else announce('Elige un canal de televisión para verlo en directo');
  });

  document.addEventListener('fullscreenchange', () => {
    const isFullscreen = Boolean(document.fullscreenElement);
    fullscreenButton.querySelector('.icon--fullscreen').hidden = isFullscreen;
    fullscreenButton.querySelector('.icon--fullscreenExit').hidden = !isFullscreen;
    fullscreenButton.querySelector('[data-fs-label]').textContent = isFullscreen
      ? 'Salir de pantalla completa'
      : 'Pantalla completa';
  });

  function update({ current, state, levelHeight, volume, muted }) {
    const activeId = current?.kind === 'tv' ? current.id : null;

    for (const card of cards) {
      const isActive = card.dataset.channelId === activeId;
      const isPlaying = isActive && state === 'playing';
      const isLoading = isActive && state === 'loading';
      const button = card.querySelector('.channel-card__button');

      card.classList.toggle('is-active', isActive);
      card.classList.toggle('is-playing', isPlaying || isLoading);
      button.setAttribute('aria-pressed', String(isPlaying));
      card.querySelector('.channel-card__state').textContent = !isActive
        ? ''
        : state === 'loading'
          ? 'Conectando'
          : state === 'paused'
            ? 'En pausa'
            : state === 'error'
              ? 'Sin señal'
              : 'En directo';
    }

    const stageActive = activeId !== null;
    placeholder.hidden = stageActive;
    overlay.hidden = !stageActive;

    if (stageActive && current) {
      overlayName.textContent = current.name;
    }

    const showQuality = stageActive && (state === 'playing' || state === 'loading');
    qualityChip.textContent = showQuality
      ? levelHeight
        ? `HLS · ${levelHeight}p`
        : 'HLS · auto'
      : 'HLS';

    toggleButton.querySelector('.icon--play').hidden = stageActive && state !== 'paused' && state !== 'error';
    toggleButton.querySelector('.icon--pause').hidden = !(stageActive && state !== 'paused' && state !== 'error');
    toggleButton.querySelector('[data-toggle-label]').textContent =
      stageActive && state !== 'paused' && state !== 'error' ? 'Pausar' : 'Reproducir';

    if (stageActive) {
      const badgeText =
        state === 'playing'
          ? 'EN DIRECTO'
          : state === 'loading'
            ? 'CONECTANDO'
            : state === 'error'
              ? 'SIN SEÑAL'
              : 'EN PAUSA';
      const badgeModifier =
        state === 'loading'
          ? ' live-badge--loading'
          : state === 'paused'
            ? ' live-badge--paused'
            : state === 'error'
              ? ' live-badge--error'
              : '';
      stateBadge.className = `live-badge${badgeModifier}`;
      stateBadge.querySelector('[data-state-text]').textContent = badgeText;
    }

    muteButton.querySelector('.icon--volume').hidden = muted;
    muteButton.querySelector('.icon--muted').hidden = !muted;
    muteButton.setAttribute('aria-pressed', String(muted));
    muteButton.querySelector('[data-mute-label]').textContent = muted ? 'Activar sonido' : 'Silenciar';

    const percent = String(Math.round(volume * 100));
    if (document.activeElement !== volumeSlider) volumeSlider.value = percent;
    volumeSlider.setAttribute('aria-valuetext', `${percent} por ciento`);
    volumeSlider.style.setProperty('--value', `${percent}%`);
  }

  function filter(query) {
    const normalized = query.trim().toLowerCase();
    for (const card of cards) {
      card.hidden = Boolean(normalized) && !card.dataset.search.includes(normalized);
    }
  }

  return { update, filter };
}
