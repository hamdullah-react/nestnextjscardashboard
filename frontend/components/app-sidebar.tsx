"use client"

import {
  Car,
  LayoutDashboard,
  Tags,
  Palette,
  Calendar,
  Scissors,
  Image,
  Newspaper,
  Landmark,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { Link } from "@/i18n/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const user = {
  name: "Admin",
  email: "admin@alromaih.com",
  avatar: "",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const locale = useLocale()
  const t = useTranslations("Sidebar")

  const navMain = [
    {
      title: t("dashboard"),
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("brands"),
      url: "/dashboard/brands",
      icon: Tags,
      items: [
        { title: t("allBrands"), url: "/dashboard/brands" },
        { title: t("createBrand"), url: "/dashboard/brands/create" },
      ],
    },
    {
      title: t("models"),
      url: "/dashboard/models",
      icon: Car,
    },
    {
      title: t("cars"),
      url: "/dashboard/cars",
      icon: Car,
    },
    {
      title: t("trims"),
      url: "/dashboard/trims",
      icon: Scissors,
    },
    {
      title: t("years"),
      url: "/dashboard/years",
      icon: Calendar,
    },
    {
      title: t("colors"),
      url: "/dashboard/colors",
      icon: Palette,
    },
    {
      title: t("media"),
      url: "/dashboard/media",
      icon: Image,
    },
    {
      title: t("blogs"),
      url: "/dashboard/blogs",
      icon: Newspaper,
    },
    {
      title: t("banks"),
      url: "/dashboard/banks",
      icon: Landmark,
    },
    {
      title: t("visuals"),
      url: "/dashboard/visuals",
      icon: Image,
    },
  ]

  return (
    <Sidebar collapsible="icon" side={locale === "ar" ? "right" : "left"} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Car className="size-4" />
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">{t("alromaih")}</span>
                  <span className="truncate text-xs">{t("carsDashboard")}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <LocaleSwitcher />
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
