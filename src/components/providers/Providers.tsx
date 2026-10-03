import type { ReactNode } from "react";

import { SmoothScrollProvider } from "./SmoothScrollProvider";

/** Composition root for client-side providers. Add new providers here, outermost first. */
export function Providers({ children }: { children: ReactNode }) {
  return <SmoothScrollProvider>{children}</SmoothScrollProvider>;
}
