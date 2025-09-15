-- マニュアルリクエストテーブル
CREATE TABLE manual_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  department TEXT,
  manual_title TEXT NOT NULL,
  manual_description TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high')),
  use_case TEXT,
  expected_users TEXT,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  manual_id UUID REFERENCES manuals(id) ON DELETE SET NULL
);

-- インデックス
CREATE INDEX idx_manual_requests_status ON manual_requests(status);
CREATE INDEX idx_manual_requests_created_at ON manual_requests(created_at DESC);
CREATE INDEX idx_manual_requests_urgency ON manual_requests(urgency);

-- RLS を有効化
ALTER TABLE manual_requests ENABLE ROW LEVEL SECURITY;

-- 誰でもリクエストを作成できる
CREATE POLICY "Anyone can create manual requests" 
  ON manual_requests FOR INSERT 
  WITH CHECK (true);

-- 管理者のみが閲覧・更新・削除可能（開発環境では全て許可）
CREATE POLICY "Allow request reads" 
  ON manual_requests FOR SELECT 
  USING (true);

CREATE POLICY "Allow request updates" 
  ON manual_requests FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow request deletes" 
  ON manual_requests FOR DELETE 
  USING (true);

-- 更新時刻の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_manual_requests_updated_at
  BEFORE UPDATE ON manual_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();