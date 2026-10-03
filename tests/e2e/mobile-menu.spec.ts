import { expect, test } from "@playwright/test";

test.describe("menu overlay", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
  });

  test("opens as a modal dialog, moves focus inside and locks page scroll", async ({ page }) => {
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "true");
    await expect(dialog.locator(":focus")).toHaveCount(1);
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  });

  test("traps focus in both directions", async ({ page }) => {
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    const focusInside = () => dialog.evaluate((el) => el.contains(document.activeElement));

    for (let i = 0; i < 15; i += 1) {
      await page.keyboard.press("Tab");
      expect(await focusInside()).toBe(true);
    }
    for (let i = 0; i < 15; i += 1) {
      await page.keyboard.press("Shift+Tab");
      expect(await focusInside()).toBe(true);
    }
  });

  test("closes on Escape, unlocks scroll and returns focus to the trigger", async ({ page }) => {
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Site menu" })).toBeHidden();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await expect(page.getByRole("button", { name: "Menu" })).toBeFocused();
  });

  test("closes via the Close button", async ({ page }) => {
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog", { name: "Site menu" })).toBeHidden();
  });
});

test.describe("menu overlay on a phone viewport", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens and fits the screen", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    const box = await page.getByRole("dialog", { name: "Site menu" }).boundingBox();
    expect(box).toMatchObject({ x: 0, y: 0, width: 390, height: 844 });
  });
});
