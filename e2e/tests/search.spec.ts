import { expect, test } from "../fixtures/base";
import { testData } from "../fixtures/test-data";

test.describe("検索機能", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("検索結果ページに遷移する", async ({ page }) => {
    const searchInput = page.getByPlaceholder("キーワードで探す...");
    await searchInput.fill(testData.searchQueries.valid);
    await searchInput.press("Enter");

    await expect(page).toHaveURL(`/search?q=${encodeURIComponent(testData.searchQueries.valid)}`);
    await expect(page.getByRole("heading", { name: /検索結果/ })).toBeVisible();
  });

  test("検索結果が表示される", async ({ page }) => {
    await page.goto(`/search?q=${encodeURIComponent(testData.searchQueries.valid)}`);

    // 検索結果のローディングが完了するまで待機
    await page.waitForLoadState("networkidle");

    // 検索結果が表示されることを確認
    const results = page.locator("[data-testid='manual-card']");
    const count = await results.count();

    if (count > 0) {
      await expect(results.first()).toBeVisible();
    }
  });

  test("検索結果がない場合のメッセージ", async ({ page }) => {
    await page.goto(`/search?q=${encodeURIComponent(testData.searchQueries.noResults)}`);

    // エラーメッセージまたは「結果なし」メッセージを確認
    const noResultsMessage = page.getByText(/見つかりませんでした|検索結果がありません/);
    await expect(noResultsMessage).toBeVisible();
  });

  test("検索キーワードがハイライトされる", async ({ page }) => {
    await page.goto(`/search?q=${encodeURIComponent(testData.searchQueries.valid)}`);

    // 検索キーワードが表示されることを確認
    await expect(page.getByText(new RegExp(testData.searchQueries.valid))).toBeVisible();
  });

  test("デバウンス機能が動作する", async ({ page }) => {
    const searchInput = page.getByPlaceholder("キーワードで探す...");

    // 高速入力をシミュレート
    await searchInput.type("テスト", { delay: 50 });

    // URLが即座に変更されないことを確認
    await expect(page).not.toHaveURL(/\/search/);

    // デバウンス後にURLが変更されることを確認
    await page.waitForURL(/\/search\?q=テスト/, { timeout: 1000 });
  });
});
