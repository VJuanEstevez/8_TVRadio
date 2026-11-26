const STATE_BADGES = {
  playing: { text: 'EN DIRECTO', modifier: '' },
  loading: { text: 'CONECTANDO', modifier: 'live-badge--loading' },
  paused: { text: 'EN PAUSA', modifier: 'live-badge--paused' },
  error: { text: 'SIN SEÑAL', modifier: 'live-badge--error' },
};

export function initRadioPlayer({ engine, onStop }) {
  const empty = document.querySelector('#radio-player-empty');
  const body = document.querySelector('#radio-player-body');
  const logo = document.querySelector('#radio-player-logo');
  const title = document.querySelector('#radio-player-title');
  const subtitle = document.querySelector('#radio-player-subtitle');
  const badge = document.querySelector('#radio-player-state');
  const toggleButton = document.querySelector('#radio-player-toggle');
  const muteButton = document.querySelector('#radio-player-mute');
  const volumeSlider = document.querySelector('#radio-player-volume');
  const stopButton = document.querySelector('#radio-player-stop');
  const sourceChip = document.querySelector('#radio-player-source');

  toggleButton.addEventListener('click', () => engine.toggle());
  muteButton.addEventListener('click', () => engine.setMuted(!engine.getSnapshot().muted));
  stopButton.addEventListener('click', onStop);
  volumeSlider.addEventListener('input', () => engine.setVolume(Number(volumeSlider.value) / 100));

  return function updateRadioPlayer({ current, state, volume, muted, audioOnly }) {
    const isRadio = current?.kind === 'radio';
    const isTvAudio = current?.kind === 'tv' && audioOnly;
    const isActive = isRadio || isTvAudio;
    empty.hidden = isActive;
    body.hidden = !isActive;
    body.classList.toggle('is-playing', isActive && (state === 'playing' || state === 'loading'));
    if (!isActive) return;

    logo.textContent = current.logoText;
    logo.style.setProperty('--logo-bg', current.logoBg);
    logo.style.setProperty('--logo-ink', current.logoInk);
    title.textContent = current.name;
    subtitle.textContent = isTvAudio ? `TV en directo · ${current.subtitle}` : current.subtitle;
    sourceChip.hidden = !isTvAudio;

    const badgeState = STATE_BADGES[state] ?? STATE_BADGES.paused;
    badge.textContent = badgeState.text;
    badge.className = `live-badge radio-player__state ${badgeState.modifier}`;

    const isBusy = state === 'playing' || state === 'loading';
    toggleButton.querySelector('.icon--play').hidden = isBusy;
    toggleButton.querySelector('.icon--pause').hidden = !isBusy;
    toggleButton.querySelector('[data-toggle-label]').textContent = isBusy ? 'Pausar' : 'Reproducir';

    muteButton.querySelector('.icon--volume').hidden = muted;
    muteButton.querySelector('.icon--muted').hidden = !muted;
    muteButton.setAttribute('aria-pressed', String(muted));
    muteButton.querySelector('[data-mute-label]').textContent = muted ? 'Activar sonido' : 'Silenciar';

    const percent = String(Math.round(volume * 100));
    if (document.activeElement !== volumeSlider) volumeSlider.value = percent;
    volumeSlider.setAttribute('aria-valuetext', `${percent} por ciento`);
    volumeSlider.style.setProperty('--value', `${percent}%`);
  };
}
