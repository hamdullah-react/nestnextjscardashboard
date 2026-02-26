"use client"

import {
  Car,
  LayoutDashboard,
  Warehouse,
  Tags,
  Palette,
  Calendar,
  Scissors,
  Image,
  Newspaper,
  Landmark,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import Link from "next/link"
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

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    url: "/dashboard/brands",
    icon: Warehouse,
    items: [
      { title: "Brands", url: "/dashboard/brands", icon: Tags },
      { title: "Models", url: "/dashboard/models", icon: Car },
      { title: "Cars", url: "/dashboard/cars", icon: Car },
      { title: "Trims", url: "/dashboard/trims", icon: Scissors },
      { title: "Years", url: "/dashboard/years", icon: Calendar },
      { title: "Colors", url: "/dashboard/colors", icon: Palette },
      { title: "Media", url: "/dashboard/media", icon: Image },
      { title: "Banks", url: "/dashboard/banks", icon: Landmark },
      { title: "Blogs", url: "/dashboard/blogs", icon: Newspaper },
      { title: "Visuals", url: "/dashboard/visuals", icon: Image },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Car className="size-4" />
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">Alromaih</span>
                  <span className="truncate text-xs">Cars Dashboard</span>
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
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
