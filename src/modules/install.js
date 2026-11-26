/** Muestra el botón de instalación solo cuando el navegador lo permite. */
export function initInstall() {
  const button = document.querySelector("#install-button");
  if (!button) return;

  const isInstalled =
    window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (isInstalled) return;

  let deferred = null;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event;
    button.hidden = false;
  });

  button.addEventListener("click", async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    button.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    deferred = null;
    button.hidden = true;
  });
}
