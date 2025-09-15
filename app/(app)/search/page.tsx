import { SearchResultCard } from "@/components/search-result-card";
import { ErrorMessage } from "@/components/ui/error-message";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { Metadata } from "next";
import Link from "next/link";

type Manual = Database["public"]["Tables"]["manuals"]["Row"];

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || "";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://manual-management-system.vercel.app";
  const searchUrl = `${siteUrl}/search${query ? `?q=${encodeURIComponent(query)}` : ""}`;

  return {
    title: query ? `「${query}」の検索結果` : "マニュアル検索",
    description: query
      ? `「${query}」に関するfreee人事労務のマニュアル検索結果`
      : "freee人事労務のマニュアルを検索。キーワードやカテゴリーから必要な情報を見つけることができます。",
    openGraph: {
      title: query ? `「${query}」の検索結果 | freeeクリア` : "マニュアル検索 | freeeクリア",
      description: "freee人事労務のマニュアルを検索",
      url: searchUrl,
    },
    robots: {
      index: false, // 検索結果ページはインデックスしない
      follow: true,
    },
    alternates: {
      canonical: searchUrl,
    },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  try {
    const params = await searchParams;
    const query = params.q || "";

    const supabase = await createClient();

    // 複数の条件でOR検索を実行
    const { data: manuals, error } = await supabase
      .from("manuals")
      .select("*")
      .eq("is_published", true)
      .or(
        `title.ilike.%${query}%,` +
          `main_category.ilike.%${query}%,` +
          `sub_category.ilike.%${query}%,` +
          `tags.cs.{${query}}`
      )
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Failed to search manuals:", error);
      return (
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 md:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 text-slate-900">
              「{query}」の検索結果
            </h1>
            <p className="text-slate-600 text-sm sm:text-base md:text-lg">
              キーワードに一致するマニュアル一覧です。
            </p>
          </header>
          <ErrorMessage title="検索に失敗しました" message={error.message} />
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 text-slate-900">
            「{query}」の検索結果
          </h1>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg">
            キーワードに一致するマニュアル一覧です。
          </p>
        </header>

        {manuals && manuals.length > 0 ? (
          <>
            <p className="text-sm sm:text-sm text-slate-600 mb-4">
              {manuals.length}件のマニュアルが見つかりました
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {manuals.map((manual) => (
                <SearchResultCard key={manual.id} manual={manual} searchQuery={query} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow">
            <svg
              role="img"
              aria-label="検索結果なし"
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-400 mb-4"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-slate-500 text-base sm:text-lg">
              「{query}」に一致するマニュアルが見つかりませんでした。
            </p>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              別のキーワードでお試しください。
            </p>
            <Link href="/" className="mt-4 text-primary hover:underline text-sm">
              トップページに戻る
            </Link>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Unexpected error in SearchPage:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          title="予期しないエラーが発生しました"
          message="ページの読み込み中にエラーが発生しました。"
        />
      </div>
    );
  }
}
