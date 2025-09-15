import { CATEGORIES } from "@/app/constants/categories";
import { CategoryIcon } from "@/components/ui/category-icon";
import { ErrorMessage } from "@/components/ui/error-message";
import { PcRecommendationNotice } from "@/components/ui/pc-recommendation-notice";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

// カテゴリの表示用データ
const CATEGORY_DISPLAY = [
  {
    slug: "onboarding-registration",
    label: "入社（入社日までに登録）",
    description: "入社日までに必要な各種情報の登録",
    icon_name: "Edit",
  },
  {
    slug: "onboarding-after",
    label: "入社（入社日以降に登録）",
    description: "入社後に必要な手続きと設定",
    icon_name: "UserCheck",
  },
  {
    slug: "director-registration",
    label: "役員の登録方法",
    description: "役員の登録に関する手続き",
    icon_name: "UserPlus",
  },
  {
    slug: "bonus",
    label: "賞与",
    description: "賞与計算と支給に関する手続き",
    icon_name: "Gift",
  },
  {
    slug: "leave",
    label: "有休・休暇",
    description: "有給休暇と特別休暇の管理",
    icon_name: "Calendar",
  },
  {
    slug: "resignation",
    label: "退職",
    description: "退職手続きと必要な対応",
    icon_name: "UserMinus",
  },
  {
    slug: "attendance-correction",
    label: "勤怠の修正方法",
    description: "勤怠データの修正手順",
    icon_name: "Edit3",
  },
  {
    slug: "shift-system",
    label: "1日8時間以内のシフト制",
    description: "シフト制の設定と管理",
    icon_name: "Clock",
  },
  {
    slug: "monthly-variable-working",
    label: "1か月変形労働時間制",
    description: "変形労働時間制の設定と運用",
    icon_name: "Calendar",
  },
  {
    slug: "flex",
    label: "フレックス",
    description: "フレックスタイム制に関する設定と管理",
    icon_name: "Clock",
  },
  {
    slug: "employee-attendance",
    label: "（従業員用）勤怠",
    description: "従業員向けの勤怠管理方法と各種設定",
    icon_name: "Users",
  },
  {
    slug: "salary-deduction",
    label: "給与控除の設定",
    description: "給与控除に関する各種設定",
    icon_name: "Calculator",
  },
  {
    slug: "other",
    label: "その他",
    description: "その他の管理業務に関するマニュアル",
    icon_name: "Settings",
  },
  {
    slug: "documents",
    label: "書類",
    description: "各種書類のダウンロード",
    icon_name: "Download",
  },
];

type Manual = Database["public"]["Tables"]["manuals"]["Row"];

export default async function Home() {
  const supabase = await createClient();

  const { data: manuals, error } = await supabase
    .from("manuals")
    .select("*")
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching manuals:", error);
  }

  // カテゴリごとにマニュアルをグループ化
  const categoryManuals = (manuals || []).reduce(
    (acc, manual) => {
      const category = CATEGORY_DISPLAY.find((cat) => cat.label === manual.main_category);
      if (category) {
        if (!acc[category.slug]) {
          acc[category.slug] = [];
        }
        acc[category.slug].push(manual);
      }
      return acc;
    },
    {} as Record<string, Manual[]>
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "スポット社労士くん freee人事労務ヘルプページ",
    description: "freee人事労務の操作マニュアルカテゴリー一覧",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://manual-management-system.vercel.app",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: CATEGORY_DISPLAY.map((category, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "HowToGuide",
          name: category.label,
          description: category.description,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://manual-management-system.vercel.app"}/category/${category.slug}`,
        },
      })),
    },
  };

  try {
    return (
      <>
        <Script id="homepage-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(jsonLd)}
        </Script>
        <div className="min-h-screen bg-slate-50">
          {/* カテゴリー一覧 */}
          <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-2">
                freee人事労務 操作体験ポータル
              </h1>
              <p className="text-base sm:text-lg text-slate-600 text-center mb-4">
                カテゴリーから必要な操作ガイドをお探しください
              </p>
              <PcRecommendationNotice className="max-w-3xl mx-auto" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {CATEGORY_DISPLAY.map((category) => {
                const manuals = categoryManuals[category.slug] || [];

                return (
                  <div
                    key={category.slug}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 hover:border-blue-300 group flex flex-col h-full"
                  >
                    <Link href={`/category/${category.slug}`} className="block p-6 pb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`${
                            category.slug.startsWith("onboarding")
                              ? "bg-blue-100"
                              : category.slug === "bonus"
                                ? "bg-green-100"
                                : category.slug === "leave"
                                  ? "bg-purple-100"
                                  : category.slug === "resignation"
                                    ? "bg-red-100"
                                    : category.slug === "attendance"
                                      ? "bg-orange-100"
                                      : category.slug === "salary-deduction"
                                        ? "bg-yellow-100"
                                        : category.slug === "documents"
                                          ? "bg-cyan-100"
                                          : "bg-gray-100"
                          } p-2 rounded-lg`}
                        >
                          <CategoryIcon
                            iconName={category.icon_name}
                            className={`w-6 h-6 ${
                              category.slug.startsWith("onboarding")
                                ? "text-blue-600"
                                : category.slug === "bonus"
                                  ? "text-green-600"
                                  : category.slug === "leave"
                                    ? "text-purple-600"
                                    : category.slug === "resignation"
                                      ? "text-red-600"
                                      : category.slug === "attendance"
                                        ? "text-orange-600"
                                        : category.slug === "salary-deduction"
                                          ? "text-yellow-600"
                                          : category.slug === "documents"
                                            ? "text-cyan-600"
                                            : "text-gray-600"
                            } group-hover:scale-110 transition-transform`}
                          />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {category.label}
                        </h3>
                      </div>
                    </Link>

                    {/* サブカテゴリプレビュー */}
                    <div className="flex-1 px-6">
                      {(() => {
                        const categoryKey = Object.keys(CATEGORIES).find(
                          (key) => CATEGORIES[key as keyof typeof CATEGORIES].slug === category.slug
                        ) as keyof typeof CATEGORIES | undefined;

                        const subcategories = categoryKey
                          ? CATEGORIES[categoryKey].subcategories
                          : [];

                        if (subcategories.length > 0) {
                          return (
                            <div className="space-y-1">
                              {subcategories.slice(0, 4).map((subcat) => (
                                <Link
                                  key={subcat}
                                  href={`/category/${category.slug}#subcategory-${subcat.replace(/\s+/g, "-")}`}
                                  className="block px-3 py-2 text-sm sm:text-sm text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                  {subcat}
                                </Link>
                              ))}
                            </div>
                          );
                        }
                        if (manuals.length > 0) {
                          // サブカテゴリがない場合は、マニュアルがあることを表示
                          return (
                            <p className="text-sm sm:text-sm text-slate-600">
                              {manuals.length}件のマニュアル
                            </p>
                          );
                        }
                        return (
                          <p className="text-xs sm:text-sm text-slate-500">
                            コンテンツは準備中です
                          </p>
                        );
                      })()}
                    </div>

                    {/* もっと見るリンク - 常に右下に配置 */}
                    <div className="p-6 pt-2 text-right">
                      <Link
                        href={`/category/${category.slug}`}
                        className="inline-flex items-center text-sm sm:text-sm text-blue-600 font-medium hover:text-blue-700 group-hover:gap-2 transition-all"
                      >
                        もっと見る
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

          </main>

          {/* フッター */}
          <footer className="bg-slate-800 text-white py-6 mt-16">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm sm:text-sm opacity-75">powered by スポット社労士くん</p>
            </div>
          </footer>
        </div>
      </>
    );
  } catch (error) {
    console.error("Unexpected error in Home page:", error);
    return (
      <div className="min-h-screen bg-slate-100">
        <main className="container mx-auto px-4 py-8">
          <ErrorMessage
            title="予期しないエラーが発生しました"
            message="ページの読み込み中にエラーが発生しました。"
          />
        </main>
      </div>
    );
  }
}
