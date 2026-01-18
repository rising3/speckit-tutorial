import { test, expect } from "@playwright/test";

test.describe("写真インポートとアルバム自動グループ化", () => {
  test("写真をインポートすると日付ごとにアルバムが作成される", async ({ page }) => {
    await page.goto("/");
    // ファイルインプットを探す
    const fileInput = page.locator("input[type=\"file\"]");
    await expect(fileInput).toBeVisible();
    // テスト用画像ファイルをアップロード（仮: sample1.jpg, sample2.jpg）
    // 実際のテストでは fixtures ディレクトリ等に画像を用意する必要あり
    await fileInput.setInputFiles([
      "tests/fixtures/sample1.jpg",
      "tests/fixtures/sample2.jpg"
    ]);
    // アルバムが2つ以上できていることを確認
    const albums = page.locator(".album-item");
    await expect(albums).toHaveCountGreaterThan(1);
  });
});
