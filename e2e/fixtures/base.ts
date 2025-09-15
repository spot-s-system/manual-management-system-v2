import { test as base } from "@playwright/test";

export const test = base.extend({
  // カスタムフィクスチャを追加可能
  // 例: 認証済みページ、テストデータのセットアップなど
});

export { expect } from "@playwright/test";
