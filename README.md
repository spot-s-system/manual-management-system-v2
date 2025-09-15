# マニュアル管理システム

Next.js、TypeScript、Supabaseを使用したマニュアル管理システムです。管理者はマニュアルの登録・編集が可能で、ユーザーはマニュアルの閲覧のみが可能です。

## 技術スタック

- **フレームワーク**: Next.js 15.3.3 (App Router)
- **言語**: TypeScript
- **データベース**: Supabase (PostgreSQL)
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **認証**: Supabase Auth（管理者のみ）
- **リンター/フォーマッター**: Biome
- **テスト**: Vitest, Playwright

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```
### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

```

### 3. Supabaseのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `supabase/schema.sql`のSQLをSupabaseのSQL Editorで実行
3. 管理者用のユーザーをSupabase Authenticationで作成

### 4. 開発サーバーの起動

```bash
npm run dev
```

## プロジェクト構成

```
manual-management-system/
├── app/                      # Next.js App Router
│   ├── admin/               # 管理画面
│   │   ├── login/          # 管理者ログイン
│   │   ├── manuals/        # マニュアル管理
│   │   └── requests/       # マニュアルリクエスト管理
│   ├── manual/[id]/         # マニュアル詳細ページ
│   ├── category/[slug]/     # カテゴリ別マニュアル一覧
│   ├── constants/           # 定数定義（カテゴリ、タグ）
│   └── page.tsx             # トップページ
├── components/              # UIコンポーネント
├── lib/                     # ユーティリティ
│   └── supabase/           # Supabaseクライアント
├── types/                   # TypeScript型定義
├── e2e/                     # E2Eテスト
└── supabase/               # データベーススキーマ
```

## 機能

### ユーザー向け機能
- マニュアル一覧の閲覧
- カテゴリ別でのマニュアル表示（大カテゴリ・中カテゴリ対応）
- マニュアル詳細の閲覧（iframe埋め込み対応）
- タグによる分類表示（管理者向け、従業員向け、freee契約プラン別）
  - 各マニュアルに該当する全ての契約プラン（ミニマム、スターター、スタンダード、プロフェッショナル、アドバンス）を表示
- 対象者によるフィルタリング機能
- 検索機能（タイトル、カテゴリー、タグでの複合検索）
- マニュアルリクエスト機能

### 管理者向け機能
- Supabase認証によるログイン
- マニュアルの作成・編集・削除
- 固定カテゴリによる分類管理
- マニュアルの公開/非公開設定
- 表示順序の管理
- マニュアルリクエストの管理・対応

## 開発コマンド

```bash
# 開発サーバー起動（Turbopack使用）
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# コード品質チェック
npm run lint        # Biomeによるリント
npm run lint:fix    # リントエラーの自動修正
npm run format      # コードフォーマット
npm run format:check # フォーマットチェック
npm run type-check  # TypeScript型チェック

# テスト
npm run test        # Vitestによるユニットテスト
npm run test:watch  # テストをwatch mode
npm run test:e2e    # Playwrightによる E2Eテスト
```

## デプロイ

Vercelへのデプロイを推奨します：

1. GitHubにリポジトリをプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

## 検索機能の仕様

### 検索対象
- **マニュアルタイトル**: 部分一致検索（大文字小文字を区別しない）
- **メインカテゴリー**: 「入社」「退職」などカテゴリー名で検索可能
- **サブカテゴリー**: 「本人情報」「給与情報」などで検索可能
- **タグ**: 「管理者向け」「従業員向け」、契約プラン（ミニマム、スターター等）などタグで検索可能

### 検索の特徴
- OR検索（いずれかの条件に一致すれば表示）
- 検索結果のハイライト表示
- ホームページの検索セクションから利用可能
- 空の検索は実行されない

### データベースインデックス
検索パフォーマンス向上のため、以下のマイグレーションを実行してください：
```sql
-- supabase/migrations/20250608_add_search_indexes.sql を実行
```