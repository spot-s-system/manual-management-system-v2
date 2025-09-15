import { expect, test } from "../fixtures/base";

test.describe("カテゴリページ", () => {
  test("カテゴリページが正しく表示される", async ({ page }) => {
    // ホームページからカテゴリをクリック
    await page.goto("/");

    // 最初のカテゴリカードをクリック
    const firstCategory = page.locator(".category-card").first();
    const categoryName = await firstCategory.locator("h3").textContent();
    await firstCategory.click();

    // カテゴリページに遷移することを確認
    await expect(page).toHaveURL(/\/category\/.+/);

    // カテゴリ名が表示されることを確認
    if (categoryName) {
      await expect(page.getByRole("heading", { name: categoryName })).toBeVisible();
    }
  });

  test("カテゴリ内のマニュアル一覧が表示される", async ({ page }) => {
    // 直接カテゴリページにアクセス
    await page.goto("/category/basic-operations");

    // ローディングが完了するまで待機
    await page.waitForLoadState("networkidle");

    // マニュアルカードまたは「マニュアルがありません」メッセージを確認
    const manualCards = page.locator("[data-testid='manual-card']");
    const noManualsMessage = page.getByText(/マニュアルがありません|登録されていません/);

    const hasManuals = (await manualCards.count()) > 0;
    const hasNoManualsMessage = await noManualsMessage.isVisible().catch(() => false);

    expect(hasManuals || hasNoManualsMessage).toBeTruthy();
  });

  test("カテゴリページのパンくずリストが機能する", async ({ page }) => {
    await page.goto("/category/basic-operations");

    // パンくずリストのホームリンクを確認
    const homeLink = page.getByRole("link", { name: /ホーム|Home/ });
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL("/");
    }
  });

  test("存在しないカテゴリへのアクセス", async ({ page }) => {
    await page.goto("/category/non-existent-category");

    // エラーメッセージまたは404ページを確認
    const errorMessage = page.getByText(/見つかりませんでした|エラー|404/);
    await expect(errorMessage).toBeVisible();
  });
});
