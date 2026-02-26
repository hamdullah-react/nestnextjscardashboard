"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Pencil,
  Globe,
  Calendar,
  ImageIcon,
  Hash,
  Tag,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useRouter } from "@/i18n/navigation";
import { type Brand, getBrandBySlug } from "../_components/brand-api";

function getText(json: Record<string, string> | null): string {
  if (!json) return "";
  return json.en_US || json.en || Object.values(json)[0] || "";
}

const wordBreak: React.CSSProperties = {
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("Brands");
  const tSidebar = useTranslations("Sidebar");
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
    return (
      <div className="flex items-center justify-center p-16">
        <div className="text-muted-foreground">{t("loading")}</div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="flex flex-col items-center gap-4 p-16">
        <XCircle className="text-muted-foreground h-12 w-12" />
        <p className="text-lg font-medium">{t("brandNotFound")}</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/brands")}>
          <ArrowLeft className="me-2 h-4 w-4" />
          {t("backToBrands")}
        </Button>
      </div>
    );
  }

  const name = getText(brand.name) || t("untitledBrand");
  const description = getText(brand.description);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex w-full items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ms-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard">{tSidebar("dashboard")}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard/brands">{tSidebar("brands")}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[200px] truncate">
                    {name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/brands")}
            >
              <ArrowLeft className="me-2 h-4 w-4" />
              {t("back")}
            </Button>
            <Button
              size="sm"
              onClick={() => router.push(`/dashboard/brands/edit/${brand.id}`)}
            >
              <Pencil className="me-2 h-4 w-4" />
              {t("editBrand")}
            </Button>
          </div>
        </div>
      </header>

      <div className="w-full space-y-6 p-4 pt-0">

        {/* Brand Header Card */}
        <div className="rounded-xl border p-6">
          <div className="flex items-start gap-4">
            {brand.logo ? (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border bg-white">
                <img
                  src={brand.logo}
                  alt={name}
                  className="h-12 w-12 object-contain"
                />
              </div>
            ) : (
              <div className="bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border">
                <Tag className="text-muted-foreground h-7 w-7" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight" style={wordBreak}>
                {name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={brand.active ? "default" : "secondary"}>
                  {brand.active ? t("active") : t("inactive")}
                </Badge>
                {brand.slug && (
                  <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                    /{brand.slug}
                  </code>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Description */}
          <div className="rounded-xl border p-6 md:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("description")}
              </h3>
            </div>
            <p className="text-foreground leading-relaxed" style={wordBreak}>
              {description || t("noDescription")}
            </p>
          </div>

          {/* Brand ID */}
          <div className="rounded-xl border p-6">
            <div className="mb-1 flex items-center gap-2">
              <Hash className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("brandId")}
              </span>
            </div>
            <p className="text-lg font-semibold">{brand.id}</p>
          </div>

          {/* Name */}
          <div className="rounded-xl border p-6">
            <div className="mb-1 flex items-center gap-2">
              <Tag className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("name")}
              </span>
            </div>
            <p className="text-lg font-semibold" style={wordBreak}>{name}</p>
          </div>

          {/* Slug */}
          <div className="rounded-xl border p-6">
            <div className="mb-1 flex items-center gap-2">
              <Globe className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("slug")}
              </span>
            </div>
            <p className="text-lg font-semibold" style={wordBreak}>
              {brand.slug || "—"}
            </p>
          </div>

          {/* Status */}
          <div className="rounded-xl border p-6">
            <div className="mb-1 flex items-center gap-2">
              {brand.active ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-red-500" />
              )}
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("status")}
              </span>
            </div>
            <p className="text-lg font-semibold">
              {brand.active ? t("active") : t("inactive")}
            </p>
          </div>

          {/* Logo */}
          <div className="rounded-xl border p-6">
            <div className="mb-3 flex items-center gap-2">
              <ImageIcon className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("logo")}
              </span>
            </div>
            {brand.logo ? (
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border bg-white p-2">
                  <img
                    src={brand.logo}
                    alt={name}
                    className="max-h-16 max-w-full object-contain"
                  />
                </div>
                <a
                  href={brand.logo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                  style={wordBreak}
                >
                  {t("viewFullImage")}
                </a>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{t("noLogoUploaded")}</p>
            )}
          </div>

          {/* Created At */}
          <div className="rounded-xl border p-6">
            <div className="mb-1 flex items-center gap-2">
              <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("created")}
              </span>
            </div>
            <p className="text-lg font-semibold">
              {formatDate(brand.createdAt)}
            </p>
          </div>

          {/* Updated At */}
          <div className="rounded-xl border p-6">
            <div className="mb-1 flex items-center gap-2">
              <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("lastUpdated")}
              </span>
            </div>
            <p className="text-lg font-semibold">
              {formatDate(brand.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
