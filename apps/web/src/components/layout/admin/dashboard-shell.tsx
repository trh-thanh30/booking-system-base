"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { AppSidebar } from "@/src/components/layout/admin/app-sidebar";
import { Header } from "@/src/components/layout/admin/header";
import { useAuth } from "@/src/app/providers/admin";
import { useAdminUiStore } from "@/src/app/stores/admin/ui.store";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { getLoginUrl } from "@/src/lib/admin/auth-routing";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui";
import { useTranslations } from "next-intl";
import { getDashboardConfig } from "@/src/config/dashboard.config";

export function DashboardShell({ children }: { children: ReactNode }) {
  const collapsed = useAdminUiStore((state) => state.sidebarCollapsed);
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, can } = useAuth();
  const t = useTranslations("DashboardConfig");
  const tAuth = useTranslations("Auth");
  const route = getDashboardConfig(t)
    .sidebarSections.flatMap((section) => section.items)
    .find(
      (item) =>
        item.href &&
        (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    );
  const hasPermission = !route?.permission || can(route.permission);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(getLoginUrl(pathname + window.location.search));
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div
        role="status"
        aria-busy="true"
        className="min-h-dvh bg-background p-4 text-foreground"
      >
        <div className="mx-auto flex max-w-[88rem] gap-4">
          <Skeleton className="hidden h-[calc(100dvh-2rem)] w-72 lg:block" />
          <div className="flex-1 space-y-4">
            <span className="sr-only">{tAuth("checkingSession")}</span>
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
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden transition-all duration-300 ease-in-out lg:block",
          collapsed ? "w-16" : "w-72",
        )}
      >
        <AppSidebar />
      </div>
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          collapsed ? "lg:pl-16" : "lg:pl-72",
        )}
      >
        <Header />
        <main className="mx-auto w-full min-w-0 max-w-[88rem] px-4 py-8 lg:px-8">
          {hasPermission ? (
            children
          ) : (
            <p
              role="alert"
              className="rounded-md border border-border bg-card p-6"
            >
              {tAuth("accessDenied")}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
