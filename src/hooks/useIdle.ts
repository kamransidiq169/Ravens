import { useEffect, useState } from "react";

import { onIdle } from "@/lib/idle";

/** Becomes true once the browser is idle (or `timeout` ms elapse) — used to defer non-critical JS past first paint. */
export function useIdle(timeout = 1200): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => onIdle(() => setIdle(true), timeout), [timeout]);
  return idle;
}
