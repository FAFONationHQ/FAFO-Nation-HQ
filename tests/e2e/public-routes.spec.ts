import { expect, test } from "@playwright/test";

import { PUBLIC_ROUTES } from "../../lib/navigation/public-routes";

for (const { path } of PUBLIC_ROUTES) {
  test(`${path} renders a usable public page`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });

    expect(response?.status(), `${path} should return a successful response`).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page).toHaveTitle(/FAFO/i);

    const overflowsViewport = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflowsViewport, `${path} should not overflow horizontally`).toBe(false);
  });
}

test("primary navigation reaches the truthful join experience", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".loading-screen")).toBeHidden({ timeout: 7_000 });
  const joinLink = page.getByRole("link", { name: /join/i }).first();
  await expect(joinLink).toBeVisible();
  await joinLink.click();
  await expect(page).toHaveURL(/\/join$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

const responsiveRoutes = [
  "/",
  "/join",
  "/fafo-world",
  "/custom-shop",
  "/media",
  "/store",
] as const;

for (const path of responsiveRoutes) {
  test(`${path} remains usable without horizontal overflow on a narrow viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
    const layout = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      contentWidth: document.documentElement.scrollWidth,
    }));
    expect(layout.contentWidth, `${path} should fit the narrow viewport`).toBeLessThanOrEqual(
      layout.viewportWidth + 1,
    );
  });
}
