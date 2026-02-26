import { Skeleton } from "@/components/ui/skeleton";

export function BrandsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="mt-1 h-4 w-16" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="h-10 w-12 px-4"><Skeleton className="h-3 w-6" /></th>
              <th className="h-10 px-4"><Skeleton className="h-3 w-12" /></th>
              <th className="hidden h-10 px-4 md:table-cell"><Skeleton className="h-3 w-20" /></th>
              <th className="hidden h-10 px-4 sm:table-cell"><Skeleton className="h-3 w-10" /></th>
              <th className="h-10 w-20 px-4"><Skeleton className="h-3 w-12" /></th>
              <th className="h-10 w-28 px-4"><Skeleton className="h-3 w-14 ml-auto" /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className={i < 4 ? "border-b" : ""}>
                <td className="p-4"><Skeleton className="h-4 w-6" /></td>
                <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                <td className="hidden p-4 md:table-cell"><Skeleton className="h-4 w-40" /></td>
                <td className="hidden p-4 sm:table-cell"><Skeleton className="h-5 w-20" /></td>
                <td className="p-4"><Skeleton className="h-5 w-14 rounded-full" /></td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
