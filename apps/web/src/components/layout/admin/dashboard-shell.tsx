"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { AppSidebar } from "@/src/components/layout/admin/app-sidebar";
import { Header } from "@/src/components/layout/admin/header";
import { useAuth } from "@/src/app/providers/admin";
import { useAdminUiStore } from "@/src/app/stores/admin/ui.store";
import { usePathname } from "@/src/i18n/navigation";
import { getLoginUrl } from "@/src/lib/admin/auth-routing";
import {
  buildAdminBaseUrl,
  buildTenantAdminUrl,
} from "@/src/lib/admin/admin-workspace-url";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui";
import { useLocale, useTranslations } from "next-intl";
import { getDashboardConfig } from "@/src/config/dashboard.config";
import { StatePanel } from "@/src/components/common/state-panel";
import { ShieldAlert } from "lucide-react";

export function DashboardShell({ children }: { children: ReactNode }) {
  const collapsed = useAdminUiStore((state) => state.sidebarCollapsed);
  const pathname = usePathname();
  const locale = useLocale();
  const { isAuthenticated, isLoading, can, user } = useAuth();
  const t = useTranslations("DashboardConfig");
  const tAuth = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const route = getDashboardConfig(t)
    .sidebarSections.flatMap((section) => section.items)
    .find(
      (item) =>
        item.href &&
        (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    );
  const hasPermission = !route?.permission || can(route.permission);
  const returnTo =
    typeof window === "undefined"
      ? pathname
      : pathname + window.location.search;
  const workspaceUrl = user?.tenant?.slug
    ? buildTenantAdminUrl({
        locale,
        returnTo,
        tenantSlug: user.tenant.slug,
      })
    : null;
  const isCanonicalRedirectPending = Boolean(
    workspaceUrl &&
    typeof window !== "undefined" &&
    window.location.origin !== new URL(workspaceUrl).origin,
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.replace(
        buildAdminBaseUrl({
          locale,
          pathname: getLoginUrl(pathname + window.location.search),
        }),
      );
      return;
    }
    if (!isLoading && workspaceUrl && isCanonicalRedirectPending) {
      window.location.replace(workspaceUrl);
    }
  }, [
    isAuthenticated,
    isCanonicalRedirectPending,
    isLoading,
    locale,
    pathname,
    workspaceUrl,
  ]);

  if (isLoading || !isAuthenticated || isCanonicalRedirectPending) {
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
      <a
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        href="#admin-main-content"
      >
        {tCommon("skipToContent")}
      </a>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-slow ease-[var(--ease-standard)] lg:block",
          collapsed ? "w-16" : "w-72",
        )}
      >
        <AppSidebar />
      </div>
      <div
        className={cn(
          "transition-[padding] duration-slow ease-[var(--ease-standard)]",
          collapsed ? "lg:pl-16" : "lg:pl-72",
        )}
      >
        <Header />
        <main
          className="mx-auto w-full min-w-0 max-w-[88rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
          id="admin-main-content"
          tabIndex={-1}
        >
          {hasPermission ? (
            children
          ) : (
            <div role="alert">
              <StatePanel
                description={tAuth("accessDeniedDescription")}
                icon={ShieldAlert}
                title={tAuth("accessDenied")}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
