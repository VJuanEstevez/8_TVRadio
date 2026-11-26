import { RADIO_NATIONAL } from './data/radio-national.js';
import { RADIO_REGIONAL } from './data/radio-regional.js';
import { RADIO_INTERNATIONAL } from './data/radio-international.js';
import { TV_NATIONAL } from './data/tv-national.js';
import { TV_REGIONAL } from './data/tv-regional.js';

export const RADIO_STATIONS = [...RADIO_NATIONAL, ...RADIO_REGIONAL, ...RADIO_INTERNATIONAL];

export const TV_CHANNELS = [...TV_NATIONAL, ...TV_REGIONAL];

export function findStation(id) {
  return RADIO_STATIONS.find((station) => station.id === id) ?? null;
}

export function findChannel(id) {
  return TV_CHANNELS.find((channel) => channel.id === id) ?? null;
}
