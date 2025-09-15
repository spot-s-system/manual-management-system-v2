"use client";

import { CATEGORIES, getCategoryBySlug, getSubCategories } from "@/app/constants/categories";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { ErrorMessage } from "@/components/ui/error-message";
import { ManualModal } from "@/components/ui/manual-modal";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { ChevronRight, CreditCard, LayoutGrid, Package, Shield, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Manual = Database["public"]["Tables"]["manuals"]["Row"];

export default function CategoryPage() {
  const params = useParams();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetFilter, setTargetFilter] = useState<string | null>(null);
  const [planFilter, setPlanFilter] = useState<string | null>(null);

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

  // マニュアルをサブカテゴリ別にグループ化
  const manualsBySubCategory = filteredManuals.reduce(
    (acc, manual) => {
      const subCat = manual.sub_category || "その他";
      if (!acc[subCat]) {
        acc[subCat] = [];
      }
      acc[subCat].push(manual);
      return acc;
    },
    {} as Record<string, Manual[]>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="w-full bg-white p-4 border-b border-slate-200">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
              <LayoutGrid className="w-4 h-4 mr-2" /> カテゴリ一覧に戻る
            </Button>
          </Link>

          <nav className="flex items-center space-x-1 text-sm text-slate-600">
            <Link href="/" className="hover:text-blue-600">
              ホーム
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">{category.label}</span>
          </nav>
        </div>
      </aside>

      <main className="container mx-auto p-5 md:p-10">
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">{category.label}</h1>
          </div>
          <p className="text-slate-600 text-base md:text-lg">
            {`${category.label}に関する操作ガイドをご覧いただけます。`}
          </p>

          {/* サブカテゴリナビゲーション */}
          {subCategories.length > 0 && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">カテゴリ内の項目</h2>
              <div className="flex flex-wrap gap-2">
                {subCategories.map((subCat) => {
                  const subCatManuals = manualsBySubCategory[subCat] || [];
                  if (subCatManuals.length === 0) return null;

                  return (
                    <button
                      key={subCat}
                      type="button"
                      onClick={() => {
                        const element = document.getElementById(
                          `subcategory-${subCat.replace(/\s+/g, "-")}`
                        );
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {subCat} ({subCatManuals.length})
                    </button>
                  );
                })}
                {manualsBySubCategory.その他 && manualsBySubCategory.その他.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const element = document.getElementById("subcategory-その他");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    その他 ({manualsBySubCategory.その他.length})
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* メインコンテンツ */}
          <div className="flex-1">
            {filteredManuals.length > 0 ? (
              <>
                {/* サブカテゴリがある場合は、サブカテゴリ別に表示 */}
                {subCategories.length > 0 ? (
                  <div className="space-y-8">
                    {subCategories.map((subCat) => {
                      const subCatManuals = manualsBySubCategory[subCat] || [];
                      if (subCatManuals.length === 0) return null;

                      return (
                        <section key={subCat} id={`subcategory-${subCat.replace(/\s+/g, "-")}`}>
                          <h2 className="text-xl font-bold mb-4 text-slate-800 scroll-mt-24">
                            {subCat}
                          </h2>
                          <div className="space-y-3">
                            {subCatManuals.map((manual) => (
                              <Card
                                key={manual.id}
                                className="cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
                                onClick={() => openModal(manual)}
                              >
                                <div className="flex items-center p-4 gap-4">
                                  <div className="relative w-24 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                    <Image
                                      src="/preview.png"
                                      alt={manual.title}
                                      fill
                                      className="object-cover"
                                      sizes="96px"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-slate-800 truncate">
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
                                              <div className="flex items-center text-xs">
                                                <span className="text-slate-600 w-32">
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
                                              <div className="flex items-center text-xs">
                                                <span className="text-slate-600 w-32">
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
                      );
                    })}

                    {/* その他カテゴリ（サブカテゴリなし）のマニュアル */}
                    {manualsBySubCategory.その他 && manualsBySubCategory.その他.length > 0 && (
                      <section id="subcategory-その他">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 scroll-mt-24">
                          その他
                        </h2>
                        <div className="space-y-3">
                          {manualsBySubCategory.その他.map((manual) => (
                            <Card
                              key={manual.id}
                              className="cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
                              onClick={() => openModal(manual)}
                            >
                              <div className="flex items-center p-4 gap-4">
                                <div className="relative w-24 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                  <Image
                                    src="/preview.png"
                                    alt={manual.title}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-slate-800 truncate">
                                    {manual.title}
                                  </h3>
                                  <div className="space-y-1 mt-2">
                                    {(() => {
                                      const targetTag = manual.tags?.find(
                                        (tag) => tag === "管理者向け" || tag === "従業員向け"
                                      );
                                      const planTag = manual.tags?.find(
                                        (tag) =>
                                          tag === "ミニマム" ||
                                          tag === "スターター" ||
                                          tag === "スタンダード" ||
                                          tag === "プロフェッショナル" ||
                                          tag === "アドバンス"
                                      );

                                      return (
                                        <>
                                          {targetTag && (
                                            <div className="flex items-center text-xs">
                                              <span className="text-slate-600 w-32">対象者：</span>
                                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                {targetTag}
                                              </span>
                                            </div>
                                          )}
                                          {planTag && (
                                            <div className="flex items-center text-xs">
                                              <span className="text-slate-600 w-32">
                                                freee契約プラン：
                                              </span>
                                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                                {planTag}
                                              </span>
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
                    )}
                  </div>
                ) : (
                  /* サブカテゴリがない場合は、すべてのマニュアルを一覧表示 */
                  <div className="space-y-3">
                    {filteredManuals.map((manual) => (
                      <Card
                        key={manual.id}
                        className="cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
                        onClick={() => openModal(manual)}
                      >
                        <div className="flex items-center p-4 gap-4">
                          <div className="relative w-24 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                            <Image
                              src="/preview.png"
                              alt={manual.title}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-800 truncate">{manual.title}</h3>
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
                                      <div className="flex items-center text-xs">
                                        <span className="text-slate-600 w-32">対象者：</span>
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
                                      <div className="flex items-center text-xs">
                                        <span className="text-slate-600 w-32">
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
                )}
              </>
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

          {/* サイドバー */}
          <aside className="lg:w-80 space-y-4">
            {/* 対象者フィルタ - 中カテゴリの見出し分だけ下げる */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:mt-[45px]">
              <h2 className="text-xl font-bold mb-4 text-slate-800">対象者で絞り込む</h2>
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
              <h2 className="text-xl font-bold mb-4 text-slate-800">freee契約プランで絞り込む</h2>
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
              <h2 className="text-xl font-bold mb-4 text-slate-800">カテゴリーから探す</h2>
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
    </div>
  );
}
