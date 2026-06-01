import {
  Activity,
  CalendarCheck,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

export const navItems = [
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
    title: "System",
    href: "/system",
    icon: Activity,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
] as const;
