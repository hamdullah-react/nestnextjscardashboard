"use client";

import { BrandForm } from "../_components/brand-form";

export default function CreateBrandPage() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold tracking-tight">Create Brand</h2>
      <div className="mt-4">
        <BrandForm />
      </div>
    </div>
  );
}
