import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-8 h-10 w-48" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map(() => (
          <div key={crypto.randomUUID()} className="rounded-lg border p-6">
            <Skeleton className="mb-2 h-5 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <Skeleton className="mb-4 h-7 w-32" />
          <div className="space-y-3">
            {[...Array(3)].map(() => (
              <Skeleton key={crypto.randomUUID()} className="h-6 w-full" />
            ))}
          </div>
        </div>
        <div className="rounded-lg border p-6">
          <Skeleton className="mb-4 h-7 w-32" />
          <div className="space-y-3">
            {[...Array(3)].map(() => (
              <Skeleton key={crypto.randomUUID()} className="h-6 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
