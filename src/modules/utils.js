const announcer = () => document.querySelector('#announcer');

export function announce(message) {
  const region = announcer();
  if (!region) return;
  region.textContent = '';
  window.setTimeout(() => {
    region.textContent = message;
  }, 50);
}

export function loadStoredState() {
  try {
    const raw = window.localStorage.getItem('aire-console-state');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredState(state) {
  try {
    window.localStorage.setItem('aire-console-state', JSON.stringify(state));
  } catch {
    /* storage unavailable: state simply is not persisted */
  }
}

const ICON_ATTRS = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"';

const ICON_PATHS = {
  play: '<path d="M8 5.13v13.74a1 1 0 0 0 1.52.85l10.77-6.87a1 1 0 0 0 0-1.7L9.52 4.28A1 1 0 0 0 8 5.13Z" fill="currentColor"/>',
  pause:
    '<rect x="7" y="5" width="3.4" height="14" rx="1.2" fill="currentColor"/><rect x="13.6" y="5" width="3.4" height="14" rx="1.2" fill="currentColor"/>',
  volume:
    '<path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor"/><path d="M14.8 9.3a4 4 0 0 1 0 5.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M17.5 6.8a7.5 7.5 0 0 1 0 10.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  muted:
    '<path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor"/><path d="m15 9.5 5 5m0-5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="1.6" fill="currentColor"/>',
  fullscreen:
    '<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M20 9V5.5A1.5 1.5 0 0 0 18.5 4H15M4 15v3.5A1.5 1.5 0 0 0 5.5 20H9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  fullscreenExit:
    '<path d="M9 4v3.5A1.5 1.5 0 0 1 7.5 9H4M15 4v3.5a1.5 1.5 0 0 0 1.5 1.5H20M9 20v-3.5A1.5 1.5 0 0 0 7.5 15H4M15 20v-3.5a1.5 1.5 0 0 1 1.5-1.5H20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  pictureInPicture:
    '<rect x="3.5" y="5.5" width="17" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="12" y="11.5" width="6" height="5" rx="1" fill="currentColor"/>',
  radio:
    '<circle cx="12" cy="8.5" r="2.1" fill="currentColor"/><path d="M8.6 11.9a4.8 4.8 0 0 1 0-6.8M15.4 5.1a4.8 4.8 0 0 1 0 6.8M6 14.5a8.4 8.4 0 0 1 0-12M18 2.5a8.4 8.4 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M12 10.8V21M9 21h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  television:
    '<rect x="3" y="7" width="18" height="12.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m8.5 2.8 3.5 4.2 3.5-4.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 15.2h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  antenna:
    '<circle cx="12" cy="9" r="2.4" fill="currentColor"/><path d="M8.2 12.8a5.4 5.4 0 0 1 0-7.6M15.8 5.2a5.4 5.4 0 0 1 0 7.6M5.4 15.6a9.4 9.4 0 0 1 0-13.2M18.6 2.4a9.4 9.4 0 0 1 0 13.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M12 11.6V22M8.5 22h7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
};

export function icon(name, { hidden = false } = {}) {
  const hiddenAttribute = hidden ? ' hidden' : '';
  return `<svg class="icon icon--${name}"${hiddenAttribute} ${ICON_ATTRS}>${ICON_PATHS[name]}</svg>`;
}

export function equalizerMarkup() {
  return '<span class="equalizer" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></span>';
}
