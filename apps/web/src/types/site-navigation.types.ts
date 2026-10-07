import type { LucideIcon } from "lucide-react";

export type SiteNavigationItem = {
  id: string;
  label: string;
  type: string;
  href?: string;
  items?: {
    id: string;
    label: string;
    href: string;
    icon: LucideIcon;
    description?: string;
  }[];
};
