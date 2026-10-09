# 0003 — Lenis smooth scroll driven by the GSAP ticker

**Status:** accepted

## Context

Smooth scrolling plus scroll-linked animation needs one clock; otherwise Lenis and ScrollTrigger drift apart and jitter.

## Decision

`SmoothScrollProvider` creates Lenis with `autoRaf: false`, advances it from `gsap.ticker`, forwards its `scroll` event to `ScrollTrigger.update`, sets `gsap.ticker.lagSmoothing(0)`, and tears everything down on unmount. It is disabled under `prefers-reduced-motion`. Motion components use `@gsap/react`'s `useGSAP` (automatic cleanup; `revertOnUpdate` so a changed reduced-motion preference restores the DOM). GSAP, ScrollTrigger and Lenis are loaded after the browser is idle.

## Consequences

- Measured on the home page: deferring this stack took Total Blocking Time from ~940 ms to ~20–70 ms (Lighthouse mobile).
- Content is server-rendered visible, so animation is an enhancement, not a requirement for readability.
- Elements in view when the drivers start are not animated, avoiding a hide-then-reveal flash.
