import { expect, test } from "@playwright/test";

test("credential-free member access stays truthful and inert", async ({ page, request }) => {
  await page.goto("/join");
  await expect(page.getByText("Member access is not open in this environment")).toBeVisible();
  await expect(page.getByRole("link", { name: "Create member account" })).toHaveCount(0);

  const signIn = await request.get("/auth/sign-in", { maxRedirects: 0 });
  expect(signIn.status()).toBe(307);
  expect(signIn.headers().location).toContain("/join?auth=configuration-required");

  const callback = await request.get("/auth/callback");
  expect(callback.status()).toBe(503);
  await expect(callback.json()).resolves.toEqual({
    error: "Member authentication is not configured in this environment.",
  });

  const signOutGet = await request.get("/auth/sign-out");
  expect(signOutGet.status()).toBe(405);

  await page.goto("/account");
  await expect(page.getByRole("heading", { name: "Private account access is not enabled here" })).toBeVisible();

  const unknownMember = await request.get("/members/not-a-public-member");
  expect(unknownMember.status()).toBe(404);
});
