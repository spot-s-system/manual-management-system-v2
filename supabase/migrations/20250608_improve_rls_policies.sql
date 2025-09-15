-- RLSポリシーを改善して、認証されたユーザーのみ書き込み可能にする

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Enable read access for all users" ON manuals;
DROP POLICY IF EXISTS "Allow manual inserts" ON manuals;
DROP POLICY IF EXISTS "Allow manual updates" ON manuals;
DROP POLICY IF EXISTS "Allow manual deletes" ON manuals;

-- manualsテーブルの新しいポリシー
-- 公開されたマニュアルは誰でも読める
CREATE POLICY "Public can read published manuals" 
  ON manuals FOR SELECT 
  USING (is_published = true);

-- 認証されたユーザーは全てのマニュアルを読める（管理画面用）
CREATE POLICY "Authenticated can read all manuals" 
  ON manuals FOR SELECT 
  USING (auth.role() = 'authenticated');

-- 認証されたユーザーのみ作成可能
CREATE POLICY "Authenticated can insert manuals" 
  ON manuals FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- 認証されたユーザーのみ更新可能
CREATE POLICY "Authenticated can update manuals" 
  ON manuals FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 認証されたユーザーのみ削除可能
CREATE POLICY "Authenticated can delete manuals" 
  ON manuals FOR DELETE 
  USING (auth.role() = 'authenticated');