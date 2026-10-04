import { expect, test, type Page } from "@playwright/test";

/** Scroll-driven hero → featured-project sequence (src/features/hero). */

/** Shares of the whole scroll (lib/journey.ts): hero + Northlight + Interactive, those plus Enterprise, and BESPOKE in. */
const CHAPTERS = 580 / 1220;
const FOUR = 820 / 1220;
/** Where BESPOKE has fully arrived (the end of the last extension, before its exit). */
const BESPOKE_IN = 1060 / 1220;

/** Scrolls to a fraction (0 → 1) of the entire sequence. */
const whole = async (page: Page, p: number) => {
  await page.evaluate((fraction) => {
    const journey = document.querySelector<HTMLElement>(".journey")!;
    window.scrollTo(0, (journey.offsetHeight - window.innerHeight) * fraction);
  }, p);
  // scrub smoothing + Lenis settle
  await page.waitForTimeout(1200);
};

/** Scrolls to a fraction of the first three chapters (0 = top, 1 = INTERACTIVE fully settled). */
const progress = (page: Page, p: number) => whole(page, p * CHAPTERS);

const state = (page: Page) =>
  page.evaluate(() => {
    const opacity = (selector: string) => Number(getComputedStyle(document.querySelector(selector)!).opacity);
    return {
      phase: document.querySelector<HTMLElement>(".journey")!.dataset.phase,
      headline: opacity("[data-j='headline']"),
      title: opacity("[data-j='title']"),
      next: opacity("[data-j='title-next']"),
      last: opacity("[data-j='title-last']"),
      bespoke: opacity("[data-j='title-bespoke']"),
      stageTop: Math.round(document.querySelector(".journey__stage")!.getBoundingClientRect().top),
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
    };
  });

test.describe("hero scroll sequence", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/we\s+build\s+what\s+brands\s+become$/i);
  });

  test("renders a finished hero with a single h1 and the project as an h2", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText(/built\s+from\s+possibility\./i);
    await expect(page.getByRole("heading", { level: 2, name: "Made to move you." })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2, name: "Everything, connected." })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2, name: "The next is yours." })).toHaveCount(1);
    expect(await state(page)).toMatchObject({ phase: "hero", headline: 1, title: 0, overflowX: 0 });
  });

  test("the headline is fully gone before Northlight takes over, and everything reverses with the scroll", async ({
    page,
  }) => {
    await progress(page, 0.2);
    const mid = await state(page);
    expect(mid.phase).toBe("hero");
    expect(mid.headline).toBeGreaterThan(0.5);

    await progress(page, 0.35);
    const gap = await state(page);
    expect(gap).toMatchObject({ phase: "gap", headline: 0 });
    expect(gap.title).toBeLessThan(0.3);

    await progress(page, 0.58);
    expect(await state(page)).toMatchObject({ phase: "project", headline: 0, title: 1, next: 0 });

    await progress(page, 0);
    expect(await state(page)).toMatchObject({ phase: "hero", headline: 1, title: 0, next: 0 });
  });

  test("Northlight leaves and INTERACTIVE settles in on the same background, reversibly", async ({ page }) => {
    await progress(page, 0.78);
    const handover = await state(page);
    expect(handover.title).toBeLessThan(0.5);
    expect(handover.title + handover.next).toBeGreaterThan(0.1);

    await progress(page, 1);
    expect(await state(page)).toMatchObject({ phase: "next", headline: 0, title: 0, next: 1, stageTop: 0 });

    await progress(page, 0.58);
    expect(await state(page)).toMatchObject({ phase: "project", title: 1, next: 0 });
  });

  test("INTERACTIVE hands over to ENTERPRISE on the same background, reversibly", async ({ page }) => {
    await whole(page, CHAPTERS + (FOUR - CHAPTERS) * 0.46);
    const handover = await state(page);
    expect(handover.next).toBeLessThan(0.5);
    expect(handover.next + handover.last).toBeGreaterThan(0.1);

    await whole(page, FOUR);
    expect(await state(page)).toMatchObject({ phase: "last", headline: 0, title: 0, next: 0, last: 1, bespoke: 0 });

    await progress(page, 1);
    expect(await state(page)).toMatchObject({ phase: "next", next: 1, last: 0 });
  });

  test("ENTERPRISE hands over to BESPOKE and everything reverses", async ({ page }) => {
    await whole(page, FOUR + (BESPOKE_IN - FOUR) * 0.46);
    const handover = await state(page);
    expect(handover.last).toBeLessThan(0.5);
    expect(handover.last + handover.bespoke).toBeGreaterThan(0.1);

    await whole(page, BESPOKE_IN);
    expect(await state(page)).toMatchObject({
      phase: "bespoke",
      headline: 0,
      title: 0,
      next: 0,
      last: 0,
      bespoke: 1,
      stageTop: 0,
    });

    await whole(page, FOUR);
    expect(await state(page)).toMatchObject({ phase: "last", last: 1, bespoke: 0 });
    await whole(page, 0);
    expect(await state(page)).toMatchObject({ phase: "hero", headline: 1, bespoke: 0 });
  });

  test("every phase title performs the same zoom-and-drop exit, is gone afterwards, and reverses on scroll back", async ({
    page,
  }) => {
    const total = 1220;
    // [title, scroll position (share of the whole) at e = 0, 0.7 and 1.05 of that title's own exit]
    const at = (start: number, length: number, from: number, to: number, e: number) =>
      (start + length * (from + (to - from) * e)) / total;
    const phases = [
      { sel: "[data-j='headline']", p: (e: number) => (340 * 0.5 * e) / total },
      { sel: "[data-j='title']", p: (e: number) => at(340, 240, 0.1, 0.52, e) },
      { sel: "[data-j='title-next']", p: (e: number) => at(580, 240, 0.1, 0.52, e) },
      { sel: "[data-j='title-last']", p: (e: number) => at(820, 240, 0.1, 0.52, e) },
      { sel: "[data-j='title-bespoke']", p: (e: number) => at(1060, 160, 0.1, 0.85, e) },
    ];
    // Scale and opacity come from the computed style; the drop is the title's on-screen centre (a matrix read would
    // include the `translate: 0 -50%` that GSAP folds into the transform, which differs per title). Each reading is
    // taken once the scrub has settled, so the test is independent of how fast the machine renders.
    const sample = (selector: string) =>
      page.evaluate((sel) => {
        const el = document.querySelector<HTMLElement>(sel)!;
        const rect = el.getBoundingClientRect();
        const m = new DOMMatrix(getComputedStyle(el).transform);
        return {
          scale: m.a,
          center: rect.top + rect.height / 2,
          height: el.offsetHeight,
          opacity: Number(getComputedStyle(el).opacity),
          stage: window.innerHeight,
        };
      }, selector);
    const read = async (selector: string) => {
      let previous = await sample(selector);
      for (let i = 0; i < 40; i += 1) {
        await page.waitForTimeout(350);
        const current = await sample(selector);
        const steady =
          Math.abs(current.center - previous.center) < 0.3 &&
          Math.abs(current.scale - previous.scale) < 0.003 &&
          Math.abs(current.opacity - previous.opacity) < 0.003;
        previous = current;
        if (steady) break;
      }
      return previous;
    };

    for (const { sel, p } of phases) {
      await whole(page, p(0));
      const rest = await read(sel);
      expect(rest.scale).toBeCloseTo(1, 1);
      expect(rest.opacity).toBeGreaterThan(0.95);

      await whole(page, p(0.7));
      const mid = await read(sel);
      // 1 + 2.9 · 0.7^1.75 ≈ 2.55, and it has dropped 0.8 · 0.7^1.9 ≈ 0.41 of the stage height, whatever its start.
      expect(mid.scale).toBeGreaterThan(2.4);
      expect(mid.scale).toBeLessThan(2.7);
      // Zooming about a point 62% down the box lifts the centre by 0.12 · height · (scale − 1); add that back to get the
      // drop the model applied.
      const drop = (mid.center - rest.center + 0.12 * mid.height * (mid.scale - 1)) / mid.stage;
      expect(drop).toBeGreaterThan(0.37);
      expect(drop).toBeLessThan(0.44);

      await whole(page, p(1.05));
      expect((await read(sel)).opacity).toBe(0);

      await whole(page, p(0));
      const back = await read(sel);
      expect(back.scale).toBeCloseTo(1, 1);
      expect(Math.abs(back.center - rest.center)).toBeLessThan(3);
      expect(back.opacity).toBeGreaterThan(0.95);
    }
  });

  test("releases the stage after the sequence so the page keeps scrolling", async ({ page }) => {
    await whole(page, 1);
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(600);
    expect((await state(page)).stageTop).toBeLessThan(0);
    await expect(page.getByText("One studio, every layer")).toBeInViewport();
  });

  test("each View project link is inert until its chapter, and focus reveals it", async ({ page }) => {
    const link = (layer: string) => page.locator(layer).getByRole("link", { name: /view project/i });
    const pointer = (layer: string) =>
      page.evaluate((selector) => getComputedStyle(document.querySelector(selector)!).pointerEvents, layer);
    const layers = [".journey__project", ".journey__next", ".journey__last", ".journey__bespoke"];

    for (const layer of layers) expect(await pointer(layer)).toBe("none");

    const expected = [
      { layer: ".journey__project", phase: "project" },
      { layer: ".journey__next", phase: "next" },
      { layer: ".journey__last", phase: "last" },
      { layer: ".journey__bespoke", phase: "bespoke" },
    ];
    for (const { layer, phase } of expected) {
      await link(layer).focus();
      await page.waitForTimeout(1200);
      expect((await state(page)).phase).toBe(phase);
      for (const other of layers) expect(await pointer(other)).toBe(other === layer ? "auto" : "none");
    }

    await link(".journey__bespoke").click();
    await expect(page).toHaveURL(/\/work$/);
  });

  test("has no horizontal overflow on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const p of [0, 0.3, 0.5, 0.64, 0.8, 1]) {
      await whole(page, p);
      expect((await state(page)).overflowX).toBe(0);
    }
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("stacks all chapters in normal flow with no pinned stage and no canvas", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /view project/i })).toHaveCount(4);
    await expect(page.getByRole("link", { name: /view project/i }).last()).toBeVisible();
    const layout = await page.evaluate(() => ({
      stagePosition: getComputedStyle(document.querySelector(".journey__stage")!).position,
      canvases: document.querySelectorAll("canvas").length,
      titleOpacity: Number(getComputedStyle(document.querySelector("[data-j='title']")!).opacity),
    }));
    expect(layout).toEqual({ stagePosition: "relative", canvases: 0, titleOpacity: 1 });
  });
});
