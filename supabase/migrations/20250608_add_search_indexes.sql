-- 検索パフォーマンス向上のためのインデックスを追加

-- タイトル、カテゴリー、タグの個別インデックスを作成（高速化のため）
CREATE INDEX IF NOT EXISTS idx_manuals_title ON manuals USING btree (lower(title));
CREATE INDEX IF NOT EXISTS idx_manuals_main_category ON manuals USING btree (lower(main_category));
CREATE INDEX IF NOT EXISTS idx_manuals_sub_category ON manuals USING btree (lower(sub_category));
CREATE INDEX IF NOT EXISTS idx_manuals_tags ON manuals USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_manuals_is_published ON manuals USING btree (is_published);

-- 複合インデックス（よく使われる検索条件の組み合わせ）
CREATE INDEX IF NOT EXISTS idx_manuals_published_order ON manuals (is_published, order_index);

-- 検索用の関数を作成（全文検索なしバージョン）
CREATE OR REPLACE FUNCTION search_manuals_simple(search_query text)
RETURNS SETOF manuals AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM manuals
  WHERE is_published = true
  AND (
    -- タイトルの部分一致（大文字小文字を区別しない）
    lower(title) LIKE '%' || lower(search_query) || '%'
    -- メインカテゴリーの部分一致
    OR lower(main_category) LIKE '%' || lower(search_query) || '%'
    -- サブカテゴリーの部分一致
    OR lower(sub_category) LIKE '%' || lower(search_query) || '%'
    -- タグの部分一致
    OR EXISTS (
      SELECT 1 FROM unnest(tags) AS tag
      WHERE lower(tag) LIKE '%' || lower(search_query) || '%'
    )
  )
  ORDER BY
    -- 完全一致を優先
    CASE WHEN lower(title) = lower(search_query) THEN 0 ELSE 1 END,
    -- タイトルの部分一致を次に優先
    CASE WHEN lower(title) LIKE '%' || lower(search_query) || '%' THEN 0 ELSE 1 END,
    -- その他の順序
    order_index ASC;
END;
$$ LANGUAGE plpgsql;