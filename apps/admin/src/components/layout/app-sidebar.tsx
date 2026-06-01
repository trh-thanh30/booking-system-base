"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  CircleHelp,
  ClipboardList,
  MessageSquare,
  PanelLeft,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, Badge, Button } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { navItems } from "@/src/components/layout/nav-items";

type NavEntry = {
  badge?: string;
  href?: string;
  icon: LucideIcon;
  title: string;
};

const generalItems: NavEntry[] = [
  ...navItems.filter(
    (item) => item.href !== "/system" && item.href !== "/settings",
  ),
  {
    badge: "3",
    icon: MessageSquare,
    title: "Chats",
  },
  {
    icon: ShieldCheck,
    title: "Secured by Auth",
  },
];

const pageItems: NavEntry[] = [
  {
    icon: ShieldCheck,
    title: "Auth",
  },
  {
    icon: TriangleAlert,
    title: "Errors",
  },
];

const otherItems: NavEntry[] = [
  ...navItems.filter(
    (item) => item.href === "/system" || item.href === "/settings",
  ),
  {
    icon: CircleHelp,
    title: "Help Center",
  },
];

function NavGroup({
  items,
  label,
  pathname,
}: {
  items: NavEntry[];
  label: string;
  pathname: string;
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 pt-4 text-xs font-medium text-slate-500 dark:text-slate-500">
        {label}
      </p>
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href
          ? pathname === item.href || pathname.startsWith(`${item.href}/`)
          : false;
        const className = cn(
          "flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
          active
            ? "bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-slate-50"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50",
        );
        const content = (
          <>
            <Icon className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate text-left">
              {item.title}
            </span>
            {item.badge ? (
              <Badge variant="secondary">{item.badge}</Badge>
            ) : null}
            {!item.href && !item.badge ? (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            ) : null}
          </>
        );

        if (item.href) {
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={className}
              href={item.href}
              key={item.title}
            >
              {content}
            </Link>
          );
        }

        return (
          <button className={className} key={item.title} type="button">
            {content}
          </button>
        );
      })}
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white dark:bg-slate-50 dark:text-slate-950">
          <ClipboardList className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">
            Booking Admin
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            Next + Turborepo
          </p>
        </div>
        <Button aria-label="Collapse sidebar" size="icon" variant="ghost">
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <NavGroup items={generalItems} label="General" pathname={pathname} />
        <NavGroup items={pageItems} label="Pages" pathname={pathname} />
        <NavGroup items={otherItems} label="Other" pathname={pathname} />
      </nav>

      <div className="p-4">
        <div className="flex items-center gap-3 rounded-md px-1 py-2">
          <Avatar>
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-950 dark:text-slate-50">
              Admin
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              admin@example.com
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}
