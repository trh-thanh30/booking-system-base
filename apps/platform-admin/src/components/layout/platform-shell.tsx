"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { PanelLeft } from "lucide-react";
import { Button, Skeleton } from "@repo/ui";
import { PlatformSidebar } from "@/src/components/layout/platform-sidebar";
import { useAuth } from "@/src/app/providers";
import { useRouter } from "@/src/i18n/navigation";

export function PlatformShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-dvh bg-slate-50 p-4 dark:bg-[#020817]">
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
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <PlatformSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((value) => !value)}
        />
      </div>
      <div className={collapsed ? "lg:pl-16" : "lg:pl-72"}>
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              aria-label="Toggle sidebar"
              className="hidden lg:inline-flex"
              onClick={() => setCollapsed((value) => !value)}
              size="icon"
              variant="ghost"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-sm font-semibold">Platform Control</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Super admin workspace
              </p>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[88rem] px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
