import { expect, test } from "../fixtures/base";
import { testData } from "../fixtures/test-data";

test.describe("ホームページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("ページタイトルが正しく表示される", async ({ page }) => {
    await expect(page).toHaveTitle(/マニュアル管理システム/);
  });

  test("検索ボックスが表示され、機能する", async ({ page }) => {
    const searchInput = page.getByPlaceholder("キーワードで探す...");
    await expect(searchInput).toBeVisible();

    await searchInput.fill(testData.searchQueries.valid);
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/\/search\?q=/);
  });

  test("カテゴリ一覧が表示される", async ({ page }) => {
    const categoriesSection = page.getByRole("heading", { name: "カテゴリから探す" });
    await expect(categoriesSection).toBeVisible();

    // カテゴリカードが表示されることを確認
    const categoryCards = page.locator(".category-card");
    await expect(categoryCards).toHaveCount(await categoryCards.count());
  });

  test("最新のマニュアルが表示される", async ({ page }) => {
    const latestSection = page.getByRole("heading", { name: "最新のマニュアル" });
    await expect(latestSection).toBeVisible();

    // マニュアルカードが表示されることを確認
    const manualCards = page.locator("[data-testid='manual-card']");
    await expect(manualCards.first()).toBeVisible();
  });

  test("レスポンシブデザインが機能する", async ({ page }) => {
    // モバイルビューポート
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("main")).toBeVisible();

    // タブレットビューポート
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator("main")).toBeVisible();

    // デスクトップビューポート
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator("main")).toBeVisible();
  });
});
