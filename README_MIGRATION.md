# マイグレーション手順

## 階層カテゴリと契約プラン機能の有効化

現在、データベースに新しいカラムが存在しないためエラーが発生しています。
以下の手順でマイグレーションを実行してください。

### 1. Supabaseダッシュボードでの実行

1. Supabaseダッシュボードにログイン
2. SQL Editorを開く
3. 以下のSQLを実行：

```sql
-- 階層カテゴリと契約プラン機能の追加

-- 契約プランのEnum型を作成
CREATE TYPE contract_plan AS ENUM ('all', 'starter', 'standard');

-- categoriesテーブルに階層構造を追加
ALTER TABLE categories 
ADD COLUMN parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
ADD COLUMN level INTEGER DEFAULT 0 CHECK (level IN (0, 1)), -- 0:大カテゴリ, 1:中カテゴリ
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- 階層構造用インデックス
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_level ON categories(level);

-- manualsテーブルに契約プランとcategory_idを追加
ALTER TABLE manuals 
ADD COLUMN min_plan contract_plan DEFAULT 'all',
ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- プランチェック用インデックス
CREATE INDEX idx_manuals_min_plan ON manuals(min_plan);
CREATE INDEX idx_manuals_category_id ON manuals(category_id);

-- カテゴリ階層ビュー
CREATE VIEW category_hierarchy AS
SELECT 
  c1.id,
  c1.name,
  c1.slug,
  c1.description,
  c1.icon_name,
  c1.parent_id,
  c1.level,
  c1.order_index,
  c1.is_active,
  c2.name as parent_name,
  c2.slug as parent_slug
FROM categories c1
LEFT JOIN categories c2 ON c1.parent_id = c2.id
WHERE c1.is_active = true
ORDER BY c1.level, c1.order_index;

-- マニュアル詳細ビュー
CREATE VIEW manual_details AS
SELECT 
  m.*,
  c.name as category_name,
  c.slug as category_slug,
  c.level as category_level,
  pc.name as parent_category_name,
  pc.slug as parent_category_slug
FROM manuals m
LEFT JOIN categories c ON m.category_id = c.id
LEFT JOIN categories pc ON c.parent_id = pc.id;

-- 既存データの移行（categoryカラムからcategory_idへ）
UPDATE manuals m
SET category_id = c.id
FROM categories c
WHERE c.slug = m.category;
```

### 2. マイグレーション後の対応

1. 以下のコマンドでファイルを入れ替えて、階層機能を有効化：
```bash
mv app/admin/categories/page-hierarchy.tsx app/admin/categories/page.tsx
```

2. シードデータを投入（オプション）：
```bash
npm run seed:hierarchical
```

### 3. 現在の状態

- 現在は階層機能なしのフォールバック版が動作しています
- マイグレーション実行後、完全な階層機能が利用可能になります
- カテゴリページ、ホームページも同様にlevel/parent_idが必要です

### トラブルシューティング

エラーが続く場合は、以下を確認してください：

1. マイグレーションが正しく実行されたか
2. ビュー（category_hierarchy, manual_details）が作成されているか
3. 環境変数が正しく設定されているか