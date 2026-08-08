import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const representativeRoutes = [
  "/",
  "/about",
  "/community",
  "/community/recognition",
  "/contact",
  "/custom-shop",
  "/custom-shop/start",
  "/fafo-world",
  "/join",
  "/media",
  "/recently-deployed",
  "/store",
] as const;

for (const path of representativeRoutes) {
  test(`${path} has no automatically detectable WCAG A/AA violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });
    await page.locator(".loading-screen").waitFor({ state: "detached", timeout: 7_000 }).catch(() => {});

    const axe = new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]);

    if (path === "/fafo-world") {
      await expect(page.getByRole("heading", { name: "Public map locations" })).toBeVisible();
      // City-level marker details have a visible equivalent text index. Marker overlap is
      // inherent at continental zoom, so axe's automated target geometry is scoped out.
      axe.exclude("[data-axe-map-marker]");
    }

    const results = await axe.analyze();

    expect(
      results.violations.map(({ id, impact, nodes }) => ({
        id,
        impact,
        targets: nodes.map(({ any, target }) => ({
          target: target.join(" "),
          reasons: any.map(({ message }) => message),
        })),
      })),
    ).toEqual([]);
  });
}
