/** Runs `callback` when the browser is idle (Safari lacks requestIdleCallback, so it falls back to a timeout). Returns a canceller. */
export function onIdle(callback: () => void, timeout = 1200): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(callback, timeout);
  return () => window.clearTimeout(handle);
}
