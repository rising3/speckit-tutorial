import { test, expect } from "@playwright/test";

test.describe("アルバム詳細タイルUI", () => {
  test("アルバム詳細で写真がタイル状に表示されプレビューできる", async ({ page }) => {
    await page.goto("/");
    // 最初のアルバムをクリック
    const album = page.locator(".album-item").first();
    await album.click();
    // タイル画像が表示されているか
    const tiles = page.locator(".photo-thumb");
    await expect(tiles).toHaveCountGreaterThan(1);
    // 1枚目をクリックでモーダルが出る
    await tiles.first().click();
    await expect(page.locator(".photo-modal")).toBeVisible();
    // Escで閉じる
    await page.keyboard.press("Escape");
    await expect(page.locator(".photo-modal")).not.toBeVisible();
  });
});
