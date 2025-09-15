-- 固定カテゴリ用のカラムを追加（存在しない場合のみ）
ALTER TABLE manuals 
ADD COLUMN IF NOT EXISTS main_category TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS sub_category TEXT;

-- インデックスを追加（存在しない場合のみ）
CREATE INDEX IF NOT EXISTS idx_manuals_main_category ON manuals(main_category);
CREATE INDEX IF NOT EXISTS idx_manuals_sub_category ON manuals(sub_category);
CREATE INDEX IF NOT EXISTS idx_manuals_categories ON manuals(main_category, sub_category);

-- 旧カテゴリカラムを削除（存在する場合のみ）
ALTER TABLE manuals 
DROP COLUMN IF EXISTS category CASCADE,
DROP COLUMN IF EXISTS category_id CASCADE;

-- 不要なカラムを削除（存在する場合のみ）
ALTER TABLE manuals 
DROP COLUMN IF EXISTS min_plan CASCADE,
DROP COLUMN IF EXISTS thumbnail_url CASCADE,
DROP COLUMN IF EXISTS release_date CASCADE;

-- カテゴリビューを削除（使わないため）
DROP VIEW IF EXISTS category_hierarchy CASCADE;
DROP VIEW IF EXISTS manual_details CASCADE;

-- categoriesテーブルも不要なら削除
DROP TABLE IF EXISTS categories CASCADE;