"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import Link from "next/link";
import { type Brand, getBrands, deleteBrand } from "./brand-api";
import { BrandsListSkeleton } from "./brands-list-skeleton";

function getName(name: Record<string, string> | null): string {
  if (!name) return "Untitled";
  return name.en_US || name.en || Object.values(name)[0] || "Untitled";
}

export function BrandsList() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchBrands = async (search?: string) => {
    setLoading(true);
    try {
      const data = await getBrands(search);
      setBrands(data);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands(debouncedSearch || undefined);
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBrand(deleteTarget.id);
      setDeleteTarget(null);
      fetchBrands();
    } catch (error) {
      console.error("Failed to delete brand:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Brands</h2>
          <p className="text-muted-foreground text-sm">
            {brands.length} {brands.length === 1 ? "brand" : "brands"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px] pl-9"
            />
          </div>
          <Button asChild>
            <Link href="/dashboard/brands/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <BrandsListSkeleton />
      ) : brands.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">
          {debouncedSearch
            ? `No brands found matching "${debouncedSearch}".`
            : "No brands found. Create your first brand."}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-md border">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b">
                <th className="text-muted-foreground h-10 w-12 px-4 text-left text-xs font-medium">ID</th>
                <th className="text-muted-foreground h-10 w-12 px-4 text-left text-xs font-medium">Logo</th>
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
                  <td className="p-4">
                    {brand.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.logo}
                        alt={getName(brand.name)}
                        className="h-8 w-8 rounded object-contain"
                      />
                    ) : (
                      <div className="bg-muted h-8 w-8 rounded" />
                    )}
                  </td>
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
                        onClick={() => setDeleteTarget(brand)}
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

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Brand</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget ? getName(deleteTarget.name) : ""}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
