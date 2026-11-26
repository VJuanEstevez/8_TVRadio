// Canales autonómicos y temáticos con señal HLS pública.

export const TV_REGIONAL = [
  {
    id: "canal-sur-andalucia",
    category: "Generalistas",
    name: "Canal Sur Andalucía",
    network: "RTVA",
    accent: "#e05a2b",
    logoText: "CS",
    logoBg: "#993411",
    logoInk: "#ffffff",
    type: "hls",
    stream:
      "https://dfk2a268yviz9.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-ddiii1m6jt6of/CanalSurAndaluciaES.m3u8",
  },
  {
    id: "real-madrid-tv",
    category: "Deportes",
    name: "Real Madrid TV",
    network: "Real Madrid",
    accent: "#f2f2f2",
    logoText: "RMTV",
    logoBg: "#1c3d78",
    logoInk: "#ffffff",
    type: "hls",
    stream: "https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8",
  },
];
