import { describe, expect, it } from "vitest";

import { createWheelGate, isEngaged, nextWaypoint, settleTarget, waypointPositions } from "@/lib/stepper";

const wp = waypointPositions(1000, 9000, [0, 0.29, 0.471, 0.644, 0.851]);
const [intro, discover, define, design, deliver] = wp as [number, number, number, number, number];

/** Feeds a wheel burst and counts how many steps the gate would start. */
function steps(deltas: number[], every = 16, busyFor = 0): number {
  const gate = createWheelGate();
  let started = 0;
  deltas.forEach((delta, i) => {
    if (gate.push(delta, i * every, i * every < busyFor).start) started += 1;
  });
  return started;
}

describe("waypoints", () => {
  it("are increasing and span the section", () => {
    expect(wp).toHaveLength(5);
    expect(intro).toBe(1000);
    expect([...wp].sort((a, b) => a - b)).toEqual(wp);
  });

  it("move only to the adjacent waypoint, whatever the distance travelled", () => {
    expect(nextWaypoint(intro, 1, wp)).toBe(discover);
    expect(nextWaypoint(discover, 1, wp)).toBe(define);
    expect(nextWaypoint(design, 1, wp)).toBe(deliver);
    expect(nextWaypoint(deliver, -1, wp)).toBe(design);
    expect(nextWaypoint(discover, -1, wp)).toBe(intro);
    expect(nextWaypoint(deliver, 1, wp)).toBeNull();
    expect(nextWaypoint(intro, -1, wp)).toBeNull();
  });
});

describe("section boundaries", () => {
  it("leave normal scrolling above the intro and below DELIVER", () => {
    expect(isEngaged(intro - 300, 1, wp)).toBe(false);
    expect(isEngaged(intro, -1, wp)).toBe(false);
    expect(isEngaged(deliver, 1, wp)).toBe(false);
    expect(isEngaged(deliver + 500, 1, wp)).toBe(false);
    expect(isEngaged(deliver + 500, -1, wp)).toBe(false);
  });

  it("own the gesture everywhere between", () => {
    expect(isEngaged(intro, 1, wp)).toBe(true);
    expect(isEngaged(define, 1, wp)).toBe(true);
    expect(isEngaged(define, -1, wp)).toBe(true);
    expect(isEngaged(deliver, -1, wp)).toBe(true);
  });

  it("settle a drifted page on the waypoint it came from, and leave resting pages alone", () => {
    expect(settleTarget(define + 400, 1, wp)).toBe(define);
    expect(settleTarget(define + 400, -1, wp)).toBe(design);
    expect(settleTarget(define, 1, wp)).toBeNull();
    expect(settleTarget(intro - 50, 1, wp)).toBeNull();
    expect(settleTarget(deliver + 50, -1, wp)).toBeNull();
  });
});

describe("wheel gate", () => {
  it("turns one huge delta into one step", () => {
    expect(steps([1500])).toBe(1);
  });

  it("turns a burst of strong events into one step", () => {
    expect(steps(Array.from({ length: 30 }, () => 400))).toBe(1);
  });

  it("does not let a long decaying trackpad momentum tail advance again", () => {
    const swipe = [12, 40, 90, 160, 220, 240, 230, 210];
    const tail = Array.from({ length: 120 }, (_, i) => Math.max(1, 200 * 0.96 ** i));
    expect(steps([...swipe, ...tail])).toBe(1);
  });

  it("ignores events that arrive while a transition is running and does not release them afterwards", () => {
    // Busy for the first 600ms; the gesture keeps going afterwards without a pause.
    expect(
      steps(
        Array.from({ length: 80 }, () => 120),
        16,
        600,
      ),
    ).toBe(0);
  });

  it("allows the next intentional gesture after a pause", () => {
    const gate = createWheelGate();
    expect(gate.push(300, 0, false).start).toBe(true);
    expect(gate.push(280, 16, false).start).toBe(false);
    expect(gate.push(300, 1200, false).start).toBe(true);
  });

  it("treats a fresh swipe on top of dying momentum as a new gesture", () => {
    const gate = createWheelGate();
    expect(gate.push(300, 0, false).start).toBe(true);
    for (let i = 1; i < 20; i += 1) gate.push(Math.max(10, 300 * 0.85 ** i), i * 16, true);
    expect(gate.push(280, 20 * 16, false).start).toBe(true);
  });

  it("treats a reversal as a new gesture", () => {
    const gate = createWheelGate();
    expect(gate.push(200, 0, false).start).toBe(true);
    expect(gate.push(-200, 16, false).start).toBe(true);
  });

  it("flags the rest of a spent gesture as continuing, so it can be swallowed at the edge of the section", () => {
    const gate = createWheelGate();
    expect(gate.push(300, 0, false)).toEqual({ start: true, continuing: false });
    expect(gate.push(280, 16, false)).toEqual({ start: false, continuing: true });
    expect(gate.push(300, 1200, false)).toEqual({ start: true, continuing: false });
  });

  it("ignores trackpad noise below the intent threshold", () => {
    expect(steps([2, 3, 2, 4, 3])).toBe(0);
  });
});
