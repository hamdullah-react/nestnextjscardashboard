"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { type Brand, getBrands, deleteBrand } from "./brand-api";

function getName(name: Record<string, string> | null): string {
  if (!name) return "Untitled";
  return name.en_US || name.en || Object.values(name)[0] || "Untitled";
}

export function BrandsList() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    try {
      await deleteBrand(id);
      fetchBrands();
    } catch (error) {
      console.error("Failed to delete brand:", error);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground p-4">Loading brands...</div>;
  }

  return (
    <div className="space-y-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Brands</h2>
          <p className="text-muted-foreground text-sm">
            {brands.length} {brands.length === 1 ? "brand" : "brands"}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/brands/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Link>
        </Button>
      </div>

      {brands.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">
          No brands found. Create your first brand.
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-md border">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b">
                <th className="text-muted-foreground h-10 w-12 px-4 text-left text-xs font-medium">ID</th>
                <th className="text-muted-foreground h-10 px-4 text-left text-xs font-medium">Name</th>
                <th className="text-muted-foreground hidden h-10 px-4 text-left text-xs font-medium md:table-cell">Description</th>
                <th className="text-muted-foreground hidden h-10 px-4 text-left text-xs font-medium sm:table-cell">Slug</th>
                <th className="text-muted-foreground h-10 w-20 px-4 text-left text-xs font-medium">Status</th>
                <th className="text-muted-foreground h-10 w-28 px-4 text-right text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {brands.map((brand) => (
                <tr key={brand.id} className="border-b">
                  <td className="text-muted-foreground p-4">{brand.id}</td>
                  <td className="max-w-[180px] truncate p-4 font-medium">
                    {getName(brand.name)}
                  </td>
                  <td className="text-muted-foreground hidden max-w-[200px] truncate p-4 text-sm md:table-cell">
                    {getName(brand.description) || "\u2014"}
                  </td>
                  <td className="text-muted-foreground hidden max-w-[120px] truncate p-4 sm:table-cell">
                    <code className="bg-muted truncate rounded px-1.5 py-0.5 text-xs">
                      {brand.slug || "\u2014"}
                    </code>
                  </td>
                  <td className="p-4">
                    <Badge variant={brand.active ? "default" : "secondary"}>
                      {brand.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      {brand.slug && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/dashboard/brands/${brand.slug}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          router.push(`/dashboard/brands/edit/${brand.id}`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(brand.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
