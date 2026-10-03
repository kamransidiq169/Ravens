import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["github"]] : [["list"]],
  // Baselines are shared across platforms; the small ratio absorbs font anti-aliasing differences.
  snapshotPathTemplate: "{testDir}/__baselines__/{projectName}/{arg}{ext}",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: "disabled" } },
  use: { baseURL, trace: "retain-on-failure" },
  webServer: {
    command: `node scripts/dev/serve-prod.mjs ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  projects: [
    {
      name: "e2e",
      testDir: "./tests/e2e",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "visual-desktop",
      testDir: "./tests/visual",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" },
    },
    {
      name: "visual-mobile",
      testDir: "./tests/visual",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, reducedMotion: "reduce" },
    },
  ],
});
