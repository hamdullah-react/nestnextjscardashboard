"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaPickerDialog } from "@/components/global/media-picker-dialog";
import { type Brand, createBrand, updateBrand } from "./brand-api";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface BrandFormProps {
  brand?: Brand;
}

export function BrandForm({ brand }: BrandFormProps) {
  const router = useRouter();
  const isEdit = !!brand;

  const [slugManual, setSlugManual] = useState(false);
  const [form, setForm] = useState({
    name: brand?.name?.en_US || "",
    description: brand?.description?.en_US || "",
    slug: brand?.slug || "",
    logo: brand?.logo || "",
    active: brand?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const body = {
      name: { en_US: form.name },
      description: { en_US: form.description },
      slug: form.slug,
      logo: form.logo,
      active: form.active,
    };

    try {
      if (isEdit) {
        await updateBrand(brand.id, body);
      } else {
        await createBrand(body);
      }
      router.push("/dashboard/brands");
    } catch (error) {
      console.error("Failed to save brand:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
        {/* Name */}
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((prev) => ({
                ...prev,
                name,
                ...(!slugManual ? { slug: toSlug(name) } : {}),
              }));
            }}
            placeholder="Brand name"
          />
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brand description"
          />
        </div>

        {/* Slug */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="slug">Slug</Label>
            <button
              type="button"
              onClick={() => {
                if (slugManual) {
                  setSlugManual(false);
                  setForm((prev) => ({ ...prev, slug: toSlug(prev.name) }));
                } else {
                  setSlugManual(true);
                }
              }}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                slugManual
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {slugManual ? "Auto" : "Edit"}
            </button>
          </div>
          <Input
            id="slug"
            value={form.slug}
            disabled={!slugManual}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="auto-generated-slug"
          />
        </div>

        {/* Logo */}
        <div className="grid gap-2">
          <Label>Logo</Label>
          {form.logo ? (
            <div className="relative group w-full">
              <div className="rounded-md border border-input overflow-hidden bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.logo}
                  alt="Brand logo"
                  className="w-full h-40 object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, logo: "" })}
                className="absolute top-2 right-2 rounded-full bg-background/80 border border-input p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-input p-6 cursor-pointer transition-colors hover:border-primary/50"
            >
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Choose from Media Library
              </p>
            </button>
          )}
        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="h-4 w-4"
          />
          <Label htmlFor="active">Active</Label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update Brand" : "Create Brand"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/brands")}
          >
            Cancel
          </Button>
        </div>
      </form>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(url) => setForm((prev) => ({ ...prev, logo: url }))}
        folder="brands"
        accept="image/*"
      />
    </div>
  );
}
