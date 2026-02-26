"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BrandForm } from "../../_components/brand-form";
import { type Brand, getBrand } from "../../_components/brand-api";
import { BrandFormSkeleton } from "../../_components/brand-form-skeleton";

export default function EditBrandPage() {
  const params = useParams();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const data = await getBrand(Number(params.id));
        setBrand(data);
      } catch (error) {
        console.error("Failed to fetch brand:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();
  }, [params.id]);

  if (loading) {
    return <BrandFormSkeleton />;
  }

  if (!brand) {
    return <div className="p-8 text-red-500">Brand not found.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold tracking-tight">Edit Brand</h2>
      <div className="mt-4">
        <BrandForm brand={brand} />
      </div>
    </div>
  );
}
