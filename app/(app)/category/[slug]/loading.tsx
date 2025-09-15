import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="w-full bg-white p-4 border-b border-slate-200">
        <div className="container mx-auto flex items-center justify-between">
          <Skeleton className="h-9 w-40" />
          <div className="flex items-center space-x-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </aside>

      <main className="container mx-auto p-5 md:p-10">
        <header className="mb-8">
          <Skeleton className="mb-4 h-10 w-64 md:h-12" />
          <Skeleton className="h-6 w-96 md:h-7" />
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* メインコンテンツ */}
          <div className="flex-1">
            <div className="space-y-8">
              {/* サブカテゴリセクション */}
              {["section-1", "section-2"].map((sectionId) => (
                <section key={sectionId}>
                  <Skeleton className="h-7 w-32 mb-4" />
                  <div className="space-y-3">
                    {["card-1", "card-2", "card-3"].map((cardId) => (
                      <Card key={`${sectionId}-${cardId}`} className="overflow-hidden">
                        <div className="flex items-center p-4 gap-4">
                          <Skeleton className="w-24 h-16 rounded" />
                          <div className="flex-1 space-y-3">
                            <Skeleton className="h-5 w-3/4" />
                            <div className="flex gap-1">
                              <Skeleton className="h-5 w-16 rounded-full" />
                              <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          {/* サイドバー */}
          <aside className="lg:w-80 space-y-4">
            {/* 対象者フィルタ */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Skeleton className="h-7 w-40 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>

            {/* カテゴリー一覧 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Skeleton className="h-7 w-40 mb-4" />
              <div className="space-y-2">
                {["cat-1", "cat-2", "cat-3", "cat-4", "cat-5", "cat-6", "cat-7"].map((catId) => (
                  <Skeleton key={catId} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
