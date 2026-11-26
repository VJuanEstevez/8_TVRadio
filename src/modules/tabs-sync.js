// Evita que dos pestañas de AIRE reproduzcan el mismo directo a la vez.

const CHANNEL_NAME = "aire-console";
const PING_WAIT = 250;

export function createTabsSync({ onTakeover } = {}) {
  const tabId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const channel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;
  let claimed = false;
  let claimedAt = 0;
  let occupied = false;

  if (channel) {
    channel.onmessage = (event) => {
      const message = event.data;
      if (!message || message.from === tabId) return;

      if (message.type === "claim") {
        if (!claimed) return;
        // El reclamo más reciente gana; en empate gana el ID mayor.
        if (message.at < claimedAt || (message.at === claimedAt && message.from < tabId)) return;
        claimed = false;
        onTakeover?.(message);
      } else if (message.type === "ping") {
        if (claimed) channel.postMessage({ type: "alive", from: tabId, to: message.from });
      } else if (message.type === "alive" && message.to === tabId) {
        occupied = true;
      }
    };
  }

  function claim(source) {
    claimed = true;
    claimedAt = Date.now();
    occupied = false;
    channel?.postMessage({ type: "claim", from: tabId, at: claimedAt, source: source?.id ?? null });
  }

  function release() {
    claimed = false;
    channel?.postMessage({ type: "release", from: tabId });
  }

  function checkOccupied(done) {
    if (!channel) {
      done(false);
      return;
    }
    occupied = false;
    channel.postMessage({ type: "ping", from: tabId });
    window.setTimeout(() => done(occupied), PING_WAIT);
  }

  return { claim, release, checkOccupied };
}
