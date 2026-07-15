"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { AppSidebar } from "@/src/components/layout/app-sidebar";
import { Header } from "@/src/components/layout/header";
import { useAuth } from "@/src/app/providers";
import { useAdminUiStore } from "@/src/app/stores/ui.store";
import { useRouter } from "@/src/i18n/navigation";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui";

export function DashboardShell({ children }: { children: ReactNode }) {
  const collapsed = useAdminUiStore((state) => state.sidebarCollapsed);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-dvh bg-slate-50 p-4 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
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
    <div className="min-h-dvh bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
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
        <main className="mx-auto w-full max-w-[88rem] px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
