import { dashboardConfig } from "@/src/config/dashboard.config";

export const navItems = dashboardConfig.sidebarSections
  .flatMap((section) => section.items)
  .filter((item) => !!item.href)
  .map((item) => ({
    title: item.title,
    href: item.href!,
    icon: item.icon,
  }));
