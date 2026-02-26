"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { type Brand, getBrandBySlug } from "../_components/brand-api";
import { BrandDetailSkeleton } from "../_components/brand-detail-skeleton";

function getText(json: Record<string, string> | null): string {
  if (!json) return "";
  return json.en_US || json.en || Object.values(json)[0] || "";
}

export default function BrandDetailPage() {
  const params = useParams();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const data = await getBrandBySlug(params.slug as string);
        setBrand(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();
  }, [params.slug]);

  if (loading) {
    return <BrandDetailSkeleton />;
  }

  if (error || !brand) {
    return (
      <div className="p-8 text-center">
        <XCircle className="text-muted-foreground mx-auto h-12 w-12" />
        <p className="mt-2 font-medium">Brand not found</p>
      </div>
    );
  }

  const name = getText(brand.name) || "Untitled Brand";
  const description = getText(brand.description);
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Brand Details</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/brands">
              <ArrowLeft className="me-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/dashboard/brands/edit/${brand.id}`}>
              <Pencil className="me-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-40" />
            <col />
          </colgroup>
          <tbody>
            <tr className="border-b">
              <td className="text-muted-foreground px-4 py-3 font-medium">ID</td>
              <td className="px-4 py-3">{brand.id}</td>
            </tr>
            <tr className="border-b">
              <td className="text-muted-foreground px-4 py-3 font-medium">Name</td>
              <td className="break-words px-4 py-3">{name}</td>
            </tr>
            <tr className="border-b">
              <td className="text-muted-foreground px-4 py-3 font-medium">Slug</td>
              <td className="px-4 py-3">
                {brand.slug ? <code className="bg-muted rounded px-1.5 py-0.5 text-xs">/{brand.slug}</code> : "—"}
              </td>
            </tr>
            <tr className="border-b">
              <td className="text-muted-foreground px-4 py-3 font-medium">Status</td>
              <td className="px-4 py-3">
                <Badge variant={brand.active ? "default" : "secondary"}>
                  {brand.active ? "Active" : "Inactive"}
                </Badge>
              </td>
            </tr>
            <tr className="border-b">
              <td className="text-muted-foreground px-4 py-3 font-medium">Logo</td>
              <td className="px-4 py-3">
                {brand.logo ? <img src={brand.logo} alt={name} className="h-10 w-10 object-contain" /> : "—"}
              </td>
            </tr>
            <tr className="border-b">
              <td className="text-muted-foreground px-4 py-3 font-medium">Description</td>
              <td className="break-words px-4 py-3">{description || "—"}</td>
            </tr>
            <tr className="border-b">
              <td className="text-muted-foreground px-4 py-3 font-medium">Created</td>
              <td className="px-4 py-3">{formatDate(brand.createdAt)}</td>
            </tr>
            <tr>
              <td className="text-muted-foreground px-4 py-3 font-medium">Updated</td>
              <td className="px-4 py-3">{formatDate(brand.updatedAt)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
