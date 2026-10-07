import type { LucideIcon } from "lucide-react";

export type SiteNavigationItem = {
  label: string;
  type: string;
  href?: string;
  items?: {
    label: string;
    href: string;
    icon: LucideIcon;
    description?: string;
  }[];
};
