import {
  Activity,
  CalendarCheck,
  CircleHelp,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  TriangleAlert,
  User,
  Users,
} from "lucide-react";
import type { DashboardConfig } from "./dashboard.types";

export const dashboardConfig: DashboardConfig = {
  brand: {
    name: "Booking Admin",
    description: "Next + Turborepo",
    logo: ClipboardList,
  },
  sidebarSections: [
    {
      label: "General",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Bookings",
          href: "/bookings",
          icon: CalendarCheck,
        },
        {
          title: "Users",
          href: "/users",
          icon: Users,
        },
        {
          title: "Chats",
          badge: "3",
          icon: MessageSquare,
        },
        {
          title: "Secured by Auth",
          icon: ShieldCheck,
        },
      ],
    },
    {
      label: "Pages",
      items: [
        {
          title: "Auth",
          icon: ShieldCheck,
        },
        {
          title: "Errors",
          icon: TriangleAlert,
        },
      ],
    },
    {
      label: "Other",
      items: [
        {
          title: "System",
          href: "/system",
          icon: Activity,
        },
        {
          title: "Settings",
          href: "/settings",
          icon: Settings,
        },
        {
          title: "Help Center",
          icon: CircleHelp,
        },
      ],
    },
  ],
  topNavigation: [
    {
      title: "Overview",
      href: "/dashboard",
    },
    {
      title: "Customers",
      href: "/users",
    },
    {
      title: "Bookings",
      href: "/bookings",
    },
    {
      title: "Settings",
      href: "/settings",
    },
  ],
  userMenu: {
    name: "Admin",
    email: "admin@example.com",
    avatarFallback: "AD",
    menuItems: [
      {
        label: "Profile",
        href: "/settings", // or a profile subpage
        icon: User,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
      {
        label: "Sign out",
        href: "/auth/logout", // typical logout URL
        icon: LogOut,
        isDestructive: true,
      },
    ],
  },
};
