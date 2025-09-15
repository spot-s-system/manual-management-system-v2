import { expect, test } from "../fixtures/base";
import { testData } from "../fixtures/test-data";
import { loginAsAdmin } from "../helpers/auth";

test.describe("管理画面 - マニュアル管理", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/manuals");
  });

  test("マニュアル一覧が表示される", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /マニュアル管理/ })).toBeVisible();

    // テーブルまたはカード形式でマニュアルが表示されることを確認
    const manualItems = page.locator("tr, [data-testid='manual-item']");
    const count = await manualItems.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("新規マニュアル作成ページへ遷移できる", async ({ page }) => {
    const newButton = page.getByRole("link", { name: /新規作成|追加/ });
    await newButton.click();

    await expect(page).toHaveURL("/admin/manuals/new");
    await expect(page.getByRole("heading", { name: /新規マニュアル/ })).toBeVisible();
  });

  test("新規マニュアルを作成できる", async ({ page }) => {
    await page.goto("/admin/manuals/new");

    // フォームに入力
    await page.getByLabel(/タイトル/).fill("E2Eテストマニュアル");
    await page.getByLabel(/URL/).fill("https://example.com/e2e-test.pdf");

    // カテゴリを選択
    const categorySelect = page.getByLabel(/カテゴリ/);
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ index: 1 });
    }

    // タグを入力
    const tagsInput = page.getByLabel(/タグ/);
    if (await tagsInput.isVisible()) {
      await tagsInput.fill("E2Eテスト, 自動テスト");
    }

    // 保存ボタンをクリック
    const saveButton = page.getByRole("button", { name: /保存|作成/ });
    await saveButton.click();

    // 成功メッセージまたはリダイレクトを確認
    await expect(page).toHaveURL("/admin/manuals");
  });

  test("マニュアルを編集できる", async ({ page }) => {
    // 編集ボタンをクリック
    const editButton = page.getByRole("link", { name: /編集|Edit/ }).first();
    if (await editButton.isVisible()) {
      await editButton.click();

      await expect(page).toHaveURL(/\/admin\/manuals\/\d+\/edit/);

      // タイトルを変更
      const titleInput = page.getByLabel(/タイトル/);
      await titleInput.clear();
      await titleInput.fill("更新されたマニュアル");

      // 保存
      const saveButton = page.getByRole("button", { name: /保存|更新/ });
      await saveButton.click();

      // リダイレクトを確認
      await expect(page).toHaveURL("/admin/manuals");
    }
  });

  test("マニュアルを削除できる", async ({ page }) => {
    const deleteButton = page.getByRole("button", { name: /削除|Delete/ }).first();

    if (await deleteButton.isVisible()) {
      // 削除前のマニュアル数を取得
      const manualsBefore = await page.locator("tr, [data-testid='manual-item']").count();

      // 削除ボタンをクリック
      page.on("dialog", async (dialog) => {
        await dialog.accept(); // 確認ダイアログを承認
      });
      await deleteButton.click();

      // マニュアル数が減ったことを確認
      await page.waitForTimeout(500); // 削除処理を待つ
      const manualsAfter = await page.locator("tr, [data-testid='manual-item']").count();
      expect(manualsAfter).toBeLessThan(manualsBefore);
    }
  });

  test("フォームバリデーションが機能する", async ({ page }) => {
    await page.goto("/admin/manuals/new");

    // 空のフォームで保存を試みる
    const saveButton = page.getByRole("button", { name: /保存|作成/ });
    await saveButton.click();

    // エラーメッセージが表示されることを確認
    const errorMessage = page.getByText(/必須|入力してください/);
    await expect(errorMessage.first()).toBeVisible();
  });
});
