"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";
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
  const t = useTranslations("BrandForm");
  const isEdit = !!brand;

  const [slugManual, setSlugManual] = useState(false);
  const [form, setForm] = useState({
    nameEn: brand?.name?.en_US || "",
    nameAr: brand?.name?.ar_001 || "",
    descEn: brand?.description?.en_US || "",
    descAr: brand?.description?.ar_001 || "",
    slug: brand?.slug || "",
    logo: brand?.logo || "",
    active: brand?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [showNameAr, setShowNameAr] = useState(!!brand?.name?.ar_001);
  const [showDescAr, setShowDescAr] = useState(!!brand?.description?.ar_001);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const name: Record<string, string> = { en_US: form.nameEn };
    if (form.nameAr) name.ar_001 = form.nameAr;

    const description: Record<string, string> = { en_US: form.descEn };
    if (form.descAr) description.ar_001 = form.descAr;

    const body = {
      name,
      description,
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
          <div className="flex items-center justify-between">
            <Label htmlFor="nameEn">{t("nameEnglish")}</Label>
            <button
              type="button"
              onClick={() => setShowNameAr(!showNameAr)}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                showNameAr
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Languages className="h-3 w-3" />
              AR
            </button>
          </div>
          <Input
            id="nameEn"
            value={form.nameEn}
            onChange={(e) => {
              const nameEn = e.target.value;
              setForm((prev) => ({
                ...prev,
                nameEn,
                ...(!slugManual ? { slug: toSlug(nameEn) } : {}),
              }));
            }}
            placeholder={t("brandNamePlaceholder")}
          />
          {showNameAr && (
            <div className="grid gap-2">
              <Label htmlFor="nameAr">{t("nameArabic")}</Label>
              <Input
                id="nameAr"
                dir="rtl"
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                placeholder={t("brandNameArPlaceholder")}
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="descEn">{t("descriptionEnglish")}</Label>
            <button
              type="button"
              onClick={() => setShowDescAr(!showDescAr)}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                showDescAr
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Languages className="h-3 w-3" />
              AR
            </button>
          </div>
          <Textarea
            id="descEn"
            rows={4}
            value={form.descEn}
            onChange={(e) => setForm({ ...form, descEn: e.target.value })}
            placeholder={t("brandDescPlaceholder")}
          />
          {showDescAr && (
            <div className="grid gap-2">
              <Label htmlFor="descAr">{t("descriptionArabic")}</Label>
              <Textarea
                id="descAr"
                dir="rtl"
                rows={4}
                value={form.descAr}
                onChange={(e) => setForm({ ...form, descAr: e.target.value })}
                placeholder={t("brandDescArPlaceholder")}
              />
            </div>
          )}
        </div>

        {/* Slug */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="slug">{t("slug")}</Label>
            <button
              type="button"
              onClick={() => {
                if (slugManual) {
                  setSlugManual(false);
                  setForm((prev) => ({ ...prev, slug: toSlug(prev.nameEn) }));
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
              {slugManual ? t("auto") : t("edit")}
            </button>
          </div>
          <Input
            id="slug"
            value={form.slug}
            disabled={!slugManual}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder={t("slugPlaceholder")}
          />
        </div>

        {/* Logo URL */}
        <div className="grid gap-2">
          <Label htmlFor="logo">{t("logoUrl")}</Label>
          <Input
            id="logo"
            value={form.logo}
            onChange={(e) => setForm({ ...form, logo: e.target.value })}
            placeholder={t("logoPlaceholder")}
          />
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
          <Label htmlFor="active">{t("active")}</Label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? t("saving") : isEdit ? t("updateBrand") : t("createBrand")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/brands")}
          >
            {t("cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
