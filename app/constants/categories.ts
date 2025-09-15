export const CATEGORIES = {
  onboarding_registration: {
    name: "入社（入社日までに登録）",
    label: "入社（入社日までに登録）",
    slug: "onboarding-registration",
    subcategories: [
      "本人に情報を登録してもらう場合",
      "給与情報の設定",
      "通勤手当の設定",
      "税金関係",
      "保険関係",
      "マイナンバー",
    ],
  },
  onboarding_after: {
    name: "入社（入社日以降に登録）",
    label: "入社（入社日以降に登録）",
    slug: "onboarding-after",
    subcategories: [
      "住民税を特別徴収に切り替えましょう",
      "住民税の通知書の内容をfreeeに登録しましょう",
      "社会保険の情報を反映する方法　※手続き完了したら設定しましょう！",
      "雇用保険の情報を反映する方法",
    ],
  },
  director_registration: {
    name: "役員の登録方法",
    label: "役員の登録方法",
    slug: "director-registration",
    subcategories: [
      "役員報酬の決定",
      "管理者が情報を登録する場合",
      "税金関係",
      "住民税を特別徴収している場合",
      "社会保険",
      "労働保険(雇用保険)",
    ],
  },
  bonus: {
    name: "賞与",
    label: "賞与",
    slug: "bonus",
    subcategories: ["賞与"],
  },
  leave: {
    name: "有休・休暇",
    label: "有休・休暇",
    slug: "leave",
    subcategories: ["正社員の有給休暇", "パートの有給休暇", "特別休暇"],
  },
  resignation: {
    name: "退職",
    label: "退職",
    slug: "resignation",
    subcategories: ["退職日前に対応するべきこと", "退職日以降の対応するべきこと"],
  },
  attendance_correction: {
    name: "勤怠の修正方法",
    label: "勤怠の修正方法",
    slug: "attendance-correction",
    subcategories: [
      "勤怠の修正、休憩の削除方法",
      "欠勤の登録方法",
      "遅刻・早退した時の設定方法",
      "1日の所定労働時間を変更したい場合",
      "誤って登録した勤怠を修正したい場合",
      "休日の設定方法",
      "振替休日",
      "代休",
      "休日を全員一括で付与する方法",
    ],
  },
  shift_system: {
    name: "1日8時間以内のシフト制",
    label: "1日8時間以内のシフト制",
    slug: "shift-system",
    subcategories: ["シフトパターンの登録", "シフトの登録方法"],
  },
  monthly_variable_working: {
    name: "1か月変形労働時間制",
    label: "1か月変形労働時間制",
    slug: "monthly-variable-working",
    subcategories: [
      "シフトパターンの登録",
      "1か月変形のシフトの登録方法",
      "1か月変形の場合の欠勤控除に関して",
    ],
  },
  attendance: {
    name: "勤怠",
    label: "勤怠",
    slug: "attendance",
    subcategories: ["休日", "その他"],
  },
  salary_deduction: {
    name: "給与控除の設定",
    label: "給与控除の設定",
    slug: "salary-deduction",
    subcategories: ["控除額の設定方法"],
  },
  documents: {
    name: "書類",
    label: "書類",
    slug: "documents",
    subcategories: ["書類のダウンロード"],
  },
  other: {
    name: "その他",
    label: "その他",
    slug: "other",
    subcategories: ["freeeに招待する方法"],
  },
  flex: {
    name: "フレックス",
    label: "フレックス",
    slug: "flex",
    subcategories: [],
  },
  employee_attendance: {
    name: "（従業員用）勤怠",
    label: "（従業員用）勤怠",
    slug: "employee-attendance",
    subcategories: [
      "勤怠の方法",
      "欠勤の登録方法",
      "振り替え休日の設定方法",
      "出勤した時にのみ通勤手当をもらう方法",
      "有給の設定方法",
      "休暇の設定方法",
    ],
  },
} as const;

export type MainCategory = keyof typeof CATEGORIES;
export type SubCategory<T extends MainCategory> = (typeof CATEGORIES)[T]["subcategories"][number];

export function getMainCategories(): MainCategory[] {
  return Object.keys(CATEGORIES) as MainCategory[];
}

export function getSubCategories(mainCategory: MainCategory): string[] {
  return [...CATEGORIES[mainCategory].subcategories];
}

export function getAllCategoryPairs(): Array<{
  mainCategory: string;
  subCategory: string | null;
}> {
  const pairs: Array<{ mainCategory: string; subCategory: string | null }> = [];

  for (const config of Object.values(CATEGORIES)) {
    for (const subCategory of config.subcategories) {
      pairs.push({ mainCategory: config.name, subCategory });
    }
  }

  return pairs;
}

// スラッグからカテゴリー情報を取得
export function getCategoryBySlug(slug: string): (typeof CATEGORIES)[MainCategory] | null {
  for (const category of Object.values(CATEGORIES)) {
    if (category.slug === slug) {
      return category;
    }
  }
  return null;
}

// カテゴリー名からカテゴリー情報を取得
export function getCategoryByName(name: string): (typeof CATEGORIES)[MainCategory] | null {
  for (const category of Object.values(CATEGORIES)) {
    if (category.name === name) {
      return category;
    }
  }
  return null;
}
