export const RADIO_STATIONS = [
  {
    id: 'cope',
    name: 'COPE',
    frequency: '106.3 FM',
    city: 'Madrid',
    accent: '#4f7dff',
    logoText: 'COPE',
    logoBg: '#002c8b',
    logoInk: '#ffffff',
    type: 'mp3',
    stream: 'https://net1-cope-rrcast.flumotion.com/cope/net1.mp3',
  },
  {
    id: 'cadena-ser',
    name: 'Cadena SER',
    frequency: '105.4 / 104.3 FM',
    city: 'Madrid',
    accent: '#ffd400',
    logoText: 'Cadena SER',
    logoBg: '#ffd400',
    logoInk: '#191919',
    type: 'mp3',
    stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CADENASER.mp3',
  },
  {
    id: 'onda-cero',
    name: 'Onda Cero',
    frequency: '98.0 FM',
    city: 'Madrid',
    accent: '#3b985c',
    logoText: 'Onda Cero',
    logoBg: '#2b7a4c',
    logoInk: '#ffffff',
    type: 'hls',
    stream: 'https://atres-live.ondacero.es/live/ondacero/bitrate_1.m3u8',
  },
  {
    id: 'los40',
    name: 'LOS 40',
    frequency: '93.9 FM',
    city: 'Madrid',
    accent: '#f5a300',
    logoText: 'LOS 40',
    logoBg: '#f5a300',
    logoInk: '#1a1200',
    type: 'mp3',
    stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40.mp3',
  },
  {
    id: 'rockfm',
    name: 'RockFM',
    frequency: '101.7 FM',
    city: 'Madrid',
    accent: '#e33a45',
    logoText: 'RockFM',
    logoBg: '#d80212',
    logoInk: '#ffffff',
    type: 'mp3',
    stream: 'https://rockfm-cope-rrcast.flumotion.com/cope/rockfm.mp3',
  },
];

export const TV_CHANNELS = [
  {
    id: 'la1',
    name: 'La 1',
    network: 'TVE',
    accent: '#3d8bff',
    logoText: 'La 1',
    logoBg: '#0172ff',
    logoInk: '#ffffff',
    type: 'hls',
    stream: 'https://rtvelivestream.rtve.es/rtvesec/la1/la1_main.m3u8',
  },
  {
    id: 'la2',
    name: 'La 2',
    network: 'TVE',
    accent: '#01c6d7',
    logoText: 'La 2',
    logoBg: '#01c6d7',
    logoInk: '#062026',
    type: 'hls',
    stream: 'https://rtvelivestream.rtve.es/rtvesec/la2/la2_main.m3u8',
  },
  {
    id: 'teledeporte',
    name: 'Teledeporte',
    network: 'RTVE Deportes',
    accent: '#ff7f00',
    logoText: 'TDP',
    logoBg: '#ff7f00',
    logoInk: '#1a0e00',
    type: 'hls',
    stream: 'https://rtvelivestream.rtve.es/rtvesec/tdp/tdp_main.m3u8',
  },
];

export function findStation(id) {
  return RADIO_STATIONS.find((station) => station.id === id) ?? null;
}

export function findChannel(id) {
  return TV_CHANNELS.find((channel) => channel.id === id) ?? null;
}
