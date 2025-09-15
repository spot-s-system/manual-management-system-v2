-- 既存のデータベースを更新するためのマイグレーションSQL
-- 注意: このSQLを実行する前に必ずバックアップを取ってください

-- 1. 新しいカラムを追加
ALTER TABLE manuals ADD COLUMN url TEXT;

-- 2. 既存のデータがある場合は、contentカラムの値をurlカラムにコピー（必要に応じて）
-- UPDATE manuals SET url = content WHERE url IS NULL;

-- 3. urlカラムをNOT NULLに設定
ALTER TABLE manuals ALTER COLUMN url SET NOT NULL;

-- 4. contentカラムを削除
ALTER TABLE manuals DROP COLUMN content;