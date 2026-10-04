import { expect, test, type Page } from "@playwright/test";

const routes: [name: string, path: string][] = [
  ["home", "/"],
  ["about", "/about"],
  ["services", "/services"],
  ["service-detail", "/services/web-design"],
  ["work", "/work"],
  ["work-detail", "/work/northlight"],
  ["insights", "/insights"],
  ["insight-detail", "/insights/designing-for-restraint"],
  ["contact", "/contact"],
  ["not-found", "/nope"],
];

/** Scroll the whole page so lazy images load, then wait for fonts and images before capturing. */
async function settle(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images)
        // Images that are not rendered (display: none) are lazy and never load.
        .filter((img) => img.getClientRects().length > 0)
        .map((img) => (img.complete ? null : new Promise((r) => img.addEventListener("load", r, { once: true })))),
    );
  });
}

for (const [name, path] of routes) {
  test(`visual: ${name}`, async ({ page }) => {
    await page.goto(path);
    await settle(page);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}
