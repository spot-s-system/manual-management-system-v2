-- 検索パフォーマンス向上のためのインデックスとトリガーを追加

-- まず既存のカラムがあれば削除
ALTER TABLE manuals DROP COLUMN IF EXISTS search_text;

-- 検索用のテキストカラムを追加（通常のカラムとして）
ALTER TABLE manuals ADD COLUMN IF NOT EXISTS search_text tsvector;

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_manuals_search_text ON manuals USING GIN (search_text);
CREATE INDEX IF NOT EXISTS idx_manuals_title ON manuals USING btree (lower(title));
CREATE INDEX IF NOT EXISTS idx_manuals_main_category ON manuals USING btree (lower(main_category));
CREATE INDEX IF NOT EXISTS idx_manuals_sub_category ON manuals USING btree (lower(sub_category));
CREATE INDEX IF NOT EXISTS idx_manuals_tags ON manuals USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_manuals_is_published ON manuals USING btree (is_published);
CREATE INDEX IF NOT EXISTS idx_manuals_published_order ON manuals (is_published, order_index);

-- 検索テキストを更新する関数
CREATE OR REPLACE FUNCTION update_manual_search_text()
RETURNS trigger AS $$
BEGIN
  NEW.search_text := to_tsvector('simple',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.main_category, '') || ' ' ||
    coalesce(NEW.sub_category, '') || ' ' ||
    coalesce(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
DROP TRIGGER IF EXISTS trigger_update_manual_search_text ON manuals;
CREATE TRIGGER trigger_update_manual_search_text
BEFORE INSERT OR UPDATE ON manuals
FOR EACH ROW
EXECUTE FUNCTION update_manual_search_text();

-- 既存のデータの検索テキストを更新
UPDATE manuals 
SET search_text = to_tsvector('simple',
  coalesce(title, '') || ' ' ||
  coalesce(main_category, '') || ' ' ||
  coalesce(sub_category, '') || ' ' ||
  coalesce(array_to_string(tags, ' '), '')
);

-- 検索用のビューを作成（より使いやすくするため）
CREATE OR REPLACE VIEW manuals_search AS
SELECT 
  *,
  ts_rank(search_text, plainto_tsquery('simple', '')) as search_rank
FROM manuals
WHERE is_published = true;

-- 検索関数（シンプル版）
CREATE OR REPLACE FUNCTION search_manuals(search_query text)
RETURNS TABLE (
  id uuid,
  title text,
  url text,
  main_category text,
  sub_category text,
  tags text[],
  created_at timestamptz,
  updated_at timestamptz,
  is_published boolean,
  order_index integer,
  search_rank real
) AS $$
BEGIN
  -- 検索クエリが空の場合は全件返す
  IF search_query IS NULL OR search_query = '' THEN
    RETURN QUERY
    SELECT 
      m.id,
      m.title,
      m.url,
      m.main_category,
      m.sub_category,
      m.tags,
      m.created_at,
      m.updated_at,
      m.is_published,
      m.order_index,
      0::real as search_rank
    FROM manuals m
    WHERE m.is_published = true
    ORDER BY m.order_index ASC;
  ELSE
    RETURN QUERY
    SELECT 
      m.id,
      m.title,
      m.url,
      m.main_category,
      m.sub_category,
      m.tags,
      m.created_at,
      m.updated_at,
      m.is_published,
      m.order_index,
      CASE 
        -- タイトル完全一致は最高スコア
        WHEN lower(m.title) = lower(search_query) THEN 1.0
        -- タイトル部分一致は高スコア
        WHEN lower(m.title) LIKE '%' || lower(search_query) || '%' THEN 0.8
        -- カテゴリ一致は中スコア
        WHEN lower(m.main_category) LIKE '%' || lower(search_query) || '%' 
          OR lower(m.sub_category) LIKE '%' || lower(search_query) || '%' THEN 0.6
        -- タグ一致は低スコア
        WHEN EXISTS (
          SELECT 1 FROM unnest(m.tags) AS tag
          WHERE lower(tag) LIKE '%' || lower(search_query) || '%'
        ) THEN 0.4
        -- 全文検索一致は最低スコア
        ELSE 0.2
      END::real as search_rank
    FROM manuals m
    WHERE m.is_published = true
    AND (
      -- タイトルの部分一致
      lower(m.title) LIKE '%' || lower(search_query) || '%'
      -- メインカテゴリーの部分一致
      OR lower(m.main_category) LIKE '%' || lower(search_query) || '%'
      -- サブカテゴリーの部分一致
      OR lower(m.sub_category) LIKE '%' || lower(search_query) || '%'
      -- タグの部分一致
      OR EXISTS (
        SELECT 1 FROM unnest(m.tags) AS tag
        WHERE lower(tag) LIKE '%' || lower(search_query) || '%'
      )
      -- 全文検索
      OR m.search_text @@ plainto_tsquery('simple', search_query)
    )
    ORDER BY search_rank DESC, m.order_index ASC;
  END IF;
END;
$$ LANGUAGE plpgsql;