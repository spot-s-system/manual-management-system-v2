"use client";

import { CATEGORIES, getCategoryBySlug, getSubCategories } from "@/app/constants/categories";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { ErrorMessage } from "@/components/ui/error-message";
import { ManualModal } from "@/components/ui/manual-modal";
import { VerticalStepper } from "@/components/ui/vertical-stepper";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import {
  ChevronRight,
  CreditCard,
  Filter,
  LayoutGrid,
  Package,
  Shield,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Manual = Database["public"]["Tables"]["manuals"]["Row"];

// STEP mapping for specific categories
const STEP_MAPPING: Record<string, Record<string, { number: number; name: string }>> = {
  "入社（入社日までに登録）": {
    本人に情報を登録してもらう場合: { number: 1, name: "本人に本人情報を登録してもらう場合" },
    管理者が情報を登録する場合: { number: 1, name: "本人に本人情報を登録してもらう場合" },
    給与情報の設定: { number: 2, name: "給与情報の設定" },
    通勤手当の設定: { number: 3, name: "通勤手当の設定" },
    税金関係: { number: 4, name: "税金関係" },
    保険関係: { number: 5, name: "保険関係" },
    マイナンバー: { number: 6, name: "マイナンバー" },
  },
  "入社（入社日以降に登録）": {
    住民税を特別徴収に切り替えましょう: {
      number: 1,
      name: "住民税を特別徴収に切り替えましょう",
    },
    "（STEP2）住民税の通知書の内容をfreeeに登録しましょう": {
      number: 2,
      name: "住民税の通知書の内容をfreeeに登録しましょう",
    },
    "社会保険の情報を反映する方法　※手続き完了したら設定しましょう！": {
      number: 3,
      name: "社会保険の情報を反映する方法　※手続き完了したら設定しましょう！",
    },
    "雇用保険の情報を反映する方法　※手続き完了したら設定しましょう！": {
      number: 4,
      name: "雇用保険の情報を反映する方法　※手続き完了したら設定しましょう！",
    },
  },
};

// Function to determine STEP info based on main_category and sub_category
function getStepInfo(mainCategory: string, subCategory: string | null) {
  if (!mainCategory || !subCategory) return { step_number: null, step_name: null };

  const categoryMapping = STEP_MAPPING[mainCategory.trim()];
  if (!categoryMapping) return { step_number: null, step_name: null };

  // Try to find exact match first
  const exactMatch = categoryMapping[subCategory.trim()];
  if (exactMatch) {
    return { step_number: exactMatch.number, step_name: exactMatch.name };
  }

  // If no exact match, try to find a partial match
  for (const [key, value] of Object.entries(categoryMapping)) {
    if (subCategory.includes(key) || key.includes(subCategory)) {
      return { step_number: value.number, step_name: value.name };
    }
  }

  return { step_number: null, step_name: null };
}

export default function CategoryPage() {
  const params = useParams();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetFilter, setTargetFilter] = useState<string | null>(null);
  const [planFilter, setPlanFilter] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const slug = params.slug as string;
  const decodedSlug = decodeURIComponent(slug);

  // カテゴリー情報を確認
  const category = getCategoryBySlug(decodedSlug);
  if (!category) {
    notFound();
  }

  useEffect(() => {
    const fetchManuals = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("manuals")
          .select("*")
          .eq("main_category", category.name)
          .eq("is_published", true)
          .order("order_index", { ascending: true });

        if (error) {
          setError(error.message);
        } else {
          setManuals(data || []);
        }
      } catch (err) {
        setError("予期しないエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchManuals();
  }, [category]);

  // ハッシュへの自動スクロール
  useEffect(() => {
    const scrollToHash = () => {
      if (window.location.hash) {
        const elementId = window.location.hash.substring(1);
        const element = document.getElementById(elementId);
        if (element) {
          // ヘッダーの高さを考慮してスクロール位置を調整
          const yOffset = -100; // ヘッダーの高さ分オフセット
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }
    };

    // ページ読み込み完了後にスクロール
    if (!loading) {
      // 少し遅延を入れて確実に要素が描画されてからスクロール
      const timer = setTimeout(scrollToHash, 300);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // ブラウザの戻る/進むボタンでもスクロール
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash) {
        const elementId = window.location.hash.substring(1);
        const element = document.getElementById(elementId);
        if (element) {
          const yOffset = -100;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const openModal = (manual: Manual) => {
    setSelectedManual(manual);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedManual(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100">
        <aside className="w-full bg-white p-4 border-b border-slate-200">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
              <LayoutGrid className="w-4 h-4 mr-2" /> カテゴリ一覧に戻る
            </Button>
          </Link>
        </aside>
        <main className="container mx-auto p-5 md:p-10">
          <ErrorMessage title="マニュアルの取得に失敗しました" message={error} />
        </main>
      </div>
    );
  }

  // サブカテゴリ一覧を取得
  const categoryKey = Object.keys(CATEGORIES).find(
    (key) => CATEGORIES[key as keyof typeof CATEGORIES] === category
  ) as keyof typeof CATEGORIES | undefined;
  const subCategories = categoryKey ? getSubCategories(categoryKey) : [];

  // フィルタリングされたマニュアル
  const filteredManuals = manuals.filter((manual) => {
    if (targetFilter && !manual.tags?.includes(targetFilter)) {
      return false;
    }
    if (planFilter && !manual.tags?.includes(planFilter)) {
      return false;
    }
    return true;
  });

  // Check if this category has STEP mapping
  const hasStepMapping = !!STEP_MAPPING[category.name];

  // Group manuals by STEP or subcategory
  const groupedManuals: Record<string, { manuals: Manual[]; order: number }> = {};

  if (hasStepMapping) {
    // Group by STEP for categories with STEP mapping
    for (const manual of filteredManuals) {
      const stepInfo = getStepInfo(manual.main_category, manual.sub_category);
      const groupKey = stepInfo.step_number
        ? `STEP${stepInfo.step_number} ${stepInfo.step_name}`
        : "その他";

      if (!groupedManuals[groupKey]) {
        groupedManuals[groupKey] = { manuals: [], order: stepInfo.step_number || 999 };
      }
      groupedManuals[groupKey].manuals.push(manual);
    }
  } else {
    // Group by subcategory for other categories
    for (const manual of filteredManuals) {
      const subCat = manual.sub_category || "その他";
      if (!groupedManuals[subCat]) {
        const order = subCategories.indexOf(subCat);
        groupedManuals[subCat] = { manuals: [], order: order !== -1 ? order : 999 };
      }
      groupedManuals[subCat].manuals.push(manual);
    }
  }

  // Sort groups by order
  const sortedGroups = Object.entries(groupedManuals).sort(([, a], [, b]) => a.order - b.order);

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="w-full bg-white p-4 border-b border-slate-200">
        <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:bg-blue-50 -ml-2 sm:ml-0"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">カテゴリ一覧に戻る</span>
              <span className="sm:hidden">戻る</span>
            </Button>
          </Link>

          <nav className="flex items-center space-x-1 text-xs sm:text-sm text-slate-600">
            <Link href="/" className="hover:text-blue-600">
              ホーム
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-slate-900 font-medium truncate">{category.label}</span>
          </nav>
        </div>
      </aside>

      <main className="container mx-auto p-5 md:p-10">
        {/* モバイル用フィルターボタン */}
        <div className="lg:hidden mb-4">
          <Button
            onClick={() => setIsFilterOpen(true)}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            フィルターを表示
            {(targetFilter || planFilter) && (
              <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {(targetFilter ? 1 : 0) + (planFilter ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <CategoryIcon
              iconName={
                categoryKey === "onboarding_registration"
                  ? "UserPlus"
                  : categoryKey === "onboarding_after"
                    ? "ClipboardList"
                    : categoryKey === "bonus"
                      ? "Gift"
                      : categoryKey === "leave"
                        ? "Calendar"
                        : categoryKey === "resignation"
                          ? "UserMinus"
                          : categoryKey === "attendance"
                            ? "Clock"
                            : categoryKey === "other"
                              ? "MoreHorizontal"
                              : "FileText"
              }
              className="w-10 h-10 text-blue-600"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
              {category.label}
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg">
            {`${category.label}に関する操作ガイドをご覧いただけます。`}
          </p>

          {/* STEP or サブカテゴリナビゲーション */}
          {sortedGroups.length > 0 && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
              <h2 className="text-sm sm:text-sm font-semibold text-slate-700 mb-3">
                {hasStepMapping ? "設定の流れ" : "カテゴリ内の項目"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {sortedGroups.map(([groupName, { manuals: groupManuals }]) => (
                  <button
                    key={groupName}
                    type="button"
                    onClick={() => {
                      // Use the same ID format for both STEP and regular groups
                      const element = document.getElementById(
                        `group-${groupName.replace(/\s+/g, "-")}`
                      );
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-full hover:bg-blue-100 transition-colors ${
                      hasStepMapping && groupName.startsWith("STEP")
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    {groupName} ({groupManuals.length})
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* メインコンテンツ */}
          <div className="flex-1">
            {filteredManuals.length > 0 ? (
              hasStepMapping ? (
                // Vertical Stepper for STEP-based categories
                <div>
                  <VerticalStepper
                    steps={sortedGroups
                      .filter(([groupName]) => groupName.startsWith("STEP"))
                      .map(([groupName, { manuals: groupManuals }], index) => ({
                        id: `group-${groupName.replace(/\s+/g, "-")}`,
                        title: groupName,
                        content: (
                          <div className="space-y-3">
                            {groupManuals.map((manual) => (
                              <Card
                                key={manual.id}
                                className="cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
                                onClick={() => openModal(manual)}
                              >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-4">
                                  <div className="relative w-full sm:w-24 h-32 sm:h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                    <Image
                                      src="/preview.png"
                                      alt={manual.title}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 640px) 100vw, 96px"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 w-full">
                                    <h3 className="text-sm sm:text-base font-medium text-slate-800 truncate">
                                      {manual.title}
                                    </h3>
                                    <div className="space-y-1 mt-2">
                                      {(() => {
                                        const targetTags =
                                          manual.tags?.filter(
                                            (tag) => tag === "管理者向け" || tag === "従業員向け"
                                          ) || [];
                                        const planTags =
                                          manual.tags?.filter(
                                            (tag) =>
                                              tag === "ミニマム" ||
                                              tag === "スターター" ||
                                              tag === "スタンダード" ||
                                              tag === "プロフェッショナル" ||
                                              tag === "アドバンス"
                                          ) || [];

                                        return (
                                          <>
                                            {targetTags.length > 0 && (
                                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs">
                                                <span className="text-slate-600 shrink-0">
                                                  対象者：
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                  {targetTags.map((target) => (
                                                    <span
                                                      key={target}
                                                      className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                                                    >
                                                      {target}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                            {planTags.length > 0 && (
                                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs">
                                                <span className="text-slate-600 shrink-0">
                                                  freee契約プラン：
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                  {planTags.map((plan) => (
                                                    <span
                                                      key={plan}
                                                      className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                                                    >
                                                      {plan}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ),
                      }))}
                    className="mt-8"
                  />

                  {/* Handle non-STEP groups (その他) */}
                  {sortedGroups
                    .filter(([groupName]) => !groupName.startsWith("STEP"))
                    .map(([groupName, { manuals: groupManuals }]) => (
                      <section key={groupName} className="mt-8">
                        <h2 className="text-lg sm:text-xl font-bold mb-4 text-slate-800">
                          {groupName}
                        </h2>
                        <div className="space-y-3">
                          {groupManuals.map((manual) => (
                            <Card
                              key={manual.id}
                              className="cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
                              onClick={() => openModal(manual)}
                            >
                              <div className="flex flex-col sm:flex-row items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-4">
                                <div className="relative w-full sm:w-24 h-32 sm:h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                  <Image
                                    src="/preview.png"
                                    alt={manual.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, 96px"
                                  />
                                </div>
                                <div className="flex-1 min-w-0 w-full">
                                  <h3 className="text-sm sm:text-base font-medium text-slate-800 truncate">
                                    {manual.title}
                                  </h3>
                                  <div className="space-y-1 mt-2">
                                    {(() => {
                                      const targetTags =
                                        manual.tags?.filter(
                                          (tag) => tag === "管理者向け" || tag === "従業員向け"
                                        ) || [];
                                      const planTags =
                                        manual.tags?.filter(
                                          (tag) =>
                                            tag === "ミニマム" ||
                                            tag === "スターター" ||
                                            tag === "スタンダード" ||
                                            tag === "プロフェッショナル" ||
                                            tag === "アドバンス"
                                        ) || [];

                                      return (
                                        <>
                                          {targetTags.length > 0 && (
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs">
                                              <span className="text-slate-600 shrink-0">
                                                対象者：
                                              </span>
                                              <div className="flex flex-wrap gap-1">
                                                {targetTags.map((target) => (
                                                  <span
                                                    key={target}
                                                    className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                                                  >
                                                    {target}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {planTags.length > 0 && (
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs">
                                              <span className="text-slate-600 shrink-0">
                                                freee契約プラン：
                                              </span>
                                              <div className="flex flex-wrap gap-1">
                                                {planTags.map((plan) => (
                                                  <span
                                                    key={plan}
                                                    className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                                                  >
                                                    {plan}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </section>
                    ))}
                </div>
              ) : (
                // Original layout for non-STEP categories
                <div className="space-y-8">
                  {sortedGroups.map(([groupName, { manuals: groupManuals }]) => (
                    <section key={groupName} id={`group-${groupName.replace(/\s+/g, "-")}`}>
                      <h2
                        className={`text-lg sm:text-xl font-bold mb-4 scroll-mt-24 ${
                          hasStepMapping && groupName.startsWith("STEP")
                            ? "text-blue-800 bg-blue-50 p-3 rounded-lg"
                            : "text-slate-800"
                        }`}
                      >
                        {groupName}
                      </h2>
                      <div className="space-y-3">
                        {groupManuals.map((manual) => (
                          <Card
                            key={manual.id}
                            className="cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
                            onClick={() => openModal(manual)}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-4">
                              <div className="relative w-full sm:w-24 h-32 sm:h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                <Image
                                  src="/preview.png"
                                  alt={manual.title}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 100vw, 96px"
                                />
                              </div>
                              <div className="flex-1 min-w-0 w-full">
                                <h3 className="text-sm sm:text-base font-medium text-slate-800 truncate">
                                  {manual.title}
                                </h3>
                                <div className="space-y-1 mt-2">
                                  {(() => {
                                    const targetTags =
                                      manual.tags?.filter(
                                        (tag) => tag === "管理者向け" || tag === "従業員向け"
                                      ) || [];
                                    const planTags =
                                      manual.tags?.filter(
                                        (tag) =>
                                          tag === "ミニマム" ||
                                          tag === "スターター" ||
                                          tag === "スタンダード" ||
                                          tag === "プロフェッショナル" ||
                                          tag === "アドバンス"
                                      ) || [];

                                    return (
                                      <>
                                        {targetTags.length > 0 && (
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs">
                                            <span className="text-slate-600 shrink-0">
                                              対象者：
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                              {targetTags.map((target) => (
                                                <span
                                                  key={target}
                                                  className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                                                >
                                                  {target}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {planTags.length > 0 && (
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs">
                                            <span className="text-slate-600 shrink-0">
                                              freee契約プラン：
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                              {planTags.map((plan) => (
                                                <span
                                                  key={plan}
                                                  className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                                                >
                                                  {plan}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow">
                <p className="text-slate-500 text-lg">
                  {targetFilter || planFilter
                    ? "条件に一致するマニュアルがありません。"
                    : "このカテゴリにはまだマニュアルがありません。"}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {targetFilter || planFilter
                    ? "フィルタを解除するか、他の条件でお試しください。"
                    : "新しいマニュアルが追加されるのをお待ちください。"}
                </p>
              </div>
            )}
          </div>

          {/* サイドバー - デスクトップ */}
          <aside className="hidden lg:block lg:w-80 space-y-4">
            {/* 対象者フィルタ - 中カテゴリの見出し分だけ下げる */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:mt-[45px]">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-slate-800">対象者で絞り込む</h2>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setTargetFilter(targetFilter === "管理者向け" ? null : "管理者向け")
                  }
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    targetFilter === "管理者向け"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-gray-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">管理者向け</span>
                  </div>
                  {targetFilter === "管理者向け" && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      適用中
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTargetFilter(targetFilter === "従業員向け" ? null : "従業員向け")
                  }
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    targetFilter === "従業員向け"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-gray-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">従業員向け</span>
                  </div>
                  {targetFilter === "従業員向け" && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      適用中
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 契約プランフィルタ */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-slate-800">
                freee契約プランで絞り込む
              </h2>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPlanFilter(planFilter === "ミニマム" ? null : "ミニマム")}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    planFilter === "ミニマム"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-gray-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span className="text-sm">ミニマム</span>
                  </div>
                  {planFilter === "ミニマム" && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      適用中
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPlanFilter(planFilter === "スターター" ? null : "スターター")}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    planFilter === "スターター"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-gray-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">スターター</span>
                  </div>
                  {planFilter === "スターター" && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      適用中
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPlanFilter(planFilter === "スタンダード" ? null : "スタンダード")
                  }
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    planFilter === "スタンダード"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-gray-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">スタンダード</span>
                  </div>
                  {planFilter === "スタンダード" && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      適用中
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPlanFilter(planFilter === "プロフェッショナル" ? null : "プロフェッショナル")
                  }
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    planFilter === "プロフェッショナル"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-gray-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">プロフェッショナル</span>
                  </div>
                  {planFilter === "プロフェッショナル" && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      適用中
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPlanFilter(planFilter === "アドバンス" ? null : "アドバンス")}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    planFilter === "アドバンス"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-gray-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">アドバンス</span>
                  </div>
                  {planFilter === "アドバンス" && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      適用中
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* カテゴリー一覧 */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-slate-800">
                カテゴリーから探す
              </h2>
              <div className="space-y-2">
                {Object.entries(CATEGORIES).map(([key, cat]) => {
                  const iconName =
                    key === "onboarding_before"
                      ? "UserPlus"
                      : key === "onboarding_process"
                        ? "ClipboardList"
                        : key === "bonus"
                          ? "Gift"
                          : key === "leave"
                            ? "Calendar"
                            : key === "resignation"
                              ? "UserMinus"
                              : key === "attendance"
                                ? "Clock"
                                : key === "other"
                                  ? "MoreHorizontal"
                                  : "FileText";

                  const isActive = cat.slug === decodedSlug;

                  return (
                    <Link
                      key={key}
                      href={`/category/${cat.slug}`}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "hover:bg-gray-50 text-slate-700"
                      }`}
                    >
                      <CategoryIcon
                        iconName={iconName}
                        className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`}
                      />
                      <span className="text-sm">{cat.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* マニュアルモーダル */}
      {selectedManual && (
        <ManualModal isOpen={isModalOpen} onClose={closeModal} manual={selectedManual} />
      )}

      {/* モバイル用フィルターモーダル */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFilterOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter") {
                setIsFilterOpen(false);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="フィルターを閉じる"
          />

          {/* フィルターパネル */}
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">フィルター</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsFilterOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 space-y-6">
              {/* 対象者フィルタ */}
              <div>
                <h3 className="text-base font-bold mb-3 text-slate-800">対象者で絞り込む</h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetFilter(targetFilter === "管理者向け" ? null : "管理者向け");
                      setTimeout(() => setIsFilterOpen(false), 300);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      targetFilter === "管理者向け"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">管理者向け</span>
                    </div>
                    {targetFilter === "管理者向け" && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                        適用中
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetFilter(targetFilter === "従業員向け" ? null : "従業員向け");
                      setTimeout(() => setIsFilterOpen(false), 300);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      targetFilter === "従業員向け"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">従業員向け</span>
                    </div>
                    {targetFilter === "従業員向け" && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                        適用中
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* 契約プランフィルタ */}
              <div>
                <h3 className="text-base font-bold mb-3 text-slate-800">
                  freee契約プランで絞り込む
                </h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPlanFilter(planFilter === "ミニマム" ? null : "ミニマム");
                      setTimeout(() => setIsFilterOpen(false), 300);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      planFilter === "ミニマム"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span className="text-sm">ミニマム</span>
                    </div>
                    {planFilter === "ミニマム" && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                        適用中
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlanFilter(planFilter === "スターター" ? null : "スターター");
                      setTimeout(() => setIsFilterOpen(false), 300);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      planFilter === "スターター"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">スターター</span>
                    </div>
                    {planFilter === "スターター" && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                        適用中
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlanFilter(planFilter === "スタンダード" ? null : "スタンダード");
                      setTimeout(() => setIsFilterOpen(false), 300);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      planFilter === "スタンダード"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">スタンダード</span>
                    </div>
                    {planFilter === "スタンダード" && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                        適用中
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlanFilter(
                        planFilter === "プロフェッショナル" ? null : "プロフェッショナル"
                      );
                      setTimeout(() => setIsFilterOpen(false), 300);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      planFilter === "プロフェッショナル"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">プロフェッショナル</span>
                    </div>
                    {planFilter === "プロフェッショナル" && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                        適用中
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlanFilter(planFilter === "アドバンス" ? null : "アドバンス");
                      setTimeout(() => setIsFilterOpen(false), 300);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      planFilter === "アドバンス"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">アドバンス</span>
                    </div>
                    {planFilter === "アドバンス" && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                        適用中
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* フィルターをクリア */}
              {(targetFilter || planFilter) && (
                <div className="pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setTargetFilter(null);
                      setPlanFilter(null);
                      setIsFilterOpen(false);
                    }}
                  >
                    すべてのフィルターをクリア
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
