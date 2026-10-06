import { describe, expect, it, vi } from "vitest";

import { closingPhase } from "@/features/hero/lib/journey.store";

describe("closingPhase", () => {
  it("notifies subscribers only when the value actually changes, and stops after unsubscribe", () => {
    const listener = vi.fn();
    const off = closingPhase.subscribe(listener);
    closingPhase.set(false);
    expect(listener).not.toHaveBeenCalled();
    closingPhase.set(true);
    closingPhase.set(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(closingPhase.get()).toBe(true);
    off();
    closingPhase.set(false);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(closingPhase.get()).toBe(false);
  });
});
