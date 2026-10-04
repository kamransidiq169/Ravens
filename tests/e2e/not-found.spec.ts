import { expect, test } from "@playwright/test";

const unknown = ["/nope", "/work/does-not-exist", "/services/does-not-exist", "/insights/does-not-exist"];

test.describe("404s", () => {
  for (const path of unknown) {
    test(`${path} returns 404 with the on-brand page`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lost in flight");
      await expect(page.getByRole("link", { name: /Back home/ })).toBeVisible();
    });
  }
});
