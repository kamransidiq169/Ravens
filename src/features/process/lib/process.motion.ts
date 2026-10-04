/**
 * The process film as a pure function of scroll progress.
 *
 * `processAt(p)` is the single source of truth for every moving part, so scrolling backwards is just evaluating the
 * same function at smaller values. The hook only writes the returned numbers to the DOM (transforms, opacity, clip).
 *
 *   0.00 – 0.14  INTRO     the statement holds, drifts up; its copy leaves first
 *   0.14 – 0.23  ENTER     the camera pushes into the heading until it fills the screen, the lines split, a slit opens
 *   0.20 – 0.95  WORDS     DISCOVER, DEFINE, DESIGN, DELIVER each run the same typography choreography (`wordAt`):
 *                          slit reveal → off-centre hero → camera push → exit up and to the right
 *   RAVEN                  is what changes per chapter:
 *     DISCOVER  slow, curious: a few feathers surface, the bird pulls into view and drifts through the word
 *     DEFINE    precise: it squares up fast, holds dead still, then one small turn
 *     DESIGN    expressive: it banks through the word, then takes the screen for a beat
 *     DELIVER   confident: level, it comes toward us (power4.inOut), covers the word and leaves through the top
 */

export interface ProcessLayout {
  /** Phone-sized viewport: smaller travel, shallower depth. */
  compact: boolean;
}

/** Letters on one side of `line` (0–1 along the word) are drawn in front of the bird, the rest behind it. */
interface FrontState {
  amount: number;
  line: number;
  dir: 1 | -1;
}

interface WordState {
  /** Fractions of the stage width / height, positive = right / down. */
  x: number;
  y: number;
  scale: number;
  scaleX: number;
  opacity: number;
  /** 0 = shut slit, 1 = fully revealed (clip-path). */
  open: number;
  /** Letter separation in em, per step from the word's centre. */
  spread: number;
  /** 0–1: letters break away from each other. */
  exit: number;
  front: FrontState;
  caption: number;
}

interface RigState {
  /** Fractions of the raven's own width / height, positive = right / down. */
  x: number;
  y: number;
  scale: number;
  scaleX: number;
  /** Degrees. `rotate` is roll; `tiltX` leans the top away; `yaw` turns it about the spine. */
  rotate: number;
  tiltX: number;
  yaw: number;
  opacity: number;
}

interface IntroState {
  /** Whole statement: fraction of stage height (up is negative), scale about its own centre, opacity. */
  y: number;
  scale: number;
  opacity: number;
  /** Eyebrow and paragraph leave before the heading does. */
  copy: number;
  /** Top and bottom lines slide apart (fractions of stage height); the middle line fades. */
  split: { top: number; bottom: number; middle: number };
}

export interface ProcessState {
  intro: IntroState;
  words: WordState[];
  /** The bird between the two layers of type. The wing piece in front of everything takes the same transform. */
  rig: RigState;
  /** Opacity of the wing piece that crosses in front of the letters. */
  front: number;
  /** Hairline axes that draw during DEFINE. */
  guides: number;
  whisper: number;
  /** Progress label near the edge. */
  meta: number;
  glow: { x: number; opacity: number };
  /** Pale wash that dissolves whatever is left of the bird at the very end. */
  tint: number;
  /** Chapter 0–3, or -1 before the first. */
  active: number;
  progress: number;
}

export const STAGES = 4;
/** Where each chapter's label takes over. */
const LABEL_AT = [0.18, 0.39, 0.57, 0.76] as const;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const range = (p: number, from: number, to: number) => clamp01((p - from) / (to - from));
const smooth = (t: number) => t * t * (3 - 2 * t);
const s = (p: number, a: number, b: number) => smooth(range(p, a, b));
const easeInCubic = (t: number) => t * t * t;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeOutQuart = (t: number) => 1 - (1 - t) ** 4;
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);

/** Where each chapter's word owns the screen. Contiguous, so one word's exit is the next word's reveal. */
const SLOTS = [
  [0.2, 0.4],
  [0.4, 0.58],
  [0.58, 0.77],
  [0.77, 0.95],
] as const;
/** Editorial asymmetry: each word rests a little off-centre, alternating sides. */
const REST_X = [-0.07, 0.06, -0.05, 0.04] as const;

/**
 * The one typography choreography every chapter word runs, DISCOVER's included. In order:
 *   reveal   a slit opens (clip-path) while the letters sit slightly apart and close up
 *   hero     it sits almost still, off-centre; letters step in front of the bird left to right, which is what turns
 *            them light against it
 *   push     the camera creeps toward it until letters leave the frame
 *   exit     it leaves up and to the right, scaling toward the viewer, its caption first
 * Only the raven (below) differs between chapters.
 */
function wordAt(p: number, i: number, compact: boolean): WordState {
  const [a, b] = SLOTS[i]!;
  const t = range(p, a, b);
  const m = compact ? 0.45 : 1;
  const push = easeInOutSine(range(t, 0.3, 0.88));
  const exit = easeInCubic(range(t, 0.84, 1));
  return {
    x: (REST_X[i]! - 0.1 * push) * m + 0.5 * exit,
    y: (0.05 - 0.03 * push) * m - 0.55 * exit,
    scale: (0.9 + 0.08 * range(t, 0, 0.3)) * (1 + ((compact ? 1.9 : 2.5) - 1) * push) * (1 + 0.5 * exit),
    scaleX: 1,
    opacity: s(p, a - 0.005, a + 0.01) * (1 - s(t, 0.86, 1)),
    open: s(p, a - 0.005, a + 0.05),
    spread: 0.09 * (1 - s(t, 0, 0.3)),
    exit: 0,
    front: { amount: s(t, 0.18, 0.34) * (1 - s(t, 0.88, 1)), line: range(t, 0.25, 0.9), dir: 1 },
    caption: s(t, 0.3, 0.42) * (1 - s(t, 0.9, 1)),
  };
}

export function processAt(progress: number, { compact }: ProcessLayout): ProcessState {
  const p = clamp01(progress);
  const k = compact ? 0.88 : 1;

  // ---- Intro -----------------------------------------------------------------------------------------------------
  const drift = easeInOutSine(range(p, 0.04, 0.14));
  const rush = easeInCubic(range(p, 0.14, 0.225));
  const split = easeInOutCubic(range(p, 0.17, 0.235));
  const intro: IntroState = {
    y: -0.07 * drift,
    scale: lerp(1, 1.22, drift) * (1 + 7.5 * rush),
    opacity: 1 - s(p, 0.19, 0.225),
    copy: 1 - s(p, 0.05, 0.1),
    split: { top: -1.1 * split, bottom: 1.1 * split, middle: 1 - s(p, 0.18, 0.22) },
  };

  // ---- Raven ------------------------------------------------------------------------------------------------------
  // DISCOVER: start inside a patch of feathers, barely there, then pull back until the whole bird is present and let it
  // drift through the word.
  const pull = easeInOutSine(range(p, 0.24, 0.42));
  let scale = lerp(3.2, 1.1, pull);
  let x = lerp(0.33, 0, pull) * (scale / 3.2) ** 0.2 + 0.1 * s(p, 0.34, 0.42);
  let y = lerp(0.06, 0, pull);
  let rotate = lerp(-9, -4, pull);
  let tiltX = lerp(16, 10, pull);
  let scaleX = lerp(0.9, 0.93, pull);
  let yaw = 0;
  const opacity = 0.28 * s(p, 0.22, 0.27) + 0.72 * s(p, 0.27, 0.34);

  // DEFINE: squares up fast, then holds dead still; one small turn right before the next word.
  const def = range(p, 0.4, 0.58);
  const settle = easeOutQuart(range(def, 0, 0.45));
  scale = lerp(scale, 1, settle);
  x = lerp(x, 0, settle);
  y = lerp(y, 0.01, settle);
  rotate = lerp(rotate, 0, settle);
  tiltX = lerp(tiltX, 0, settle);
  scaleX = lerp(scaleX, 1, settle);
  const turn = easeInOutCubic(range(def, 0.78, 1));
  yaw = -10 * turn;
  x += 0.02 * turn;

  // DESIGN: banks one way and then the other, then the bird takes the screen for a beat and settles back.
  const des = range(p, 0.58, 0.8);
  const sway = Math.sin(des * Math.PI * 2);
  const calm = 1 - s(des, 0.5, 0.68);
  scale = lerp(scale, 1.12, easeInOutCubic(range(des, 0, 0.4)));
  scale = lerp(scale, 1.9, easeOutCubic(range(des, 0.45, 0.68)));
  scale = lerp(scale, 1.05, easeInOutCubic(range(des, 0.72, 1)));
  x = lerp(x, 0, s(des, 0, 0.15)) - 0.1 * sway * calm;
  yaw = (-10 * (1 - easeInOutCubic(range(des, 0, 0.15))) + 24 * sway) * (des > 0 ? calm : 1);
  rotate = 4 * sway * calm;
  y = lerp(y, -0.03, s(des, 0, 0.4));
  scaleX = lerp(scaleX, 1.04, s(des, 0, 0.4));
  tiltX = lerp(tiltX, -4, s(des, 0, 0.4)) * calm;

  // DELIVER: level and complete, then it comes toward us (power4.inOut), covers the word and leaves through the top.
  const fwd = easeInOutQuart(range(p, 0.84, 0.95));
  scale = lerp(scale, 2, fwd);
  y = lerp(y, -0.12, fwd);
  scaleX = lerp(scaleX, 1, s(p, 0.78, 0.84));
  tiltX = lerp(tiltX, 6, fwd);
  const leave = easeInCubic(range(p, 0.93, 1));
  y -= 0.95 * leave;
  scale += 0.3 * leave;

  const words = SLOTS.map((_, i) => wordAt(p, i, compact));
  const active = LABEL_AT.reduce((acc, at, i) => (p >= at ? i : acc), -1);

  return {
    intro,
    words,
    rig: { x, y, scale: scale * k, scaleX, rotate, tiltX, yaw, opacity },
    // Phones keep the type clear of the wing: the bird stays behind it throughout.
    front: compact ? 0 : s(des, 0.08, 0.2) * (1 - s(des, 0.5, 0.62)),
    guides: s(def, 0.3, 0.5) * (1 - s(def, 0.85, 1)),
    whisper: s(p, 0.3, 0.34) * (1 - s(p, 0.37, 0.395)),
    meta: s(p, 0.18, 0.22) * (1 - s(p, 0.96, 0.99)),
    glow: { x: lerp(0.35, 0.65, p), opacity: 0.55 + 0.25 * Math.sin(p * Math.PI) },
    tint: s(p, 0.95, 1),
    active,
    progress: p,
  };
}
