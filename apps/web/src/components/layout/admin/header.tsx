"use client";

import { PanelLeft, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { BusinessSwitcher } from "@/src/components/common/admin/business-switcher";
import { CommandMenu } from "@/src/components/common/admin/command-menu";
import { MobileSidebar } from "@/src/components/layout/admin/mobile-sidebar";
import { UserMenu } from "@/src/components/common/admin/user-menu";
import { useAdminUiStore } from "@/src/app/stores/admin/ui.store";

export function Header() {
  const tCommon = useTranslations("Common");
  const setCommandOpen = useAdminUiStore((state) => state.setCommandOpen);
  const toggleSidebar = useAdminUiStore((state) => state.toggleSidebar);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 shadow-xs backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
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
        <Button
          className="hidden min-w-0 max-w-lg flex-1 justify-start bg-background text-muted-foreground lg:inline-flex"
          onClick={() => setCommandOpen(true)}
          variant="secondary"
        >
          <Search aria-hidden="true" className="size-4" />
          {tCommon("search")}
          <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 text-caption font-medium text-muted-foreground xl:inline-block">
            Ctrl K
          </kbd>
        </Button>
      </div>
      <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
        <BusinessSwitcher />
        <Button
          aria-label={tCommon("searchPages")}
          className="lg:hidden"
          onClick={() => setCommandOpen(true)}
          size="icon"
          variant="ghost"
        >
          <Search className="size-5" />
        </Button>
        <UserMenu />
      </div>
      <CommandMenu />
    </header>
  );
}
