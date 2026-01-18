import { test, expect } from "@playwright/test";

test("トップページが表示される", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.locator("h1")).toHaveText("Photo Album Organizer");
});
