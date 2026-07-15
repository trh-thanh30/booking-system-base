import {
  Activity,
  Building2,
  LayoutDashboard,
  Shield,
  Users,
} from "lucide-react";
import type { PlatformConfig } from "./platform.types";

type Translate = (key: string) => string;

export function getPlatformConfig(t: Translate): PlatformConfig {
  return {
    brand: {
      name: "Platform Admin",
      description: t("brandDescription"),
      logo: Shield,
    },
    sidebarSections: [
      {
        label: t("sections.platform"),
        items: [
          {
            title: t("items.dashboard"),
            href: "/dashboard",
            icon: LayoutDashboard,
          },
          {
            title: t("items.tenants"),
            href: "/tenants",
            icon: Building2,
          },
          {
            title: t("items.users"),
            href: "/users",
            icon: Users,
          },
        ],
      },
      {
        label: t("sections.operations"),
        items: [
          {
            title: t("items.system"),
            href: "/system",
            icon: Activity,
          },
        ],
      },
    ],
  };
}
