import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-4xl">
        <CardContent className="p-0">
          <div className="relative aspect-video w-full">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="p-8">
            <Skeleton className="mb-4 h-10 w-3/4" />
            <div className="mb-6 flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="mb-6 h-12 w-32" />
            <div>
              <Skeleton className="mb-4 h-8 w-48" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
