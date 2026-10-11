import { gsap, ScrollTrigger } from "@/lib/gsap";
import { onIdle } from "@/lib/idle";

/** Phones with motion allowed. Everything else (tablet/desktop, reduced motion) never mounts this controller. */
const QUERY = "(max-width: 767px) and (prefers-reduced-motion: no-preference)";

/** Finger travel that counts as an intentional swipe. */
const SWIPE_PX = 28;
/** A wheel burst (narrow desktop window) ends after this much silence; compared by event timestamp, not a timer. */
const WHEEL_GAP_MS = 140;
/** Card travel / scale while waiting off-stage. */
const SHIFT = 12;
const SCALE = 0.96;
/** The next gesture is accepted this long after the previous card started moving. */
const SETTLE_S = 0.42;
/** Attribute on <html> while the section owns the page (CSS: no native scroll, no overscroll). */
const LOCK_ATTR = "data-sv-locked";

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
 * Phone Services: a gesture-driven, one-card-at-a-time stack that the page cannot scroll past by momentum.
 *
 *  - The wrapper (`.sv-pin`) is exactly one viewport tall. A *gate* watches the scroll position every frame; the
 *    moment it crosses the wrapper's top edge (from Process above or from the Hero below, however fast) the page is
 *    snapped to that edge and locked: `<html>` stops scrolling, any leftover momentum is clamped back. Skipping the
 *    section is therefore impossible, not merely unlikely.
 *  - While locked, every gesture is ours and is interpreted once: a touch that began before the lock is ignored
 *    (the arrival itself never advances a card), a later swipe accepts at most one decision (the rest of that
 *    touch, momentum included, is dropped).
 *  - One swipe = one card (`goTo`, the only writer of `index`). A swipe past the last (or before the first) card
 *    releases the lock with one short scroll tween into the neighbouring section.
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

    const html = document.documentElement;
    const last = cards.length - 1;
    let index = 0;
    let busy = false;
    let locked = false;
    let releasing = false;
    let lockY = 0;
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
      const caption = to.querySelector(".sv-caption");
      index = next;
      busy = true;
      onChange(next);
      tl = gsap
        .timeline()
        .to(from, { yPercent: -dir * SHIFT, scale: SCALE, duration: 0.45, ease: "power3.out" }, 0)
        .to(from, { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, 0)
        .fromTo(
          to,
          { yPercent: dir * SHIFT, scale: SCALE, autoAlpha: 0 },
          { yPercent: 0, scale: 1, autoAlpha: 1, duration: 0.5, ease: "power3.out" },
          0.04,
        )
        .call(
          () => {
            busy = false;
          },
          undefined,
          SETTLE_S,
        );
      if (caption) {
        tl.fromTo(caption, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" }, 0.14);
      }
    };

    const wrapTop = () => wrap.getBoundingClientRect().top + window.scrollY;

    // ── The gate ────────────────────────────────────────────────────────────────────────────────────────────
    const engage = (top: number) => {
      locked = true;
      lockY = Math.round(top);
      html.setAttribute(LOCK_ATTR, "");
      window.scrollTo({ top, behavior: "instant" });
    };
    const disengage = () => {
      locked = false;
      html.removeAttribute(LOCK_ATTR);
    };

    let prevY = window.scrollY;
    /** Runs every frame (and on every scroll event): hold the lock, or lock when the top edge was crossed. */
    const gate = () => {
      const y = window.scrollY;
      if (releasing) {
        prevY = y;
        return;
      }
      if (locked) {
        if (y !== lockY) window.scrollTo({ top: lockY, behavior: "instant" });
        prevY = lockY;
        return;
      }
      const top = wrapTop();
      // Crossing, not proximity: a flick that jumps over the edge between two samples still counts.
      if ((prevY < top && y >= top) || (prevY > top && y <= top)) engage(top);
      prevY = locked ? lockY : y;
    };
    gsap.ticker.add(gate);
    window.addEventListener("scroll", gate, { passive: true });

    // Coming from above shows card 1, from below the last card; decided while the stage is still off-screen.
    const reset = (active: number) => {
      if (busy || locked || active === index) return;
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

    // Loaded (or restored, or anchored) with the stage already on screen: take it, so it can't be scrolled through.
    {
      const top = wrapTop();
      const y = window.scrollY;
      if (y > top - 1 && y < top + wrap.offsetHeight - 1) engage(top);
    }

    /** Past either end: one short scroll tween into the neighbouring section, then hand the page back. */
    const release = (dir: 1 | -1) => {
      releasing = true;
      const target = dir > 0 ? page.getBoundingClientRect().bottom + window.scrollY : lockY - window.innerHeight;
      const proxy = { y: window.scrollY };
      scrollTween = gsap.to(proxy, {
        y: Math.max(0, target),
        duration: 0.65,
        ease: "power2.inOut",
        onUpdate: () => window.scrollTo(0, proxy.y),
        onComplete: () => {
          releasing = false;
          disengage();
          prevY = window.scrollY;
        },
      });
    };
    const advance = (dir: 1 | -1) => {
      if (busy || releasing || !locked) return;
      const next = index + dir;
      if (next < 0 || next > last) release(dir);
      else goTo(dir);
    };

    // ── Input (window level, live only while locked) ───────────────────────────────────────────────────────
    // One touch = at most one decision. "idle" until the threshold, then "taken" (rest of the touch, momentum
    // included, is ignored) or "pass" (not ours: it began before the lock, or it is a pinch).
    let gesture: "idle" | "taken" | "pass" = "pass";
    let startX = 0;
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]!;
      startX = t.clientX;
      startY = t.clientY;
      gesture = e.touches.length > 1 || !locked || releasing ? "pass" : "idle";
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!locked) return;
      if (e.touches.length > 1) {
        gesture = "pass";
        return;
      }
      if (e.cancelable) e.preventDefault();
      if (gesture !== "idle") return;
      const t = e.touches[0]!;
      const dy = startY - t.clientY;
      const dx = startX - t.clientX;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX) return;
      gesture = "taken";
      if (Math.abs(dx) > Math.abs(dy)) return;
      advance(dy > 0 ? 1 : -1);
    };

    let lastWheel = -Infinity;
    const onWheel = (e: WheelEvent) => {
      if (!locked || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      e.stopPropagation();
      const fresh = e.timeStamp - lastWheel > WHEEL_GAP_MS;
      lastWheel = e.timeStamp;
      if (fresh) advance(e.deltaY > 0 ? 1 : -1);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!locked) return;
      const dir =
        e.key === "ArrowDown" || e.key === "PageDown" || e.key === " "
          ? 1
          : e.key === "ArrowUp" || e.key === "PageUp"
            ? -1
            : 0;
      if (!dir || (e.target instanceof HTMLElement && e.target.closest("a, button") && e.key === " ")) return;
      e.preventDefault();
      advance(dir);
    };

    // Keyboard focus leaving the stage (Tab past the last link) hands the page back instead of fighting the lock.
    const onFocusIn = (e: FocusEvent) => {
      if (locked && !releasing && e.target instanceof Node && !stage.contains(e.target)) {
        disengage();
        prevY = window.scrollY;
      }
    };

    // Rotation / resize: the wrapper moves, so the lock follows it.
    const onResize = () => {
      if (!locked || releasing) return;
      lockY = wrapTop();
      window.scrollTo({ top: lockY, behavior: "instant" });
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    document.addEventListener("focusin", onFocusIn);

    controls = { goNext: () => advance(1), goPrevious: () => advance(-1) };
    list.dataset.motion = "ready";

    return () => {
      alive = false;
      controls = null;
      cancelIdle();
      gsap.ticker.remove(gate);
      window.removeEventListener("scroll", gate);
      visible.kill();
      tl?.kill();
      scrollTween?.kill();
      disengage();
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("focusin", onFocusIn);
      gsap.set(cards, { clearProps: "all" });
    };
  });

  return {
    goNext: () => controls?.goNext(),
    goPrevious: () => controls?.goPrevious(),
    destroy: () => mm.revert(),
  };
}
