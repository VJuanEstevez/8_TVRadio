const STATE_BADGES = {
  playing: { text: "EN DIRECTO", modifier: "" },
  loading: { text: "CONECTANDO", modifier: "live-badge--loading" },
  paused: { text: "EN PAUSA", modifier: "live-badge--paused" },
  error: { text: "SIN SEÑAL", modifier: "live-badge--error" },
};

export function initMiniPlayer({ engine, onOpen } = {}) {
  const mini = document.querySelector("#mini-player");
  const openButton = document.querySelector("#mini-player-open");
  const logo = document.querySelector("#mini-player-logo");
  const name = document.querySelector("#mini-player-name");
  const subtitle = document.querySelector("#mini-player-subtitle");
  const badge = document.querySelector("#mini-player-badge");
  const toggleButton = document.querySelector("#mini-player-toggle");
  const stopButton = document.querySelector("#mini-player-stop");

  const radioPlayer = document.querySelector("#radio-player");
  const videoStage = document.querySelector("#video-stage");
  const visibility = new Map();
  let mainVisible = "IntersectionObserver" in window;
  let snapshot = engine.getSnapshot();

  function syncVisibility() {
    if (!("IntersectionObserver" in window)) {
      mainVisible = false;
      return;
    }
    const player = snapshot.current?.kind === "tv" ? videoStage : radioPlayer;
    mainVisible = visibility.has(player) ? visibility.get(player) : true;
  }

  function refresh() {
    const visible = Boolean(snapshot.current) && !mainVisible;
    mini.hidden = !visible;
    document.body.classList.toggle("has-mini-player", visible);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) visibility.set(entry.target, entry.isIntersecting);
      syncVisibility();
      refresh();
    });
    observer.observe(radioPlayer);
    observer.observe(videoStage);
  }

  openButton.addEventListener("click", () => onOpen?.(snapshot.current?.kind));
  toggleButton.addEventListener("click", () => engine.toggle());
  stopButton.addEventListener("click", () => engine.stop());

  function update(nextSnapshot) {
    snapshot = nextSnapshot;
    const { current, state } = snapshot;
    syncVisibility();
    refresh();
    if (!current) return;

    logo.textContent = current.logoText;
    logo.style.setProperty("--logo-bg", current.logoBg);
    logo.style.setProperty("--logo-ink", current.logoInk);
    name.textContent = current.name;
    subtitle.textContent = current.subtitle;

    const badgeState = STATE_BADGES[state] ?? STATE_BADGES.paused;
    badge.textContent = badgeState.text;
    badge.className = `live-badge mini-player__badge ${badgeState.modifier}`.trim();

    const isBusy = state === "playing" || state === "loading";
    toggleButton.querySelector(".icon--play").hidden = isBusy;
    toggleButton.querySelector(".icon--pause").hidden = !isBusy;
    toggleButton.querySelector("[data-toggle-label]").textContent = isBusy
      ? "Pausar"
      : "Reproducir";
  }

  update(snapshot);
  return update;
}
