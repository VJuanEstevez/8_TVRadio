import { findStation, findChannel } from './streams.js';
import { createMediaEngine } from './media-engine.js';
import { initRadioView } from './radio.js';
import { initTvView } from './tv.js';
import { initRadioPlayer } from './radio-player.js';
import { initSearch } from './search.js';
import { announce, loadStoredState, saveStoredState } from './utils.js';

const DEFAULT_STATE = {
  tab: 'radio',
  source: null,
  volume: 0.8,
  muted: false,
  wasPlaying: false,
};

function initTabs(onChange) {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

  function apply(tab, { focus }) {
    for (const candidate of tabs) {
      const isSelected = candidate === tab;
      candidate.setAttribute('aria-selected', String(isSelected));
      candidate.tabIndex = isSelected ? 0 : -1;
      document.querySelector(`#${candidate.getAttribute('aria-controls')}`).hidden = !isSelected;
    }
    if (focus) tab.focus();
    onChange(tab.id.replace('tab-', ''));
  }

  function activate(tab, { focus = true, animate = true } = {}) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (animate && document.startViewTransition && !reducedMotion) {
      try {
        document.startViewTransition(() => apply(tab, { focus: false }));
        if (focus) tab.focus();
        return;
      } catch {
        /* Fall through: the tab must switch even if the transition is unavailable. */
      }
    }
    apply(tab, { focus });
  }

  for (const tab of tabs) {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (event) => {
      const index = tabs.indexOf(tab);
      let next = null;
      if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
      else if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (event.key === 'Home') next = tabs[0];
      else if (event.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      event.preventDefault();
      activate(next);
    });
  }

  return {
    activateById(tabId, options) {
      const tab = tabs.find((candidate) => candidate.id === `tab-${tabId}`) ?? tabs[0];
      activate(tab, options);
    },
  };
}

export function init() {
  const saved = { ...DEFAULT_STATE, ...(loadStoredState() ?? {}) };
  const root = document.documentElement;
  const engine = createMediaEngine();

  engine.setVolume(saved.volume);
  engine.setMuted(saved.muted);

  const state = { tab: saved.tab };
  let lastPersisted = '';
  let announcement = { id: null, step: null };

  function persist() {
    const snapshot = engine.getSnapshot();
    const next = {
      tab: state.tab,
      source: snapshot.current ? { kind: snapshot.current.kind, id: snapshot.current.id } : null,
      volume: snapshot.volume,
      muted: snapshot.muted,
      wasPlaying: snapshot.state === 'playing' || snapshot.state === 'loading',
    };
    const serialized = JSON.stringify(next);
    if (serialized !== lastPersisted) {
      lastPersisted = serialized;
      saveStoredState(next);
    }
  }

  function describe(source) {
    return source.kind === 'radio'
      ? `${source.name} por ${source.frequency}`
      : `${source.name}, televisión en directo`;
  }

  const radioView = initRadioView({
    onSelect(station) {
      engine.load(toSource(station));
    },
  });

  const tvView = initTvView({
    engine,
    onSelect(channel) {
      engine.load(toSource(channel));
    },
  });

  const updateRadioPlayer = initRadioPlayer({
    engine,
    onStop() {
      engine.stop();
    },
  });

  function toSource(item) {
    const isRadio = 'frequency' in item;
    return {
      id: item.id,
      kind: isRadio ? 'radio' : 'tv',
      name: item.name,
      subtitle: isRadio ? `${item.frequency} · ${item.city}` : item.network,
      accent: item.accent,
      logoText: item.logoText,
      logoBg: item.logoBg,
      logoInk: item.logoInk,
      type: item.type,
      stream: item.stream,
      frequency: item.frequency,
      city: item.city,
    };
  }

  function reactTo(snapshot) {
    const { current, state: playbackState, error } = snapshot;

    if (current) {
      root.style.setProperty('--accent', current.accent);
    } else {
      root.style.removeProperty('--accent');
    }

    radioView.update(snapshot);
    tvView.update(snapshot);
    updateRadioPlayer(snapshot);

    document.title =
      current && playbackState === 'playing'
        ? `EN DIRECTO · ${current.name} — AIRE`
        : 'AIRE — Radio y TV en directo';

    const step = `${current?.id ?? 'none'}:${playbackState}`;
    if (step !== announcement.step) {
      const previous = announcement;
      const isFirstSnapshot = previous.step === null;
      announcement = { id: current?.id ?? null, step, state: playbackState };
      if (isFirstSnapshot) {
        /* initial render: the UI updates silently */
      } else if (!current) {
        announce('Reproductor detenido');
      } else if (playbackState === 'loading' && (previous.state !== 'playing' || previous.id !== current.id)) {
        announce(`Conectando con ${current.name}`);
      } else if (playbackState === 'playing' && previous.state !== 'playing') {
        announce(`${describe(current)} en directo`);
      } else if (playbackState === 'paused') {
        announce(`${current.name} en pausa`);
      } else if (playbackState === 'error') {
        announce(error ?? `Sin señal de ${current.name}`);
      }
    }

    persist();
  }

  const tabs = initTabs((tabId) => {
    state.tab = tabId;
    persist();
  });
  tabs.activateById(saved.tab, { focus: false, animate: false });

  let searchTimer = 0;
  initSearch({
    onQuery(query) {
      radioView.filter(query);
      tvView.filter(query);
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => {
        const total = document.querySelectorAll('.station-card:not([hidden]), .channel-card:not([hidden])').length;
        announce(query ? `${total} ${total === 1 ? 'resultado' : 'resultados'} para "${query}"` : 'Búsqueda borrada');
      }, 450);
    },
  });

  engine.on(reactTo);

  const restored = saved.source
    ? saved.source.kind === 'radio'
      ? findStation(saved.source.id)
      : findChannel(saved.source.id)
    : null;
  if (restored) engine.load(toSource(restored), { autoplay: saved.wasPlaying });
}
