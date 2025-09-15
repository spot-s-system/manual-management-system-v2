import type { Page } from "@playwright/test";
import { testData } from "../fixtures/test-data";

export async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");

  const passwordInput = page.getByPlaceholder(/パスワード/);
  await passwordInput.fill(testData.adminCredentials.password);

  const loginButton = page.getByRole("button", { name: /ログイン|Login/ });
  await loginButton.click();

  // ログイン成功を待つ
  await page.waitForURL("/admin");
}
