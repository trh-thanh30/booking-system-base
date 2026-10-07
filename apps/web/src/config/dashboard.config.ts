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
  Store,
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
            href: "/admin/dashboard",
            icon: LayoutDashboard,
          },
          {
            title: t("items.bookings"),
            href: "/admin/bookings",
            icon: CalendarCheck,
            permission: PERMISSIONS.BOOKING.READ,
          },
          {
            title: t("items.users"),
            href: "/admin/users",
            icon: Users,
            permission: PERMISSIONS.USER.READ,
          },
          {
            title: t("items.businesses"),
            href: "/admin/businesses",
            icon: Store,
            permission: PERMISSIONS.TENANT.READ,
          },
          {
            title: t("items.chats"),
            badge: t("comingSoon"),
            disabled: true,
            icon: MessageSquare,
          },
          {
            title: t("items.securedByAuth"),
            badge: t("comingSoon"),
            disabled: true,
            icon: ShieldCheck,
          },
        ],
      },
      {
        label: t("sections.pages"),
        items: [
          {
            title: t("items.auth"),
            badge: t("comingSoon"),
            disabled: true,
            icon: ShieldCheck,
          },
          {
            title: t("items.errors"),
            badge: t("comingSoon"),
            disabled: true,
            icon: TriangleAlert,
          },
        ],
      },
      {
        label: t("sections.other"),
        items: [
          {
            title: t("items.system"),
            href: "/admin/system",
            icon: Activity,
            permission: PERMISSIONS.TENANT.READ,
          },
          {
            title: t("items.settings"),
            href: "/admin/settings",
            icon: Settings,
            permission: PERMISSIONS.TENANT.UPDATE,
          },
          {
            title: t("items.helpCenter"),
            badge: t("comingSoon"),
            disabled: true,
            icon: CircleHelp,
          },
        ],
      },
    ],
    topNavigation: [
      {
        title: t("items.overview"),
        href: "/admin/dashboard",
      },
      {
        title: t("items.customers"),
        href: "/admin/users",
        permission: PERMISSIONS.USER.READ,
      },
      {
        title: t("items.businesses"),
        href: "/admin/businesses",
        permission: PERMISSIONS.TENANT.READ,
      },
      {
        title: t("items.bookings"),
        href: "/admin/bookings",
        permission: PERMISSIONS.BOOKING.READ,
      },
      {
        title: t("items.settings"),
        href: "/admin/settings",
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
          href: "/admin/settings", // or a profile subpage
          icon: User,
        },
        {
          label: t("items.settings"),
          href: "/admin/settings",
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
