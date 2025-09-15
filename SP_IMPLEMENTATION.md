# SP（スマートフォン）対応実装内容

## 概要
このドキュメントは、manual-management-systemプロジェクトで実施したSP対応の内容を記録したものです。

## 実装方針

### モバイルファースト設計
- Tailwind CSSのデフォルトブレークポイントを使用
  - モバイル: 0-639px（デフォルト）
  - タブレット: 640px～（sm:）
  - デスクトップ: 1024px～（lg:）
- ベースはモバイル向けスタイル、上位デバイス向けにスタイルを追加

## 実装内容

### 1. カテゴリページのサイドバー改善

#### 実装ファイル
- `app/category/[slug]/page.tsx`

#### 内容
- **モバイル表示**
  - フィルターボタンを追加（全幅表示）
  - タップで右側からスライドインするフィルターパネル
  - 適用中のフィルター数をバッジで表示
  - フィルター選択後300msで自動的に閉じる
  - 半透明オーバーレイで背景を暗くする

- **レスポンシブ対応**
  - モバイル（lg未満）: フィルターボタンとモーダル表示
  - デスクトップ（lg以上）: 従来通りサイドバー表示

### 2. マニュアルモーダルのiframe最適化

#### 実装ファイル
- `components/ui/manual-modal.tsx`
- `components/ui/modal.tsx`
- `app/globals.css`

#### 内容
- **モバイル対応**
  - フルスクリーン表示（100vw × 100vh）
  - 固定ヘッダーでスクロールしても閉じるボタンが常に表示
  - 下方向へ100px以上スワイプで閉じる機能
  - iframe読み込み中のローディング表示
  - セーフエリア（ノッチ等）の考慮

- **CSSユーティリティ追加**
  ```css
  .h-screen-safe {
    height: 100vh;
    height: -webkit-fill-available;
  }
  
  .safe-area-inset-top {
    padding-top: env(safe-area-inset-top);
  }
  
  .safe-area-inset-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
  ```

### 3. フォントサイズの統一的な最適化

#### 実装ファイル
- `app/globals.css`
- `app/page.tsx`
- `app/category/[slug]/page.tsx`
- `app/search/page.tsx`
- `app/request/page.tsx`
- `app/manual/[id]/page.tsx`

#### 内容
- **フォントサイズシステム**
  - 最小フォントサイズ: モバイルで14px（text-sm）を確保
  - 見出し: `text-h1`～`text-h4`クラスを追加
  - 本文: `text-body-lg`、`text-body`、`text-body-sm`
  - UI要素: `text-button`、`text-label`、`text-caption`

- **各ページの調整例**
  - ホームページタイトル: `text-3xl sm:text-4xl md:text-5xl`
  - カテゴリページ: `text-2xl sm:text-3xl md:text-4xl`
  - 本文: `text-sm sm:text-base`
  - キャプション: `text-xs sm:text-sm`

### 4. カテゴリページのレイアウト修正

#### 実装ファイル
- `app/category/[slug]/page.tsx`

#### 内容
- **マニュアルカード**
  - モバイルで縦並び: `flex-col sm:flex-row`
  - 画像サイズ: `w-full h-32 sm:w-24 sm:h-16`
  - パディング: `p-3 sm:p-4`

- **タグ表示**
  - 固定幅（w-32）を削除し、`shrink-0`に変更
  - `flex-col sm:flex-row sm:items-center`で配置調整

- **パンくずリスト**
  - モバイルで縦配置: `flex-col sm:flex-row`
  - 戻るボタンの文言: モバイルで「戻る」、デスクトップで「カテゴリ一覧に戻る」
  - フォントサイズ: `text-xs sm:text-sm`

### 5. モバイルナビゲーションの実装と削除

#### 経緯
1. 当初、ハンバーガーメニューを実装（`components/mobile-nav.tsx`）
2. サイト構造を再検討し、以下の理由で削除を決定：
   - ヘッダーがシンプル（ロゴとサイト名のみ）
   - グローバルナビゲーションが不要
   - 全機能にホームページから直接アクセス可能

### 6. その他の改善

#### CTAボタンサイズの維持
- 「操作ガイドをリクエストする」ボタンは重要なため、モバイルでも大きめのサイズを維持
- `px-6 py-3 text-base`で統一

#### アクセシビリティ対応
- キーボード操作の追加（Escape、Enterキー）
- aria属性の適切な設定
- フォーカス管理の実装

## 未実装項目（低優先度）

1. **画像のレスポンシブ対応（srcset）**
   - Next.jsのImageコンポーネントが自動最適化を行うため、追加対応は見送り

2. **管理画面のモバイル対応**
   - テーブルの横スクロール対応など

3. **モバイルパフォーマンスの最適化**
   - 画像の遅延読み込みなど

## テスト方法

### ブラウザでの確認
1. Chrome DevToolsのデバイスモードを使用
2. 主要なブレークポイントで表示確認：
   - 375px（iPhone SE）
   - 390px（iPhone 12/13/14）
   - 768px（iPad）
   - 1024px（デスクトップ境界）

### 確認項目
- レイアウトの崩れがないか
- タップ領域が十分か（最小44×44px）
- フォントサイズが読みやすいか（最小14px）
- モーダルやフィルターの動作が正常か

## 今後の改善提案

1. **パフォーマンス計測**
   - Lighthouse等でモバイルパフォーマンスを測定
   - Core Web Vitalsの改善

2. **実機テスト**
   - iOS Safari、Android Chromeでの動作確認
   - 実際のタッチ操作の使い心地確認

3. **アニメーション最適化**
   - reduced-motionへの対応強化
   - GPUアクセラレーションの活用