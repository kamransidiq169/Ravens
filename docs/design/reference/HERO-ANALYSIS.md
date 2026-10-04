# Hero analysis

Reference: `ravens-hero-ref.png`. The copy in the repo is the **cropped 1264×640 screenshot** (8px black strip, top nav band
and part of the sides cut off); the full 1505×812 original is not available. Decision (project owner):

- Positions in brief §2.1–2.8 are the **source of truth** for everything, including the nav; they were measured from the full image.
- The cropped file is used only to cross-check **horizontal** word edges and proportions. No vertical value is derived from it.
- Pixel-diff verification is therefore horizontal only. **Vertical verification against the reference is pending the full image.**

Measurements: `scripts/qa/hero-verify.mjs` (outputs in `compare/`). Headline/UI scores are reported separately from the raven/feather scores.

## Layer stack (back → front)

sky gradient · sun · rays · bloom · wisps → far feathers (2, 3, 8) → **raven** → mid feathers (1, 4, 6) → headline → near feathers
(5, 7) → mist → grain → UI (paragraph, scroll indicator; logo and MENU come from the shared Header).

## Measured vs brief (Tier 1, 1505×812, ±0.5vw / ±0.5vh)

| Group     | Result | Detail                                                                                                                                |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Headline  | 16/16  | every word's left and right ink edge, cap-top 16.4vh, cap height, both line pitches (6.9vw)                                          |
| UI        | 15/15  | logo left/centre/cap height, MENU right edge/hairline/gap, paragraph left/top/width, SCROLL centre/label/line/ring                   |
| Feathers  | 16/16  | all 8 centres                                                                                                                         |
| Raven     | 6/6    | against the **photograph's** own geometry (see below), not the brief's reference-raven geometry                                       |

Horizontal cross-check against the cropped reference (vw): DESIGN 6.11→34.29 (ref 5.7→33.9), THAT 39.47→58.94 (39.1→59.0), ELEVATES
6.11→43.92 (5.7→43.4), YOUR 66.84→86.84 (66.6→87.2). All within ~0.5vw except ELEVATES' right edge (+0.52); the brief's 43.9 wins.
Horizontal ink IoU of the two headline rows against the reference: 0.79 and 0.73 (cap heights differ, so this is a lower bound).

## Where the implementation deliberately differs from the brief

| Item                      | Brief                         | Implemented                                             | Why                                                                                                         |
| ------------------------- | ----------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Headline font-size        | ≈7.6vw (and cap 5.45vw)       | 7.7vw (cap 5.39vw)                                      | The two brief numbers disagree for Montserrat (cap = 0.70em). Per-word tracking then lands every edge.      |
| DESIGN / THAT split       | one "DESIGN THAT" entry       | DESIGN 6.1→34.3, THAT 39.5→59.0                         | Words are separate elements; the split proportions come from the cropped reference.                         |
| Raven art                 | traced placeholder            | two real photographs (`public/hero/images/raven{1,2}.png`) | Supplied art replaces the procedural silhouette.                                                         |
| Beak target               | 51.5vw / 26.5vh               | 53.5vw / 29vh                                           | The photo's head sits right of its body axis; shifting keeps the body centred with both wings bleeding. Lowered 2.5vh so the tall V-wings clear line 1. The head still sits in the ELEVATES↔YOUR gap. |
| Raven geometry            | leading edge 37–40%, primaries to 80% | not applicable                                   | Those were the reference raven's proportions; the photograph's wings are raised, so its leading edge is higher. |
| Intro length              | ≈2.4s                         | 2.55s                                                   | The last feather's drift-in ends at ~2.5s. Intro is pure CSS so the LCP image never waits for JS.          |
| Tier 2 (WebGL)            | enhancement after Tier 1      | present but **disabled** (`heroConfig.tier2.enabled`)   | A DOM raven that passes behind the headline and over the next section cannot share layers with a canvas headline (the canvas is scissored to the hero box and sits under the DOM). |
| Glyph hairline            | not in brief                  | 0.6px pale stroke on headline glyphs                    | Invisible on the sky; outlines the letters where they cross the dark wings (legibility).                   |
| Header (shared)           | reuse                         | restyled to §2.4 values                                 | Matching logo/MENU position and sizes required changing `Header.tsx`.                                      |

## Raven: one subject, two photographs

`raven11.png` (1537×1023): back-facing, wings spread, the rest pose. `raven2.png` (666×375): banking flight pose, facing right. Both
are clean mattes (≈0.5% faint fringe). **They are low resolution**: the hero shows pose 1 about 2.6× its native size at 1505px, so it
is visibly softer than a 3840px source would be; this is the main remaining quality gap and only larger source art fixes it.

- Both poses sit in **one box** and share a **neck anchor** (pose 1 `(0.508, 0.36)`, pose 2 `(0.53, 0.42)`). Pose 2 is sized so head
  sizes match. Rotation and scale happen about that anchor, so the two photographs stay locked together.
- **One ScrollTrigger-scrubbed GSAP timeline** (`hooks/useHeroFlight.ts`) carries a single proxy tween 0→1. Every tick the pure
  `createFlight(layout, viewport).at(t)` (`lib/hero.flight.ts`) is applied: path, scale, pose rotation/bank, opacity, blur, mist.
  Monotone-cubic splines give continuous velocity (no stop-start at waypoints). Reverse scrub is the same timeline.
- The path accelerates away from rest (takeoff lift → bank right → dive down-right) and the scale grows 1 → 2.7, so the bird travels
  and approaches rather than the camera zooming.
- **Handover** (progress 0.49–0.57, ≈8% of the flight): pose 1 has rotated about 65° to share pose 2's body axis; pose 2 fades in
  faster than pose 1 leaves, so both are opaque for a moment and the bird never goes translucent; a peak 3px blur covers the small
  silhouette differences. Honest limitation: two stills cannot flap, so this is a choreographed dissolve, not a wing animation.
- The hero's mist (which hides the tail at rest) fades out over the first 28% of the flight so there is no seam as the bird leaves.

## Hero → next section

`.hero__flight` is `position: fixed` inside the hero's stacking context, whose `z-index` is raised one above the sections that follow;
`overflow: hidden` on the hero does not clip fixed descendants. The raven therefore stays behind the headline and feathers while the
hero is on screen, and paints over the next section as it leaves. The hero's ScrollTrigger runs for 1.15 viewport heights; at the end
the bird is off-screen and its layer is `visibility: hidden`.

## Verification summary

See the final report for numbers: flight continuity (max step 3–4% of the screen diagonal per ~23px of scroll, reverse returns to the
exact rest pose), 10 breakpoints with zero overlaps/clips/orphans, 60 fps on a real GPU, Lighthouse in three profiles, e2e and visual tests.
