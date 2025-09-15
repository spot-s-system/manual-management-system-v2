import { expect, test } from "../fixtures/base";

test.describe("マニュアル詳細ページ", () => {
  test("マニュアルカードからモーダルが開く", async ({ page }) => {
    await page.goto("/");

    // 最初のマニュアルカードをクリック
    const firstManualCard = page.locator("[data-testid='manual-card']").first();
    await firstManualCard.click();

    // モーダルが表示されることを確認
    const modal = page.locator("[role='dialog']");
    await expect(modal).toBeVisible();

    // モーダル内にマニュアル情報が表示されることを確認
    const modalTitle = modal.locator("h2");
    await expect(modalTitle).toBeVisible();
  });

  test("モーダルの閉じるボタンが機能する", async ({ page }) => {
    await page.goto("/");

    // マニュアルカードをクリックしてモーダルを開く
    const firstManualCard = page.locator("[data-testid='manual-card']").first();
    await firstManualCard.click();

    const modal = page.locator("[role='dialog']");
    await expect(modal).toBeVisible();

    // 閉じるボタンをクリック
    const closeButton = modal.getByRole("button", { name: /閉じる|Close|×/ });
    await closeButton.click();

    // モーダルが閉じることを確認
    await expect(modal).not.toBeVisible();
  });

  test("マニュアル詳細ページへの直接アクセス", async ({ page }) => {
    // マニュアルIDを使用して直接アクセス（実際のIDに置き換える必要があります）
    await page.goto("/manual/1");

    // ページが正しく表示されることを確認
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("マニュアルのダウンロードリンクが機能する", async ({ page }) => {
    await page.goto("/");

    // マニュアルカードをクリック
    const firstManualCard = page.locator("[data-testid='manual-card']").first();
    await firstManualCard.click();

    const modal = page.locator("[role='dialog']");
    const downloadLink = modal.getByRole("link", { name: /ダウンロード|開く|View/ });

    if (await downloadLink.isVisible()) {
      // リンクが正しいURL形式であることを確認
      const href = await downloadLink.getAttribute("href");
      expect(href).toMatch(/^https?:\/\/.+/);

      // target="_blank"が設定されていることを確認
      const target = await downloadLink.getAttribute("target");
      expect(target).toBe("_blank");
    }
  });

  test("タグが正しく表示される", async ({ page }) => {
    await page.goto("/");

    // タグを持つマニュアルカードを探す
    const manualWithTags = page
      .locator("[data-testid='manual-card']")
      .filter({
        has: page.locator("text=#"),
      })
      .first();

    if (await manualWithTags.isVisible()) {
      await manualWithTags.click();

      const modal = page.locator("[role='dialog']");
      const tags = modal.locator("text=#");

      // 少なくとも1つのタグが表示されることを確認
      await expect(tags.first()).toBeVisible();
    }
  });
});
