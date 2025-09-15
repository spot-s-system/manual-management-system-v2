-- カテゴリーの初期データを挿入
INSERT INTO categories (name, slug, description, order_index) VALUES
  ('従業員情報', 'employee-info', '従業員の登録、変更、管理に関するマニュアル', 1),
  ('退職', 'retirement', '退職手続きや退職後の処理に関するマニュアル', 2),
  ('住民税', 'resident-tax', '住民税の計算や手続きに関するマニュアル', 3),
  ('勤怠', 'attendance', '勤怠管理、打刻、休暇申請に関するマニュアル', 4),
  ('給与明細', 'salary', '給与計算や明細書に関するマニュアル', 5),
  ('賞与明細', 'bonus', '賞与計算や明細書に関するマニュアル', 6),
  ('有休', 'paid-leave', '有給休暇の管理や申請に関するマニュアル', 7),
  ('その他', 'others', 'その他の業務に関するマニュアル', 8)
ON CONFLICT (slug) DO NOTHING;