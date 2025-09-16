"use client";

import { CATEGORIES } from "@/app/constants/categories";
import { CategoryIcon } from "@/components/ui/category-icon";
import { ErrorMessage } from "@/components/ui/error-message";
import { ManualModal } from "@/components/ui/manual-modal";
import { PcRecommendationNotice } from "@/components/ui/pc-recommendation-notice";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

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

export default function Home() {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchManuals = async () => {
      const { data, error } = await supabase
        .from("manuals")
        .select("*")
        .eq("is_published", true)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error fetching manuals:", error);
      } else {
        setManuals(data || []);
      }
      setLoading(false);
    };

    fetchManuals();
  }, [supabase]);

  const openModal = (manual: Manual) => {
    setSelectedManual(manual);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedManual(null);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

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
            <div className="text-center mb-4">
              <span className="inline-block bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1.5 rounded-full font-bold text-sm sm:text-base mr-2">
                LINE友だち限定
              </span>
              <span className="text-lg sm:text-xl font-bold text-slate-800">
                無料デモ体験サイト
              </span>
              <p className="text-sm text-slate-600 mt-2">
                ※弊社給与計算サービスをご利用の方は全てご覧いただけます。
                <button
                  type="button"
                  onClick={() => {
                    const element = document.getElementById("salary-service-section");
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-blue-600 hover:text-blue-700 underline ml-1"
                >
                  詳しくはこちら
                </button>
              </p>
            </div>
            <PcRecommendationNotice className="max-w-3xl mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {CATEGORY_DISPLAY.map((category) => {
              const manuals = categoryManuals[category.slug] || [];

              // Skip categories with no manuals
              if (manuals.length === 0) {
                return null;
              }

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

                      // Show all manuals, but style differently for locked ones
                      if (manuals.length > 0) {
                        // Group manuals by subcategory
                        const groupedManuals: Record<string, typeof manuals> = {};
                        for (const manual of manuals) {
                          const subCat = manual.sub_category || "その他";
                          if (!groupedManuals[subCat]) {
                            groupedManuals[subCat] = [];
                          }
                          groupedManuals[subCat].push(manual);
                        }

                        // Show up to 4 items total
                        let itemsShown = 0;
                        const maxItems = 4;
                        // If there's only one manual total, it should also be locked
                        const shouldShowFirstManual = manuals.length > 1;
                        let isFirstManual = true;

                        return (
                          <div className="space-y-1">
                            {Object.entries(groupedManuals).map(([subcat, subManuals]) => {
                              if (itemsShown >= maxItems) return null;

                              return subManuals.map((manual) => {
                                if (itemsShown >= maxItems) return null;
                                itemsShown++;

                                const isViewable = shouldShowFirstManual && isFirstManual;
                                if (isFirstManual) {
                                  isFirstManual = false;
                                }

                                if (isViewable) {
                                  return (
                                    <button
                                      key={manual.id}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        openModal(manual);
                                      }}
                                      className="block w-full text-left px-3 py-2 text-sm sm:text-sm rounded-lg transition-colors relative text-slate-700 hover:text-blue-600 hover:bg-slate-50 cursor-pointer"
                                    >
                                      <span>{manual.sub_category || manual.title}</span>
                                    </button>
                                  );
                                }
                                return (
                                  <div
                                    key={manual.id}
                                    className="block px-3 py-2 text-sm sm:text-sm rounded-lg transition-colors relative text-slate-400 bg-slate-50/50"
                                  >
                                    <Lock className="w-3 h-3 inline-block mr-1" />
                                    <span className="opacity-50">
                                      {manual.sub_category || manual.title}
                                    </span>
                                  </div>
                                );
                              });
                            })}
                            {manuals.length > maxItems && (
                              <p className="px-3 py-1 text-xs text-slate-500">
                                他{manuals.length - maxItems}件
                              </p>
                            )}
                          </div>
                        );
                      }
                      return (
                        <p className="text-xs sm:text-sm text-slate-500">コンテンツは準備中です</p>
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
            }).filter(Boolean)}
          </div>

          {/* 給与計算サービス紹介セクション */}
          <div id="salary-service-section" className="mt-16 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
              当社の給与計算サービス
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 給与伴走くん */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-blue-500 text-white text-center py-3 px-6 rounded-full font-bold text-base mx-5 mt-5 mb-4">
                  給与計算だけどうにかしたい
                </div>
                <div className="px-5 pb-5">
                  <div className="text-center py-2 mb-5">
                    <img
                      src="https://spot-s.or.jp/wp-content/uploads/2025/05/bansoukun2.png"
                      alt="給与伴走くん"
                      className="h-auto w-60 mx-auto"
                    />
                  </div>
                  <div className="mb-5">
                    <div className="flex">
                      <div className="bg-indigo-500 text-white px-4 py-3 text-sm font-bold flex items-center justify-center min-w-[100px] leading-tight">
                        <span>
                          提供
                          <br />
                          サービス
                        </span>
                      </div>
                      <div className="bg-gray-50 flex-1 px-5 py-3 border border-l-0 border-gray-300">
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li>• 給与計算ソフト導入</li>
                          <li>• 初期設定</li>
                          <li>• 伴走サポート</li>
                          <li>• 給与相談窓口</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex">
                      <div className="bg-indigo-500 text-white px-4 py-3 text-sm font-bold flex items-center justify-center min-w-[100px]">
                        月額
                      </div>
                      <div className="bg-gray-50 flex-1 px-5 py-3 border border-l-0 border-gray-300 flex items-center">
                        <span className="text-red-500 font-bold text-lg">
                          <span className="text-2xl">6,345</span>円〜（税込6,980円）
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://spot-s.or.jp/bansoukun-3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mx-5 mb-5 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-lg font-bold text-base transition-colors relative"
                  >
                    詳しくはこちら
                    <span className="absolute right-5 top-1/2 transform -translate-y-1/2">▶</span>
                  </a>
                </div>
              </div>

              {/* 労務ふり〜 */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-blue-500 text-white text-center py-3 px-6 rounded-full font-bold text-base mx-5 mt-5 mb-4">
                  手続きも困ってる（労務相談付き）
                </div>
                <div className="px-5 pb-5">
                  <div className="text-center py-2 mb-5">
                    <img
                      src="https://spot-s.or.jp/wp-content/uploads/2025/05/roumufreee.png"
                      alt="労務ふり〜"
                      className="h-auto w-60 mx-auto"
                    />
                  </div>
                  <div className="mb-5">
                    <div className="flex">
                      <div className="bg-indigo-500 text-white px-4 py-3 text-sm font-bold flex items-center justify-center min-w-[100px] leading-tight">
                        <span>
                          提供
                          <br />
                          サービス
                        </span>
                      </div>
                      <div className="bg-gray-50 flex-1 px-5 py-3 border border-l-0 border-gray-300">
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li>• 運用説明・労務相談</li>
                          <li>• 給与計算サポート</li>
                          <li>• 毎月の社保/労保の手続き</li>
                          <li>• 年度更新/算定基礎届</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex">
                      <div className="bg-indigo-500 text-white px-4 py-3 text-sm font-bold flex items-center justify-center min-w-[100px]">
                        月額
                      </div>
                      <div className="bg-gray-50 flex-1 px-5 py-3 border border-l-0 border-gray-300 flex items-center">
                        <span className="text-red-500 font-bold text-lg">
                          <span className="text-2xl">20,000</span>円〜（税込22,000円〜）
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://spot-s.or.jp/freee-3/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mx-5 mb-5 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-lg font-bold text-base transition-colors relative"
                  >
                    詳しくはこちら
                    <span className="absolute right-5 top-1/2 transform -translate-y-1/2">▶</span>
                  </a>
                </div>
              </div>

              {/* 始めの社労士くん */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-blue-500 text-white text-center py-3 px-6 rounded-full font-bold text-base mx-5 mt-5 mb-4">
                  初めての従業員採用の場合
                </div>
                <div className="px-5 pb-5">
                  <div className="text-center py-2 mb-5">
                    <img
                      src="https://spot-s.or.jp/wp-content/uploads/2025/05/hajimenosharousikun.png"
                      alt="始めの社労士くん"
                      className="h-auto w-60 mx-auto"
                    />
                  </div>
                  <div className="mb-5">
                    <div className="flex">
                      <div className="bg-indigo-500 text-white px-4 py-3 text-sm font-bold flex items-center justify-center min-w-[100px] leading-tight">
                        <span>
                          提供
                          <br />
                          サービス
                        </span>
                      </div>
                      <div className="bg-gray-50 flex-1 px-5 py-3 border border-l-0 border-gray-300">
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li>• 社会保険手続き</li>
                          <li>• 給与計算</li>
                          <li>• 就業規則</li>
                          <li>• 労務相談</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex">
                      <div className="bg-indigo-500 text-white px-4 py-3 text-sm font-bold flex items-center justify-center min-w-[100px]">
                        月額
                      </div>
                      <div className="bg-gray-50 flex-1 px-5 py-3 border border-l-0 border-gray-300 flex items-center">
                        <span className="text-red-500 font-bold text-lg">
                          <span className="text-2xl">12,500</span>円〜（税込13,750円〜）
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://spot-s.or.jp/hajim"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mx-5 mb-5 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-lg font-bold text-base transition-colors relative"
                  >
                    詳しくはこちら
                    <span className="absolute right-5 top-1/2 transform -translate-y-1/2">▶</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* フッター */}
        <footer className="bg-slate-800 text-white py-6 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm sm:text-sm opacity-75">powered by スポット社労士くん</p>
          </div>
        </footer>
      </div>

      {/* マニュアルモーダル */}
      {selectedManual && (
        <ManualModal isOpen={isModalOpen} onClose={closeModal} manual={selectedManual} />
      )}
    </>
  );
}
