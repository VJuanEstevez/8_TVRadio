const STATE_BADGES = {
  playing: { text: 'EN DIRECTO', modifier: '' },
  loading: { text: 'CONECTANDO', modifier: 'live-badge--loading' },
  paused: { text: 'EN PAUSA', modifier: 'live-badge--paused' },
  error: { text: 'SIN SEÑAL', modifier: 'live-badge--error' },
};

export function initMiniPlayer({ engine, onStop }) {
  const player = document.querySelector('#mini-player');
  const logo = document.querySelector('#mini-logo');
  const title = document.querySelector('#mini-title');
  const subtitle = document.querySelector('#mini-subtitle');
  const badge = document.querySelector('#mini-state');
  const toggleButton = document.querySelector('#mini-toggle');
  const muteButton = document.querySelector('#mini-mute');
  const volumeSlider = document.querySelector('#mini-volume');
  const stopButton = document.querySelector('#mini-stop');

  toggleButton.addEventListener('click', () => engine.toggle());
  muteButton.addEventListener('click', () => engine.setMuted(!engine.getSnapshot().muted));
  stopButton.addEventListener('click', onStop);
  volumeSlider.addEventListener('input', () => engine.setVolume(Number(volumeSlider.value) / 100));

  return function updateMiniPlayer({ current, state, volume, muted }) {
    player.hidden = !current;
    if (!current) return;

    logo.textContent = current.logoText;
    logo.style.setProperty('--logo-bg', current.logoBg);
    logo.style.setProperty('--logo-ink', current.logoInk);
    title.textContent = current.name;
    subtitle.textContent = current.subtitle;

    const badgeState = STATE_BADGES[state] ?? STATE_BADGES.paused;
    badge.textContent = badgeState.text;
    badge.className = `live-badge mini-player__state ${badgeState.modifier}`;
    player.classList.toggle('is-playing', state === 'playing' || state === 'loading');

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
