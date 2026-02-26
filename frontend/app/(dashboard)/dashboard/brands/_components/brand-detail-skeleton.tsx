import { Skeleton } from "@/components/ui/skeleton";

export function BrandDetailSkeleton() {
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-40" />
            <col />
          </colgroup>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className={i < 7 ? "border-b" : ""}>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-48" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
