import { gsap, ScrollTrigger } from "@/lib/gsap";
import { onIdle } from "@/lib/idle";

/** Phones with motion allowed. Everything else (tablet/desktop, reduced motion) never mounts this controller. */
const QUERY = "(max-width: 767px) and (prefers-reduced-motion: no-preference)";

/** Finger travel that counts as an intentional swipe. */
const SWIPE_PX = 28;
/** A wheel burst (narrow desktop window) ends after this much silence; compared by event timestamp, not a timer. */
const WHEEL_GAP_MS = 140;
/** Card travel / scale at rest while waiting off-stage. */
const SHIFT = 14;
const SCALE = 0.97;

export interface ServicesMobile {
  goNext: () => void;
  goPrevious: () => void;
  destroy: () => void;
}

/**
 * Decodes a card's photograph off the main thread while it waits in `visibility: hidden`, so the swipe that reveals
 * it never pays for download + decode (AVIF has no hardware decoder on most iPhones). Resolves either way.
 */
function decodeCard(card: HTMLElement | undefined) {
  return (
    card
      ?.querySelector("img")
      ?.decode()
      .catch(() => undefined) ?? Promise.resolve()
  );
}

/**
 * Phone Services: a gesture-driven stack, independent of the desktop entrance and of scroll position.
 *
 *  - `index` is the only authority for the active card and only `goTo` writes it; `goNext` / `goPrevious` are its
 *    public face. One accepted gesture calls it at most once.
 *  - The stage is CSS-sticky inside a short wrapper (`.sv-pin`). While it is stuck ("owned") its touches are ours:
 *    touch-action stops the browser panning, so native scroll distance can never decide how many cards move.
 *    Outside that range nothing here intercepts anything.
 *  - Past the last card (swipe up) or before the first (swipe down) the stage hands over: it carries the page out
 *    with one short scroll tween, so the next section follows in the same gesture.
 *  - `busy` is set synchronously when a transition starts and cleared in GSAP's onComplete.
 *
 * Returns controls for the pager buttons plus the cleanup.
 */
export function mountServicesMobile(list: HTMLUListElement, onChange: (index: number) => void): ServicesMobile {
  const mm = gsap.matchMedia();
  let controls: Pick<ServicesMobile, "goNext" | "goPrevious"> | null = null;

  mm.add(QUERY, () => {
    const wrap = list.closest<HTMLElement>(".sv-pin");
    const stage = list.closest<HTMLElement>(".sv-stage");
    const page = list.closest<HTMLElement>(".sv-page");
    const cards = gsap.utils.toArray<HTMLElement>(".sv-item", list);
    if (!wrap || !stage || !page || cards.length < 2) return;

    const last = cards.length - 1;
    let index = 0;
    let busy = false;
    let tl: gsap.core.Timeline | undefined;
    let scrollTween: gsap.core.Tween | undefined;

    const poseOf = (k: number, active: number) =>
      k === active
        ? { yPercent: 0, scale: 1, autoAlpha: 1 }
        : { yPercent: k < active ? -SHIFT : SHIFT, scale: SCALE, autoAlpha: 0 };
    const settle = (active: number) => cards.forEach((card, k) => gsap.set(card, poseOf(k, active)));
    settle(0);

    let alive = true;
    const cancelIdle = onIdle(() => {
      void cards
        .slice(1)
        .reduce((chain, card) => chain.then(() => (alive ? decodeCard(card) : undefined)), Promise.resolve());
    });

    /** The one place the active card changes. */
    const goTo = (dir: 1 | -1) => {
      const next = index + dir;
      if (busy || next < 0 || next > last) return;
      const from = cards[index]!;
      const to = cards[next]!;
      index = next;
      busy = true;
      onChange(next);
      tl = gsap
        .timeline({
          onComplete: () => {
            busy = false;
          },
        })
        .to(from, { yPercent: -dir * SHIFT, scale: SCALE, duration: 0.45, ease: "power3.out" }, 0)
        .to(from, { autoAlpha: 0, duration: 0.22, ease: "power1.in" }, 0)
        .fromTo(
          to,
          { yPercent: dir * SHIFT, scale: SCALE, autoAlpha: 0 },
          { yPercent: 0, scale: 1, autoAlpha: 1, duration: 0.5, ease: "power3.out" },
          0.04,
        );
    };

    // Ownership: the stuck range of the wrapper. `onToggle` keeps the browser from panning (touch-action in CSS)
    // and Lenis from smoothing wheel input over the stage, only while we own it.
    let touching = false;
    const own = (on: boolean) => {
      stage.toggleAttribute("data-owned", on);
      stage.toggleAttribute("data-lenis-prevent", on);
    };
    // Entering the range (momentum from a neighbouring section) parks the page in the middle of it. Invisible,
    // because the stage is sticky, and it leaves room on both sides for the first gesture.
    const park = () => {
      if (touching || busy) return;
      window.scrollTo({ top: Math.round((zone.start + zone.end) / 2), behavior: "instant" });
    };
    const zone = ScrollTrigger.create({
      trigger: wrap,
      start: "top top",
      end: "bottom bottom",
      onToggle: (self) => own(self.isActive),
      onEnter: park,
      onEnterBack: park,
    });
    // Coming from above shows card 1, from below the last card; decided while the stage is still off-screen.
    const reset = (active: number) => {
      if (busy || active === index) return;
      index = active;
      settle(active);
      onChange(active);
    };
    const visible = ScrollTrigger.create({
      trigger: wrap,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => reset(0),
      onEnterBack: () => reset(last),
    });

    // Hand-over past either end: jump (invisibly) to the edge of the stuck range, then tween out of it.
    const release = (dir: 1 | -1) => {
      busy = true;
      const edge = dir > 0 ? zone.end : zone.start;
      window.scrollTo({ top: edge, behavior: "instant" });
      const target = dir > 0 ? page.getBoundingClientRect().bottom + window.scrollY : zone.start - window.innerHeight;
      const proxy = { y: edge };
      scrollTween = gsap.to(proxy, {
        y: Math.max(0, target),
        duration: 0.6,
        ease: "power2.inOut",
        onUpdate: () => window.scrollTo(0, proxy.y),
        onComplete: () => {
          busy = false;
        },
      });
    };
    const advance = (dir: 1 | -1) => {
      if (busy) return;
      const next = index + dir;
      if (next < 0 || next > last) release(dir);
      else goTo(dir);
    };

    // One touch = at most one decision. "idle" until the threshold, then "taken" (rest of the touch, momentum
    // included, is ignored) or "pass" (not ours: native scrolling).
    let gesture: "idle" | "taken" | "pass" = "idle";
    let startX = 0;
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]!;
      startX = t.clientX;
      startY = t.clientY;
      gesture = e.touches.length > 1 || !zone.isActive ? "pass" : "idle";
    };
    const onTouchMove = (e: TouchEvent) => {
      if (gesture === "pass") return;
      if (e.touches.length > 1) {
        gesture = "pass";
        return;
      }
      if (e.cancelable) e.preventDefault();
      if (gesture === "taken") return;
      const t = e.touches[0]!;
      const dy = startY - t.clientY;
      const dx = startX - t.clientX;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX) return;
      gesture = "taken";
      if (Math.abs(dx) > Math.abs(dy)) return;
      advance(dy > 0 ? 1 : -1);
    };
    // A finger that dragged the page into the range natively could not be parked mid-drag; do it on release.
    const onTouchEnd = () => {
      touching = false;
      if (gesture === "pass" && zone.isActive) park();
    };
    const onWindowTouchStart = () => {
      touching = true;
    };

    let lastWheel = -Infinity;
    const onWheel = (e: WheelEvent) => {
      if (!zone.isActive || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      const fresh = e.timeStamp - lastWheel > WHEEL_GAP_MS;
      lastWheel = e.timeStamp;
      if (fresh) advance(e.deltaY > 0 ? 1 : -1);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const dir =
        e.key === "ArrowDown" || e.key === "PageDown" ? 1 : e.key === "ArrowUp" || e.key === "PageUp" ? -1 : 0;
      if (!dir || index + dir < 0 || index + dir > last) return;
      e.preventDefault();
      goTo(dir);
    };

    window.addEventListener("touchstart", onWindowTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchmove", onTouchMove, { passive: false });
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("keydown", onKeyDown);

    controls = { goNext: () => goTo(1), goPrevious: () => goTo(-1) };
    list.dataset.motion = "ready";

    return () => {
      alive = false;
      controls = null;
      cancelIdle();
      zone.kill();
      visible.kill();
      tl?.kill();
      scrollTween?.kill();
      own(false);
      window.removeEventListener("touchstart", onWindowTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      stage.removeEventListener("touchstart", onTouchStart);
      stage.removeEventListener("touchmove", onTouchMove);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("keydown", onKeyDown);
      gsap.set(cards, { clearProps: "all" });
    };
  });

  return {
    goNext: () => controls?.goNext(),
    goPrevious: () => controls?.goPrevious(),
    destroy: () => mm.revert(),
  };
}
