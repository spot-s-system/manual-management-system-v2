-- 既存のポリシーを確認してから追加
-- カテゴリテーブルのポリシー（既に存在する場合はスキップ）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categories' 
    AND policyname = 'Allow category inserts'
  ) THEN
    CREATE POLICY "Allow category inserts" 
      ON categories FOR INSERT 
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categories' 
    AND policyname = 'Allow category updates'
  ) THEN
    CREATE POLICY "Allow category updates" 
      ON categories FOR UPDATE 
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categories' 
    AND policyname = 'Allow category deletes'
  ) THEN
    CREATE POLICY "Allow category deletes" 
      ON categories FOR DELETE 
      USING (true);
  END IF;
END $$;

-- マニュアルテーブルのポリシー
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'manuals' 
    AND policyname = 'Allow manual inserts'
  ) THEN
    CREATE POLICY "Allow manual inserts" 
      ON manuals FOR INSERT 
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'manuals' 
    AND policyname = 'Allow manual updates'
  ) THEN
    CREATE POLICY "Allow manual updates" 
      ON manuals FOR UPDATE 
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'manuals' 
    AND policyname = 'Allow manual deletes'
  ) THEN
    CREATE POLICY "Allow manual deletes" 
      ON manuals FOR DELETE 
      USING (true);
  END IF;
END $$;