import { expect, test } from "@playwright/test";

const routes: { path: string; heading: RegExp }[] = [
  { path: "/", heading: /DESIGN THAT/i },
  { path: "/about", heading: /A small studio with a long view/ },
  { path: "/services", heading: /Design and development, end to end/ },
  { path: "/services/web-design", heading: /^Web design$/ },
  { path: "/work", heading: /Selected projects/ },
  { path: "/work/northlight", heading: /^Northlight$/ },
  { path: "/insights", heading: /Notes from the studio/ },
  { path: "/insights/designing-for-restraint", heading: /Designing for restraint/ },
  { path: "/contact", heading: /Tell us what you're building/ },
];

test.describe("routes", () => {
  for (const { path, heading } of routes) {
    test(`${path} renders with a single h1`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await expect(page).toHaveTitle(/Ravens/);
    });
  }

  test("primary navigation reaches every top-level section via the menu", async ({ page }) => {
    await page.goto("/");
    for (const [label, path] of [
      ["Work", "/work"],
      ["Services", "/services"],
      ["About", "/about"],
      ["Insights", "/insights"],
      ["Contact", "/contact"],
    ] as const) {
      await page.getByRole("button", { name: "Menu" }).click();
      await page.getByRole("dialog", { name: "Site menu" }).getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
    }
  });

  test("serves sitemap, robots and manifest", async ({ request }) => {
    expect((await request.get("/sitemap.xml")).status()).toBe(200);
    expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:");
    expect((await request.get("/manifest.webmanifest")).status()).toBe(200);
    expect((await request.get("/opengraph-image")).headers()["content-type"]).toContain("image/png");
  });
});
