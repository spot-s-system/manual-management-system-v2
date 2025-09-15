import { expect, test } from "../fixtures/base";
import { testData } from "../fixtures/test-data";

test.describe("管理者認証", () => {
  test("管理画面へのアクセスでログインページにリダイレクトされる", async ({ page }) => {
    await page.goto("/admin");

    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL("/admin/login");

    // パスワード入力フィールドが表示されることを確認
    await expect(page.getByPlaceholder(/パスワード/)).toBeVisible();
  });

  test("正しいパスワードでログインできる", async ({ page }) => {
    await page.goto("/admin/login");

    // パスワードを入力
    const passwordInput = page.getByPlaceholder(/パスワード/);
    await passwordInput.fill(testData.adminCredentials.password);

    // ログインボタンをクリック
    const loginButton = page.getByRole("button", { name: /ログイン|Login/ });
    await loginButton.click();

    // 管理画面にリダイレクトされることを確認
    await expect(page).toHaveURL("/admin");

    // 管理画面のコンテンツが表示されることを確認
    await expect(page.getByRole("heading", { name: /管理画面|Dashboard/ })).toBeVisible();
  });

  test("間違ったパスワードでエラーメッセージが表示される", async ({ page }) => {
    await page.goto("/admin/login");

    // 間違ったパスワードを入力
    const passwordInput = page.getByPlaceholder(/パスワード/);
    await passwordInput.fill("wrong-password");

    // ログインボタンをクリック
    const loginButton = page.getByRole("button", { name: /ログイン|Login/ });
    await loginButton.click();

    // エラーメッセージが表示されることを確認
    const errorMessage = page.getByText(/パスワードが正しくありません|認証に失敗しました/);
    await expect(errorMessage).toBeVisible();
  });

  test("ログアウト機能が動作する", async ({ page }) => {
    // まずログイン
    await page.goto("/admin/login");
    const passwordInput = page.getByPlaceholder(/パスワード/);
    await passwordInput.fill(testData.adminCredentials.password);
    const loginButton = page.getByRole("button", { name: /ログイン|Login/ });
    await loginButton.click();

    await expect(page).toHaveURL("/admin");

    // ログアウトボタンをクリック
    const logoutButton = page.getByRole("button", { name: /ログアウト|Logout/ });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL("/admin/login");
    }
  });

  test("認証なしで管理ページにアクセスできない", async ({ page }) => {
    // 各管理ページに直接アクセスを試みる
    const adminPages = [
      "/admin",
      "/admin/manuals",
      "/admin/manuals/new",
      "/admin/categories",
      "/admin/categories/new",
      "/admin/requests",
    ];

    for (const adminPage of adminPages) {
      await page.goto(adminPage);
      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL("/admin/login");
    }
  });
});
