"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Clock } from "lucide-react";

type ManualCardProps = {
  manual: {
    id: string;
    title: string;
    url: string;
    main_category: string;
    sub_category?: string | null;
    tags?: string[] | null;
  };
};

export function ManualCard({ manual }: ManualCardProps) {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full group bg-white rounded-xl border border-slate-200 hover:border-slate-300">
      <CardHeader className="p-0 relative h-[200px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">マニュアル</p>
        </div>
        {manual.url === "#" && (
          <div className="absolute top-3 right-3 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            準備中
          </div>
        )}
      </CardHeader>
      <CardContent className="p-5 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1.5 line-clamp-2 text-slate-800">
          {manual.title}
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">クリックして詳細を確認</CardDescription>
      </CardContent>
      <CardFooter className="p-5 pt-3 border-t border-slate-100">
        <div className="flex flex-col gap-2 w-full">
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium self-start">
            {manual.sub_category
              ? `${manual.main_category} > ${manual.sub_category}`
              : manual.main_category}
          </span>
          {manual.tags && manual.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {manual.tags
                .filter((tag) =>
                  [
                    "ミニマム",
                    "スターター",
                    "スタンダード",
                    "プロフェッショナル",
                    "アドバンス",
                  ].includes(tag)
                )
                .map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              {manual.tags
                .filter(
                  (tag) =>
                    ![
                      "ミニマム",
                      "スターター",
                      "スタンダード",
                      "プロフェッショナル",
                      "アドバンス",
                    ].includes(tag)
                )
                .map((tag) => (
                  <span key={tag} className="text-xs text-slate-400">
                    #{tag}
                  </span>
                ))}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
