import { expect, test } from "@playwright/test";

test.describe("contact form", () => {
  test("shows accessible validation errors and focuses the first invalid field", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: /Send message/ }).click();

    const name = page.getByLabel("Name");
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toBeFocused();
    await expect(page.getByText("Please tell us your name.")).toBeVisible();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await expect(page.getByText(/at least 20 characters/)).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: "Please fix" })).toBeVisible();
    await expect(name).toHaveAttribute("aria-describedby", "contact-name-error");
  });

  test("clears errors once corrected and submits successfully", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: /Send message/ }).click();

    await page.getByLabel("Name").fill("Ada Lovelace");
    await page.getByLabel("Email").fill("ada@example.com");
    await page
      .getByLabel("Tell us about your project")
      .fill("We'd like help with a new brand and website this spring.");
    await page.getByRole("button", { name: /Send message/ }).click();

    await expect(page.getByRole("status")).toContainText("Message sent");
    await expect(page.getByRole("status")).toContainText("We'll reply within two working days");
  });

  test("honeypot submissions look successful to bots", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Name").fill("Bot");
    await page.getByLabel("Email").fill("bot@example.com");
    await page
      .getByLabel("Tell us about your project")
      .fill("Buy cheap things from our totally legitimate website now.");
    await page.locator("#contact-website").fill("http://spam.example", { force: true });
    await page.getByRole("button", { name: /Send message/ }).click();
    await expect(page.getByRole("status")).toContainText("Message sent");
  });
});
