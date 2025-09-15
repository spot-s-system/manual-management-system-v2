"use client";

import type { Database } from "@/types/database";
import { useState } from "react";
import { ManualModal } from "./ui/manual-modal";

type Manual = Database["public"]["Tables"]["manuals"]["Row"];

interface SearchResultCardProps {
  manual: Manual;
  searchQuery: string;
}

// テキストをハイライト表示する関数
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <mark
          key={`highlight-${index}-${part}`}
          className="bg-yellow-200 text-inherit rounded px-0.5"
        >
          {part}
        </mark>
      );
    }
    return <span key={`text-${index}-${part}`}>{part}</span>;
  });
}

export function SearchResultCard({ manual, searchQuery }: SearchResultCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-slate-200 hover:border-blue-300"
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          {highlightText(manual.title, searchQuery)}
        </h3>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">カテゴリー:</span>
            <span className="text-slate-700">
              {highlightText(manual.main_category, searchQuery)}
              {manual.sub_category && (
                <>
                  {" > "}
                  {highlightText(manual.sub_category, searchQuery)}
                </>
              )}
            </span>
          </div>

          {manual.tags && manual.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {manual.tags.map((tag) => {
                const isHighlighted = tag.toLowerCase().includes(searchQuery.toLowerCase());
                return (
                  <span
                    key={tag}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isHighlighted
                        ? "bg-yellow-100 text-yellow-800 font-medium"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-blue-600 font-medium">クリックして詳細を表示 →</div>
      </div>

      <ManualModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} manual={manual} />
    </>
  );
}
