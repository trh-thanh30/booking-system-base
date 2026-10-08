"use client";

import { PanelLeft, Search, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { BusinessSwitcher } from "@/src/components/common/admin/business-switcher";
import { CommandMenu } from "@/src/components/common/admin/command-menu";
import { MobileSidebar } from "@/src/components/layout/admin/mobile-sidebar";
import { ThemeToggle } from "@/src/components/common/admin/theme-toggle";
import { UserMenu } from "@/src/components/common/admin/user-menu";
import { useAuth } from "@/src/app/providers/admin";
import { useAdminUiStore } from "@/src/app/stores/admin/ui.store";
import { getDashboardConfig } from "@/src/config/dashboard.config";
import { LanguageSwitcher } from "@/src/components/common/language-switcher";
import { Link, usePathname } from "@/src/i18n/navigation";
import { cn } from "@repo/ui/lib/utils";

export function Header() {
  const t = useTranslations("DashboardConfig");
  const tCommon = useTranslations("Common");
  const dashboardConfig = getDashboardConfig(t);
  const { can } = useAuth();
  const pathname = usePathname();
  const setCommandOpen = useAdminUiStore((state) => state.setCommandOpen);
  const toggleSidebar = useAdminUiStore((state) => state.toggleSidebar);
  const topNavigation = dashboardConfig.topNavigation.filter(
    (item) => !item.permission || can(item.permission),
  );

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 shadow-xs backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <MobileSidebar />
        <Button
          aria-label={tCommon("toggleSidebar")}
          className="hidden lg:inline-flex"
          onClick={toggleSidebar}
          size="icon"
          variant="ghost"
        >
          <PanelLeft className="size-4" />
        </Button>
        <div className="hidden h-6 w-px bg-border lg:block" />
        <nav
          aria-label={tCommon("topNavigation")}
          className="hidden items-center gap-1 lg:flex"
        >
          {topNavigation.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted-hover hover:text-foreground",
                )}
                href={item.href}
                key={item.href}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
        <BusinessSwitcher />
        <Button
          className="hidden w-52 justify-start bg-background text-muted-foreground xl:inline-flex xl:w-64"
          onClick={() => setCommandOpen(true)}
          variant="secondary"
        >
          <Search className="size-4" />
          {tCommon("search")}
          <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 text-caption font-medium text-muted-foreground md:inline-block">
            Ctrl K
          </kbd>
        </Button>
        <Button
          aria-label={tCommon("searchPages")}
          className="xl:hidden"
          onClick={() => setCommandOpen(true)}
          size="icon"
          variant="ghost"
        >
          <Search className="size-5" />
        </Button>
        <LanguageSwitcher />
        <ThemeToggle />
        <Button asChild size="icon" variant="ghost">
          <Link aria-label={tCommon("openSettings")} href="/admin/settings">
            <Settings className="size-4" />
          </Link>
        </Button>
        <UserMenu />
      </div>
      <CommandMenu />
    </header>
  );
}
