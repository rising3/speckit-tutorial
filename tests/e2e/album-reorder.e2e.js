import { test, expect } from "@playwright/test";

test.describe("アルバム並べ替え", () => {
  test("ドラッグ&ドロップでアルバム順序が変わり永続化される", async ({ page }) => {
    await page.goto("/");
    // アルバムが2つ以上ある前提
    const items = page.locator(".album-item");
    await expect(items).toHaveCountGreaterThan(1);
    // 最初の2つのタイトル取得
    const firstTitle = await items.nth(0).textContent();
    const secondTitle = await items.nth(1).textContent();
    // 1番目を2番目の下にドラッグ
    await items.nth(0).dragTo(items.nth(1));
    // 並び順が変わったか確認
    const newFirst = await items.nth(0).textContent();
    const newSecond = await items.nth(1).textContent();
    expect(newFirst).toBe(secondTitle);
    expect(newSecond).toBe(firstTitle);
    // ページリロード後も順序が維持されているか
    await page.reload();
    const afterReload = page.locator(".album-item");
    expect(await afterReload.nth(0).textContent()).toBe(secondTitle);
    expect(await afterReload.nth(1).textContent()).toBe(firstTitle);
  });
});
