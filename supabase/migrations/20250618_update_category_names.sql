-- 既存の勤怠カテゴリのデータを新しいカテゴリ名に更新するマイグレーション

-- 1. 「勤怠」カテゴリを持つマニュアルを確認して分類
-- シフト制関連のサブカテゴリを持つものは「1日8時間以内のシフト制」へ
UPDATE manuals
SET main_category = '1日8時間以内のシフト制'
WHERE main_category = '勤怠' 
  AND sub_category = 'シフト制';

-- 1か月変形労働時間制関連のサブカテゴリを持つものは「1か月変形労働時間制」へ
UPDATE manuals
SET main_category = '1か月変形労働時間制'
WHERE main_category = '勤怠' 
  AND sub_category = '1か月変形労働時間制';

-- その他の勤怠関連は「勤怠の修正方法」へ（デフォルト）
-- 注：実際のデータに応じて、より適切な分類が必要な場合があります
UPDATE manuals
SET main_category = '勤怠の修正方法'
WHERE main_category = '勤怠' 
  AND sub_category NOT IN ('シフト制', '1か月変形労働時間制', '休日');

-- 休日関連は「勤怠」カテゴリのまま残す
-- (新しい「勤怠」カテゴリには「休日」と「その他」のサブカテゴリがある)