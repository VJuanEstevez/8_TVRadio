const MAX_RETRIES = 2;
const HLS_MIME = 'application/vnd.apple.mpegurl';

export function createMediaEngine() {
  const audio = document.createElement('audio');
  audio.preload = 'none';
  audio.hidden = true;
  document.body.append(audio);

  const video = document.createElement('video');
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('playsinline', '');

  let hls = null;
  let current = null;
  let state = 'idle'; // idle | loading | playing | paused | error
  let errorMessage = null;
  let retries = 0;
  let levelHeight = null;
  let volume = 0.8;
  let muted = false;
  const listeners = new Set();

  function snapshot() {
    return { current, state, error: errorMessage, levelHeight, volume, muted };
  }

  function emit() {
    const snap = snapshot();
    for (const listener of listeners) listener(snap);
  }

  function on(listener) {
    listeners.add(listener);
    listener(snapshot());
    return () => listeners.delete(listener);
  }

  function mediaFor(source) {
    return source.kind === 'tv' ? video : audio;
  }

  function applyVolume() {
    audio.volume = volume;
    video.volume = volume;
    audio.muted = muted;
    video.muted = muted;
  }

  function destroyHls() {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  }

  function stopInternal() {
    destroyHls();
    for (const media of [audio, video]) {
      media.pause();
      media.removeAttribute('src');
      try {
        media.load();
      } catch {
        /* element already clean */
      }
    }
    levelHeight = null;
  }

  function setMediaSession(source) {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: source.name,
      artist: source.kind === 'tv' ? source.subtitle : `${source.subtitle} · Radio en directo`,
      album: 'AIRE — consola de emisión',
    });
  }

  function fail(message) {
    state = 'error';
    errorMessage = message;
    window.setTimeout(() => {
      if (state === 'error') stopInternal();
    }, 0);
    emit();
  }

  function handleMediaError(media) {
    if (!current || mediaFor(current) !== media) return;
    if (hls && current.type === 'hls') return; // hls.js reports and recovers its own errors
    if (state === 'paused') return; // the user already stopped this source on purpose
    if (retries < MAX_RETRIES) {
      retries += 1;
      const source = current;
      window.setTimeout(() => {
        if (current !== source || state === 'paused') return;
        state = 'loading';
        emit();
        media.src = source.stream;
        media.play().catch(() => {});
      }, 900 * retries);
      return;
    }
    fail(`No se ha podido conectar con ${current.name}`);
  }

  function handleHlsError(data, instance) {
    if (!data.fatal || hls !== instance || !current) return;
    if (data.type === 'networkError' && retries < MAX_RETRIES) {
      retries += 1;
      window.setTimeout(() => {
        if (hls === instance) instance.startLoad();
      }, 800 * retries);
      return;
    }
    if (data.type === 'mediaError' && retries < MAX_RETRIES) {
      retries += 1;
      window.setTimeout(() => {
        if (hls === instance) instance.recoverMediaError();
      }, 800);
      return;
    }
    fail(`No se ha podido conectar con ${current.name}`);
  }

  async function attach(source) {
    const media = mediaFor(source);
    const isHls = source.type === 'hls';

    if (isHls && media.canPlayType(HLS_MIME)) {
      media.src = source.stream;
      media.play().catch(handlePlayRejection);
      return;
    }

    if (isHls) {
      const { default: Hls } = await import('hls.js');
      if (current !== source) return;
      if (!Hls.isSupported()) {
        fail('Este navegador no puede reproducir señales HLS');
        return;
      }
      const instance = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 60 });
      hls = instance;
      instance.on('hlsManifestParsed', () => {
        if (hls === instance && state === 'loading') media.play().catch(handlePlayRejection);
      });
      instance.on('hlsLevelSwitched', (_event, data) => {
        if (hls !== instance) return;
        levelHeight = instance.levels?.[data.level]?.height ?? null;
        emit();
      });
      instance.on('hlsError', (_event, data) => handleHlsError(data, instance));
      instance.loadSource(source.stream);
      instance.attachMedia(media);
      return;
    }

    media.src = source.stream;
    media.play().catch(handlePlayRejection);
  }

  function handlePlayRejection(reason) {
    if (!current) return;
    if (reason?.name === 'AbortError' || reason?.name === 'InterruptedError') return; // paused meanwhile
    if (reason?.name === 'NotAllowedError') {
      state = 'paused';
      errorMessage = null;
      emit();
      return;
    }
    handleMediaError(mediaFor(current));
  }

  function bindMedia(media, kind) {
    media.addEventListener('playing', () => {
      if (!current || current.kind !== kind) return;
      state = 'playing';
      errorMessage = null;
      retries = 0;
      emit();
    });
    media.addEventListener('waiting', () => {
      if (!current || current.kind !== kind || state !== 'playing') return;
      state = 'loading';
      emit();
    });
    media.addEventListener('error', () => handleMediaError(media));
    media.addEventListener('ended', () => {
      if (!current || current.kind !== kind) return;
      state = 'paused';
      emit();
    });
  }

  bindMedia(audio, 'radio');
  bindMedia(video, 'tv');
  applyVolume();

  function load(source, { autoplay = true } = {}) {
    const sameSource = current && current.id === source.id && current.kind === source.kind;
    if (sameSource && state !== 'error') return toggle();

    stopInternal();
    current = source;
    errorMessage = null;
    retries = 0;
    setMediaSession(source);

    if (!autoplay) {
      state = 'paused';
      emit();
      return;
    }

    state = 'loading';
    emit();
    attach(source).catch(() => fail(`No se ha podido conectar con ${source.name}`));
  }

  function toggle() {
    if (!current) return;
    const media = mediaFor(current);

    if (state === 'playing' || state === 'loading') {
      media.pause();
      state = 'paused';
      emit();
      return;
    }

    if (state === 'error') {
      load(current, { autoplay: true });
      return;
    }

    state = 'loading';
    emit();
    if (!media.getAttribute('src') && !hls) {
      attach(current).catch(() => fail(`No se ha podido conectar con ${current.name}`));
      return;
    }
    media.play().catch(handlePlayRejection);
  }

  function stop() {
    stopInternal();
    current = null;
    state = 'idle';
    errorMessage = null;
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = null;
    emit();
  }

  function setVolume(nextVolume) {
    volume = Math.min(Math.max(nextVolume, 0), 1);
    applyVolume();
    emit();
  }

  function setMuted(nextMuted) {
    muted = Boolean(nextMuted);
    applyVolume();
    emit();
  }

  return {
    video,
    on,
    load,
    toggle,
    stop,
    setVolume,
    setMuted,
    getSnapshot: snapshot,
  };
}
