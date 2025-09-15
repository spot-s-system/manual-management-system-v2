-- Add reference_links column to manuals table
ALTER TABLE manuals 
ADD COLUMN reference_links JSONB DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN manuals.reference_links IS 'Array of reference links in format [{title: string, url: string}]';

-- Example of how to insert/update reference links:
-- UPDATE manuals 
-- SET reference_links = '[
--   {"title": "メールアドレスで従業員を招待する", "url": "https://support.freee.co.jp/hc/ja/articles/203072074"},
--   {"title": "従業員の基本情報を設定する", "url": "https://support.freee.co.jp/hc/ja/articles/203072075"}
-- ]'::jsonb
-- WHERE id = 'some-manual-id';