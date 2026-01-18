import { test, expect } from "@playwright/test";

test.describe("Photo Album Organizer regression", () => {
  test("トップページが表示される", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".album-list")).toBeVisible();
  });
});
