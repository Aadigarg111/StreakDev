type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

export async function enterImmersiveMode() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  document.body.classList.add("is-immersive-session");

  const root = document.documentElement as FullscreenElement;
  const fullscreenDocument = document as FullscreenDocument;
  const requestFullscreen =
    root.requestFullscreen?.bind(root) ?? root.webkitRequestFullscreen?.bind(root);
  const fullscreenElement =
    document.fullscreenElement ?? fullscreenDocument.webkitFullscreenElement;

  try {
    if (requestFullscreen && !fullscreenElement) {
      await Promise.resolve(requestFullscreen());
    }
  } catch {
    // Fullscreen can be denied by the browser. The layout still falls back to 100dvh.
  }

  window.requestAnimationFrame(() => {
    window.scrollTo(0, 1);
  });
}

export async function exitImmersiveMode() {
  if (typeof document === "undefined") {
    return;
  }

  document.body.classList.remove("is-immersive-session");

  const fullscreenDocument = document as FullscreenDocument;
  const fullscreenElement =
    document.fullscreenElement ?? fullscreenDocument.webkitFullscreenElement;
  const exitFullscreen =
    document.exitFullscreen?.bind(document) ??
    fullscreenDocument.webkitExitFullscreen?.bind(fullscreenDocument);

  try {
    if (fullscreenElement && exitFullscreen) {
      await Promise.resolve(exitFullscreen());
    }
  } catch {
    // Exiting fullscreen is best-effort; browsers can reject if state changed first.
  }
}
