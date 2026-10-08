"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { PanelLeft } from "lucide-react";
import { Button, Skeleton } from "@repo/ui";
import { PlatformSidebar } from "@/src/components/layout/platform-sidebar";
import { PlatformMobileSidebar } from "@/src/components/layout/platform-mobile-sidebar";
import { ThemeToggle } from "@/src/components/common";
import { useAuth } from "@/src/app/providers";
import { useRouter } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@repo/ui/lib/utils";

export function PlatformShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations("Platform");
  const tCommon = useTranslations("Common");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div
        aria-busy="true"
        className="min-h-dvh bg-background p-4 text-foreground"
        role="status"
      >
        <div className="mx-auto flex max-w-[88rem] gap-4">
          <Skeleton className="hidden h-[calc(100dvh-2rem)] w-72 lg:block" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        href="#platform-main-content"
      >
        {tCommon("skipToContent")}
      </a>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-slow ease-[var(--ease-standard)] lg:block",
          collapsed ? "w-16" : "w-72",
        )}
      >
        <PlatformSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((value) => !value)}
        />
      </div>
      <div
        className={cn(
          "transition-[padding] duration-slow ease-[var(--ease-standard)]",
          collapsed ? "lg:pl-16" : "lg:pl-72",
        )}
      >
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-4 shadow-xs backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <PlatformMobileSidebar />
            <Button
              aria-label={tCommon("toggleSidebar")}
              className="hidden lg:inline-flex"
              onClick={() => setCollapsed((value) => !value)}
              size="icon"
              variant="ghost"
            >
              <PanelLeft className="size-4" />
            </Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {t("workspaceTitle")}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {t("brandDescription")}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>
        <main
          className="mx-auto w-full min-w-0 max-w-[88rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
          id="platform-main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
