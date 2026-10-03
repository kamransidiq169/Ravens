let cached: boolean | undefined;

/** True when the browser can create a WebGL2 or WebGL1 context. Result is memoised. */
export function isWebGLSupported(): boolean {
  if (cached !== undefined) return cached;
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    cached = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    cached = false;
  }
  return cached;
}
