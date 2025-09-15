# テストガイド

このプロジェクトでは、Vitestを使用してテストを実行します。

## セットアップ

必要な依存関係は既にインストール済みです：
- `vitest` - テストランナー
- `@testing-library/react` - Reactコンポーネントテスト
- `@testing-library/jest-dom` - DOMマッチャー
- `@testing-library/user-event` - ユーザーインタラクションシミュレーション
- `jsdom` - DOM環境

## テストの実行

```bash
# すべてのテストを実行（一度だけ）
npm test -- --run

# テストをウォッチモードで実行
npm test

# UIモードでテストを実行（ブラウザで結果を確認）
npm run test:ui

# カバレッジレポート付きでテストを実行
npm run test:coverage

# 特定のファイルのテストを実行
npm test -- --run path/to/test.test.ts
```

## 現在のテストファイル

```
├── components/
│   ├── __tests__/
│   │   ├── manual-card.test.tsx  # ManualCardコンポーネントのテスト
│   │   └── search-box.test.tsx   # SearchBoxコンポーネントのテスト
│   └── ui/
│       └── __tests__/
│           ├── button.test.tsx   # Buttonコンポーネントのテスト
│           ├── card.test.tsx     # Cardコンポーネントのテスト
│           └── input.test.tsx    # Inputコンポーネントのテスト
└── lib/
    └── __tests__/
        └── utils.test.ts         # cnユーティリティ関数のテスト
```

## テストカバレッジ

現在のテストは以下の機能をカバーしています：

### UIコンポーネント
- **Button**: クリックイベント、無効化状態、バリアント、サイズ
- **Card**: 完全なカード構造、カスタムクラス名
- **Input**: ユーザー入力、変更イベント、無効化状態

### 機能コンポーネント
- **SearchBox**: 検索入力、Enter キーでの送信、デバウンス機能、検索アイコン
- **ManualCard**: マニュアル情報表示、カテゴリ、タグ、サムネイル画像

### ユーティリティ
- **cn**: クラス名のマージ、条件付きクラス、Tailwind CSS クラスの最適化

## テストの書き方

### コンポーネントテストの例

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MyComponent } from "../MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("handles user interaction", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<MyComponent onClick={handleClick} />);
    await user.click(screen.getByRole("button"));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### ユーティリティ関数テストの例

```typescript
import { describe, it, expect } from "vitest";
import { myFunction } from "../myFunction";

describe("myFunction", () => {
  it("returns expected value", () => {
    expect(myFunction("input")).toBe("expected output");
  });
});
```

## モックの使用

プロジェクトには以下のモックが設定されています：

- `next/navigation` - Next.jsのルーティング機能
- `@/lib/supabase/client` - Supabaseクライアント
- `@/lib/supabase/server` - Supabaseサーバークライアント

これらは `vitest.setup.ts` で定義されています。

## 注意事項

1. **CSS変数とTailwind**: コンポーネントは実際のCSSクラス名ではなく、Tailwindのユーティリティクラスや CSS変数を使用しています。テストでは正確なクラス名を確認してください。

2. **非同期操作**: ユーザーインタラクションをテストする際は、`userEvent.setup()` を使用し、操作を `await` してください。

3. **Server Components**: Server Componentsはクライアントサイドでレンダリングされないため、モックが必要です。

## トラブルシューティング

### CJS警告
`The CJS build of Vite's Node API is deprecated` という警告が表示される場合がありますが、テストの実行には影響しません。

### テストが失敗する場合
1. モックが正しく設定されているか確認
2. 環境変数が設定されているか確認
3. 依存関係が最新か確認：`npm install`