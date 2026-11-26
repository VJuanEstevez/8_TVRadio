import { RADIO_STATIONS } from "./streams.js";
import { icon, equalizerMarkup } from "./utils.js";

function stationCardMarkup(station) {
  const style = `--logo-bg:${station.logoBg};--logo-ink:${station.logoInk};--station-accent:${station.accent}`;
  const search = [station.name, station.frequency, station.city, station.category, station.id]
    .join(" ")
    .toLowerCase();
  const detail = `${station.frequency} · ${station.city}`;
  return `
    <li class="station-card" data-station-id="${station.id}" data-search="${search}" style="${style}">
      <button class="station-card__button" type="button" aria-pressed="false">
        <span class="station-card__logo" data-brand="${station.id}">${station.logoText}</span>
        <span class="station-card__body">
          <span class="station-card__category">${station.category}</span>
          <span class="station-card__name">${station.name}</span>
          <span class="station-card__meta">
            <span class="station-card__marquee">
              <span class="station-card__marquee-track">
                <span class="station-card__marquee-item">${detail}</span>
                <span class="station-card__marquee-item" aria-hidden="true">${detail}</span>
              </span>
            </span>
          </span>
        </span>
        <span class="live-badge" data-badge hidden><span class="live-badge__dot" aria-hidden="true"></span>EN DIRECTO</span>
        ${equalizerMarkup()}
        <span class="station-card__action" aria-hidden="true">${icon("play")}${icon("pause", { hidden: true })}</span>
        <span class="visually-hidden" data-state-label></span>
      </button>
    </li>`;
}

export function initRadioView({ onSelect }) {
  const list = document.querySelector("#station-list");
  list.innerHTML = RADIO_STATIONS.map(stationCardMarkup).join("");
  const cards = Array.from(list.querySelectorAll(".station-card"));

  list.addEventListener("click", (event) => {
    const button = event.target.closest(".station-card__button");
    if (!button) return;
    const card = button.closest(".station-card");
    const station = RADIO_STATIONS.find((item) => item.id === card.dataset.stationId);
    if (station) onSelect(station);
  });

  function update({ current, state }) {
    const activeId = current?.kind === "radio" ? current.id : null;

    for (const card of cards) {
      const isActive = card.dataset.stationId === activeId;
      const isPlaying = isActive && state === "playing";
      const isLoading = isActive && state === "loading";
      const button = card.querySelector(".station-card__button");
      const label = card.querySelector("[data-state-label]");

      card.classList.toggle("is-active", isActive);
      card.classList.toggle("is-playing", isPlaying || isLoading);
      button.setAttribute("aria-pressed", String(isPlaying));
      card.querySelector("[data-badge]").hidden = !isPlaying;
      card.querySelector(".icon--play").hidden = isPlaying || isLoading;
      card.querySelector(".icon--pause").hidden = !(isPlaying || isLoading);

      if (!isActive) {
        label.textContent = "";
      } else if (state === "loading") {
        label.textContent = "· conectando";
      } else if (state === "paused") {
        label.textContent = "· en pausa";
      } else if (state === "error") {
        label.textContent = "· sin señal";
      } else {
        label.textContent = "";
      }
    }
  }

  function filter(query) {
    const normalized = query.trim().toLowerCase();
    for (const card of cards) {
      card.hidden = Boolean(normalized) && !card.dataset.search.includes(normalized);
    }
  }

  return { update, filter };
}
