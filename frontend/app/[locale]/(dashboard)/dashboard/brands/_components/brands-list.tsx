"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useRouter } from "@/i18n/navigation";
import { type Brand, getBrands, deleteBrand } from "./brand-api";

function getName(name: Record<string, string> | null): string {
  if (!name) return "Untitled";
  return name.en_US || name.en || Object.values(name)[0] || "Untitled";
}

export function BrandsList() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations("Brands");

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
    if (!confirm(t("deleteConfirm"))) return;
    try {
      await deleteBrand(id);
      fetchBrands();
    } catch (error) {
      console.error("Failed to delete brand:", error);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground p-4">{t("loading")}</div>;
  }

  return (
    <div className="space-y-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground text-sm">
            {t("brandsCount", { count: brands.length })}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/brands/create">
            <Plus className="mr-2 h-4 w-4" />
            {t("addBrand")}
          </Link>
        </Button>
      </div>

      {brands.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">
          {t("noBrandsFound")}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-md border">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b">
                <th className="text-muted-foreground h-10 w-12 px-4 text-left text-xs font-medium">{t("id")}</th>
                <th className="text-muted-foreground h-10 px-4 text-left text-xs font-medium">{t("name")}</th>
                <th className="text-muted-foreground hidden h-10 px-4 text-left text-xs font-medium md:table-cell">{t("description")}</th>
                <th className="text-muted-foreground hidden h-10 px-4 text-left text-xs font-medium sm:table-cell">{t("slug")}</th>
                <th className="text-muted-foreground h-10 w-20 px-4 text-left text-xs font-medium">{t("status")}</th>
                <th className="text-muted-foreground h-10 w-28 px-4 text-right text-xs font-medium">{t("actions")}</th>
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
                    {getName(brand.description) || "—"}
                  </td>
                  <td className="text-muted-foreground hidden max-w-[120px] truncate p-4 sm:table-cell">
                    <code className="bg-muted truncate rounded px-1.5 py-0.5 text-xs">
                      {brand.slug || "—"}
                    </code>
                  </td>
                  <td className="p-4">
                    <Badge variant={brand.active ? "default" : "secondary"}>
                      {brand.active ? t("active") : t("inactive")}
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
