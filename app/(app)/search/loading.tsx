import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 md:mb-10">
        <Skeleton className="h-10 w-64 mb-2 md:h-12" />
        <Skeleton className="h-6 w-96 md:h-7" />
      </header>

      <Skeleton className="h-4 w-32 mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {["result-1", "result-2", "result-3", "result-4", "result-5", "result-6"].map(
          (resultId) => (
            <div
              key={resultId}
              className="bg-white p-6 rounded-lg shadow-sm border border-slate-200"
            >
              <Skeleton className="h-6 w-3/4 mb-2" />

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>

                <div className="flex flex-wrap gap-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>

              <Skeleton className="h-4 w-40 mt-4" />
            </div>
          )
        )}
      </div>
    </div>
  );
}
