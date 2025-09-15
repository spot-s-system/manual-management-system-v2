"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function AboutSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-16">
      {/* コンパクトな導入部分 */}
      <div className="text-center mb-6 py-6 border-y border-slate-200">
        <p className="text-slate-600  mb-3">このポータルって、なんであるの？そんな方へ。</p>
        <p className="text-slate-700 mb-4 font-medium">
          freeeを導入しても現場でつまずく。
          <br />
          そんな"あたりまえ"に、スポット社労士くんが向き合いました。
        </p>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg font-medium transition-all group"
          aria-expanded={isExpanded}
        >
          <span>このポータルをつくった理由（全文を読む）</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 transition-transform" />
          ) : (
            <ChevronDown className="w-4 h-4 transition-transform" />
          )}
        </button>
      </div>

      {/* 展開時の全文 */}
      {isExpanded && (
        <div className="max-w-4xl mx-auto space-y-6 px-4">
          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/30 rounded-xl border border-blue-200 p-8 shadow-sm">
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed">
                freee人事労務のヘルプページには、多くの操作パターンや設定手順が掲載されています。
              </p>

              <p className="text-slate-700 leading-relaxed mt-4">
                しかし現場では「どの操作を選んで設定すれば正解なのか？」と迷う担当者や経営者が少なくありません。
              </p>

              <p className="text-slate-700 leading-relaxed mt-4">
                スポット社労士くんのもとにも、
                <br />
                「freeeの正しい使い方が分からない」
                <br />
                「細かい設定が不安」という声が日々寄せられています。
              </p>

              <p className="text-slate-700 leading-relaxed mt-4">
                オンラインでのご案内も行っていますが、本業の合間にfreeeの操作を習得し、正確に実行し続けるのは、現実的にかなり大変です。
              </p>
            </div>

            {/* ハイライトセクション */}
            <div className="p-6 backdrop-blur rounded-xl">
              <p className="font-bold text-slate-800 text-lg mb-4">
                そこでスポット社労士くんでは、以下の"現場のリアル"に応えるために、
                <br />
                この freee人事労務 操作体験ポータル（freeeクリア）をつくりました。
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 min-w-[1.5rem] w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  <span className="text-slate-700">業務に本当に必要な操作だけを抜き出し</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 min-w-[1.5rem] w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  <span className="text-slate-700">新人でも"見たまま操作できる"ように設計し</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 min-w-[1.5rem] w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  <span className="text-slate-700">
                    担当者が変わっても、freeeの運用が継続できるように
                  </span>
                </div>
              </div>
            </div>

            {/* クロージング */}
            <div className="text-center p-6">
              <p className="text-xl font-bold text-slate-800 mb-3">
                "わからない"が、
                <span
                  className="inline-block font-bold text-2xl mx-1 relative"
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
              <p className="text-lg text-slate-700 mb-4">その瞬間を、ここで体験してください。</p>

              <p className="text-sm text-slate-500">powered by スポット社労士くん</p>
            </div>

            {/* 閉じるボタン */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-sm text-slate-600 hover:text-slate-700 underline decoration-dotted underline-offset-4"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
