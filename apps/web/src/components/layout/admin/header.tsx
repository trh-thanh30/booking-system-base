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
import { Link } from "@/src/i18n/navigation";

export function Header() {
  const t = useTranslations("DashboardConfig");
  const tCommon = useTranslations("Common");
  const dashboardConfig = getDashboardConfig(t);
  const { can } = useAuth();
  const setCommandOpen = useAdminUiStore((state) => state.setCommandOpen);
  const toggleSidebar = useAdminUiStore((state) => state.toggleSidebar);
  const topNavigation = dashboardConfig.topNavigation.filter(
    (item) => !item.permission || can(item.permission),
  );

  return (
    <header className="sticky top-0 z-40 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileSidebar />
        <Button
          aria-label={tCommon("toggleSidebar")}
          className="hidden lg:inline-flex"
          onClick={toggleSidebar}
          size="icon"
          variant="ghost"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="hidden h-6 w-px bg-muted dark:bg-muted lg:block" />
        <nav className="hidden items-center gap-6 lg:flex">
          {topNavigation.map((item) => (
            <Link
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground first:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground dark:first:text-muted-foreground"
              href={item.href}
              key={item.href}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
        <BusinessSwitcher />
        <Button
          className="hidden w-64 justify-start text-muted-foreground md:inline-flex"
          onClick={() => setCommandOpen(true)}
          variant="secondary"
        >
          <Search className="h-4 w-4" />
          {tCommon("search")}
          <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground dark:border-border md:inline-block">
            Ctrl K
          </kbd>
        </Button>
        <Button
          aria-label={tCommon("searchPages")}
          className="md:hidden"
          onClick={() => setCommandOpen(true)}
          size="icon"
          variant="ghost"
        >
          <Search className="h-5 w-5" />
        </Button>
        <LanguageSwitcher />
        <ThemeToggle />
        <Button
          aria-label={tCommon("openSettings")}
          size="icon"
          variant="ghost"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <UserMenu />
      </div>
      <CommandMenu />
    </header>
  );
}
