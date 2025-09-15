import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "freee人事労務 操作体験ポータルとは",
  description:
    "freeeクリアについて。freee人事労務の導入後によくある「つまずきポイント」を解決するため、スポット社労士くんが作成した操作体験ポータルです。",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 py-8">
        {/* 戻るリンク */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          ホームに戻る
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            freee人事労務 操作体験ポータルとは
          </h1>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
            <div className="prose prose-slate max-w-none">
              {/* イントロダクション */}
              <div className="text-center mb-8 pb-8 border-b border-slate-200">
                <p className="text-lg text-slate-700 font-medium">
                  freeeを導入しても現場でつまずく。
                  <br />
                  そんな"あたりまえ"に、スポット社労士くんが向き合いました。
                </p>
              </div>

              {/* 本文 */}
              <div className="space-y-6">
                <p className="text-slate-700 leading-relaxed">
                  freee人事労務のヘルプページには、多くの操作パターンや設定手順が掲載されています。
                </p>

                <p className="text-slate-700 leading-relaxed">
                  しかし現場では「どの操作を選んで設定すれば正解なのか？」と迷う担当者や経営者が少なくありません。
                </p>

                <p className="text-slate-700 leading-relaxed">
                  スポット社労士くんのもとにも、
                  <br />
                  「freeeの正しい使い方が分からない」
                  <br />
                  「細かい設定が不安」という声が日々寄せられています。
                </p>

                <p className="text-slate-700 leading-relaxed">
                  オンラインでのご案内も行っていますが、本業の合間にfreeeの操作を習得し、正確に実行し続けるのは、現実的にかなり大変です。
                </p>
              </div>

              {/* ハイライトセクション */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 my-8">
                <p className="font-bold text-slate-800 text-lg mb-6">
                  そこでスポット社労士くんでは、以下の"現場のリアル"に応えるために、
                  <br />
                  この freee人事労務 操作体験ポータル（freeeクリア）をつくりました。
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 min-w-[2rem] w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">
                        業務に本当に必要な操作だけを抜き出し
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        実務で使う機能に絞って、分かりやすく整理しました
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 min-w-[2rem] w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">
                        新人でも"見たまま操作できる"ように設計し
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        実際の画面を見ながら、ステップバイステップで操作できます
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 min-w-[2rem] w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">
                        担当者が変わっても、freeeの運用が継続できるように
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        引き継ぎ時もこのポータルがあれば安心です
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* クロージング */}
              <div className="text-center py-8 border-t border-slate-200 mt-8">
                <p className="text-2xl font-bold text-slate-800 mb-4">
                  "わからない"が、
                  <span
                    className="inline-block font-bold text-3xl mx-2 relative"
                    style={{
                      background:
                        "linear-gradient(90deg, #ff6b6b 0%, #f06292 20%, #ba68c8 40%, #7986cb 60%, #4fc3f7 80%, #4db6ac 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      filter: "saturate(1.2) brightness(1.1)",
                    }}
                  >
                    "できる"
                  </span>
                  に変わる──
                </p>
                <p className="text-lg text-slate-700 mb-6">その瞬間を、ここで体験してください。</p>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  操作ガイドを探す
                </Link>

                <p className="text-sm text-slate-500 mt-8">powered by スポット社労士くん</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
