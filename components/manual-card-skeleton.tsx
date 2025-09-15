import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ManualCardSkeleton() {
  return (
    <Card
      className="overflow-hidden shadow-md flex flex-col h-full bg-white rounded-xl border border-slate-200 animate-in fade-in-50 duration-500"
      aria-label="マニュアルカードを読み込み中"
    >
      <CardHeader className="p-0 relative h-[200px] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        <Skeleton className="h-full w-full rounded-none" aria-label="サムネイル画像を読み込み中" />
      </CardHeader>
      <CardContent className="p-5 flex-grow">
        <Skeleton className="mb-2 h-6 w-3/4" aria-label="タイトルを読み込み中" />
        <Skeleton className="h-4 w-full" aria-label="説明を読み込み中" />
      </CardContent>
      <CardFooter className="p-5 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-6 w-16 rounded-full" aria-label="カテゴリを読み込み中" />
          <div className="flex gap-1">
            <Skeleton className="h-4 w-12" aria-label="タグを読み込み中" />
            <Skeleton className="h-4 w-12" aria-label="タグを読み込み中" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
