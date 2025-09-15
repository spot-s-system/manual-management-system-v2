-- カテゴリテーブル
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  order_index INTEGER DEFAULT 0
);

-- マニュアルテーブル
CREATE TABLE manuals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0
);

-- インデックス
CREATE INDEX idx_manuals_category ON manuals(category);
CREATE INDEX idx_manuals_is_published ON manuals(is_published);
CREATE INDEX idx_categories_slug ON categories(slug);

-- RLS (Row Level Security) を有効化
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE manuals ENABLE ROW LEVEL SECURITY;

-- すべてのユーザーが読み取り可能なポリシー
CREATE POLICY "Categories are viewable by everyone" 
  ON categories FOR SELECT 
  USING (true);

CREATE POLICY "Published manuals are viewable by everyone" 
  ON manuals FOR SELECT 
  USING (is_published = true);

-- 管理者のみが作成・更新・削除可能（実際の認証なしなので、アプリケーション側で制御）
-- ここではRLSは読み取り専用に設定

-- カテゴリの挿入を許可するポリシー（開発用）
CREATE POLICY "Allow category inserts" 
  ON categories FOR INSERT 
  WITH CHECK (true);

-- カテゴリの更新を許可するポリシー（開発用）
CREATE POLICY "Allow category updates" 
  ON categories FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- カテゴリの削除を許可するポリシー（開発用）
CREATE POLICY "Allow category deletes" 
  ON categories FOR DELETE 
  USING (true);

-- マニュアルの挿入を許可するポリシー（開発用）
CREATE POLICY "Allow manual inserts" 
  ON manuals FOR INSERT 
  WITH CHECK (true);

-- マニュアルの更新を許可するポリシー（開発用）
CREATE POLICY "Allow manual updates" 
  ON manuals FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- マニュアルの削除を許可するポリシー（開発用）
CREATE POLICY "Allow manual deletes" 
  ON manuals FOR DELETE 
  USING (true);