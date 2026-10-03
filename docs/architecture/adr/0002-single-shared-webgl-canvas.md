# 0002 — A single shared WebGL canvas

**Status:** accepted

## Context

Multiple `<Canvas>` elements mean multiple WebGL contexts (browsers cap these, mobile GPUs struggle) and duplicated shader/material compilation.

## Decision

`src/webgl/canvas/SharedCanvas.tsx` renders **one** fixed, full-viewport R3F canvas. Features render into it by mounting drei `<View>` elements in the DOM; `View.Port` tunnels their scenes in. DPR is capped at 1.75, a quality tier picks the initial range, and `PerformanceMonitor` lowers it under load. The canvas sits in an `isolate`d stacking context at a non-negative z-index (a fixed canvas under a negative z-index can vanish behind page backgrounds). `LazySharedCanvas` loads it with `next/dynamic` (`ssr: false`); it is mounted only on routes that use WebGL.

## Consequences

- One context, one render loop, shared resources.
- Anything importing drei/three must itself be code-split (`pnpm qa:initial-js` fails the build if three.js leaks into a route's initial JS).
- Features must not create their own `<Canvas>`.
