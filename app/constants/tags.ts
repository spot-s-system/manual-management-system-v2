export const SUGGESTED_TAGS = [
  "管理者向け",
  "従業員向け",
  "ミニマム",
  "スターター",
  "スタンダード",
  "プロフェッショナル",
  "アドバンス",
] as const;

export type SuggestedTag = (typeof SUGGESTED_TAGS)[number];
