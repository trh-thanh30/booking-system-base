import type { ComponentType } from "react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

export interface PlatformConfig {
  brand: {
    name: string;
    description: string;
    logo: ComponentType<{ className?: string }>;
  };
  sidebarSections: NavigationSection[];
}
