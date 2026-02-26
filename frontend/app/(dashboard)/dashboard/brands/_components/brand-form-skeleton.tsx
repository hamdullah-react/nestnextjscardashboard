import { Skeleton } from "@/components/ui/skeleton";

export function BrandFormSkeleton() {
  return (
    <div className="p-4">
      <Skeleton className="h-8 w-32" />
      <div className="mt-4 flex justify-center">
        <div className="w-full max-w-lg space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <div className="flex gap-3">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
