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
import { PERMISSIONS } from "@repo/shared";
import type { DashboardConfig } from "./dashboard.types";

type Translate = (key: string) => string;

export function getDashboardConfig(t: Translate): DashboardConfig {
  return {
    brand: {
      name: "Business Admin",
      description: t("brandDescription"),
      logo: ClipboardList,
    },
    sidebarSections: [
      {
        label: t("sections.general"),
        items: [
          {
            title: t("items.dashboard"),
            href: "/dashboard",
            icon: LayoutDashboard,
          },
          {
            title: t("items.bookings"),
            href: "/bookings",
            icon: CalendarCheck,
            permission: PERMISSIONS.BOOKING.READ,
          },
          {
            title: t("items.users"),
            href: "/users",
            icon: Users,
            permission: PERMISSIONS.USER.READ,
          },
          {
            title: t("items.chats"),
            badge: "3",
            icon: MessageSquare,
          },
          {
            title: t("items.securedByAuth"),
            icon: ShieldCheck,
          },
        ],
      },
      {
        label: t("sections.pages"),
        items: [
          {
            title: t("items.auth"),
            icon: ShieldCheck,
          },
          {
            title: t("items.errors"),
            icon: TriangleAlert,
          },
        ],
      },
      {
        label: t("sections.other"),
        items: [
          {
            title: t("items.system"),
            href: "/system",
            icon: Activity,
            permission: PERMISSIONS.TENANT.READ,
          },
          {
            title: t("items.settings"),
            href: "/settings",
            icon: Settings,
            permission: PERMISSIONS.TENANT.UPDATE,
          },
          {
            title: t("items.helpCenter"),
            icon: CircleHelp,
          },
        ],
      },
    ],
    topNavigation: [
      {
        title: t("items.overview"),
        href: "/dashboard",
      },
      {
        title: t("items.customers"),
        href: "/users",
        permission: PERMISSIONS.USER.READ,
      },
      {
        title: t("items.bookings"),
        href: "/bookings",
        permission: PERMISSIONS.BOOKING.READ,
      },
      {
        title: t("items.settings"),
        href: "/settings",
        permission: PERMISSIONS.TENANT.UPDATE,
      },
    ],
    userMenu: {
      name: "Admin",
      email: "admin@example.com",
      avatarFallback: "AD",
      menuItems: [
        {
          label: t("items.profile"),
          href: "/settings", // or a profile subpage
          icon: User,
        },
        {
          label: t("items.settings"),
          href: "/settings",
          icon: Settings,
        },
        {
          label: t("items.signOut"),
          href: "/auth/logout", // typical logout URL
          icon: LogOut,
          isDestructive: true,
        },
      ],
    },
  };
}
