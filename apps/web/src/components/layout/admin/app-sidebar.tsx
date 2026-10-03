"use client";

import { ChevronRight, PanelLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, Badge, Button } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { useAdminUiStore } from "@/src/app/stores/admin/ui.store";
import { useAuth } from "@/src/app/providers/admin";
import { getDashboardConfig } from "@/src/config/dashboard.config";
import type { NavigationItem } from "@/src/config/dashboard.types";
import { Link, usePathname } from "@/src/i18n/navigation";

function NavGroup({
  items,
  label,
  pathname,
  collapsed,
}: {
  items: NavigationItem[];
  label: string;
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <div className="space-y-1">
      {!collapsed ? (
        <p className="px-3 pb-1 pt-4 text-xs font-medium text-muted-foreground dark:text-muted-foreground animate-in fade-in duration-200">
          {label}
        </p>
      ) : (
        <div className="h-4" />
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href
          ? pathname === item.href || pathname.startsWith(`${item.href}/`)
          : false;
        const className = cn(
          "flex h-9 items-center rounded-md text-sm font-medium transition-all duration-200",
          collapsed
            ? "justify-center w-9 h-9 mx-auto px-0"
            : "w-full gap-3 px-3",
          active
            ? "bg-muted text-foreground dark:bg-muted dark:text-muted-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-muted-foreground",
        );
        const content = (
          <>
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 truncate text-left">
                  {item.title}
                </span>
                {item.badge ? (
                  <Badge variant="secondary">{item.badge}</Badge>
                ) : null}
                {!item.href && !item.badge ? (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                ) : null}
              </>
            )}
          </>
        );

        if (item.href) {
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={className}
              href={item.href}
              key={item.title}
              title={collapsed ? item.title : undefined}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            className={className}
            key={item.title}
            type="button"
            title={collapsed ? item.title : undefined}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

export function AppSidebar({
  collapsedOverride,
  showCollapseButton = true,
}: {
  collapsedOverride?: boolean;
  showCollapseButton?: boolean;
}) {
  const t = useTranslations("DashboardConfig");
  const tCommon = useTranslations("Common");
  const dashboardConfig = getDashboardConfig(t);
  const { can, user: currentUser } = useAuth();
  const pathname = usePathname();
  const BrandLogo = dashboardConfig.brand.logo;
  const user = currentUser
    ? {
        avatarFallback:
          currentUser.full_name
            ?.split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || currentUser.username.slice(0, 2).toUpperCase(),
        email: currentUser.email,
        name: currentUser.full_name ?? currentUser.username,
      }
    : dashboardConfig.userMenu;
  const storedCollapsed = useAdminUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAdminUiStore((state) => state.toggleSidebar);
  const collapsed = collapsedOverride ?? storedCollapsed;
  const sidebarSections = dashboardConfig.sidebarSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.permission || can(item.permission),
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-background transition-all duration-300 ease-in-out dark:border-border dark:bg-background",
        collapsed ? "w-16" : "w-72",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-3 px-5",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background text-sm font-semibold text-foreground dark:bg-background dark:text-foreground">
          <BrandLogo className="h-4 w-4" />
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1 animate-in fade-in duration-200">
              <p className="truncate text-sm font-semibold text-foreground dark:text-muted-foreground">
                {dashboardConfig.brand.name}
              </p>
              <p className="truncate text-xs text-muted-foreground dark:text-muted-foreground">
                {dashboardConfig.brand.description}
              </p>
            </div>
            {showCollapseButton ? (
              <Button
                aria-label={tCommon("collapseSidebar")}
                onClick={toggleSidebar}
                size="icon"
                variant="ghost"
                className="h-8 w-8"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            ) : null}
          </>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {sidebarSections.map((section) => (
          <NavGroup
            items={section.items}
            key={section.label}
            label={section.label}
            pathname={pathname}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="border-t border-border p-4 dark:border-border">
        <div
          className={cn(
            "flex items-center rounded-md transition-all duration-200 hover:bg-muted dark:hover:bg-muted cursor-pointer",
            collapsed
              ? "justify-center p-0 h-9 w-9 mx-auto"
              : "gap-3 px-2 py-2",
          )}
          title={collapsed ? `${user.name} (${user.email})` : undefined}
        >
          <Avatar className={cn(collapsed ? "h-8 w-8" : "h-10 w-10")}>
            <AvatarFallback>{user.avatarFallback}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 animate-in fade-in duration-200">
                <p className="truncate text-sm font-medium text-foreground dark:text-muted-foreground">
                  {user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground dark:text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
