import { RADIO_STATIONS, TV_CHANNELS } from "./streams.js";
import { initSort, SORT_LABELS } from "./sort.js";
import { announce } from "./utils.js";

export function initSortControls({ state, saved, persist }) {
  function setup({ selectId, listId, items, idAttribute, key, label }) {
    const controller = initSort({
      select: document.querySelector(selectId),
      list: document.querySelector(listId),
      items,
      idAttribute,
      onSort(mode) {
        state[key] = mode;
        persist();
        announce(`${label} ordenadas ${SORT_LABELS[mode]}`);
      },
    });
    controller.setMode(saved[key]);
  }

  setup({
    selectId: "#station-sort",
    listId: "#station-list",
    items: RADIO_STATIONS,
    idAttribute: "data-station-id",
    key: "radioSort",
    label: "Emisoras",
  });
  setup({
    selectId: "#channel-sort",
    listId: "#channel-list",
    items: TV_CHANNELS,
    idAttribute: "data-channel-id",
    key: "tvSort",
    label: "Canales",
  });
}
