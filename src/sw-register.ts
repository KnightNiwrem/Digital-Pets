const SW_UPDATE_EVENT = "sw-update-available";

export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    const registration = await navigator.serviceWorker.register("/sw.js");

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          window.dispatchEvent(new CustomEvent(SW_UPDATE_EVENT));
        }
      });
    });
  });
}

export function skipWaitingAndReload(): void {
  navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });

  // Fallback: if controllerchange doesn't fire within 2s, reload anyway
  setTimeout(() => window.location.reload(), 2000);
}

export { SW_UPDATE_EVENT };
