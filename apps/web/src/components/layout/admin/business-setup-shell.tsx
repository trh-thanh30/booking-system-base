"use client";

import { useEffect, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/src/app/providers/admin";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { getLoginUrl } from "@/src/lib/admin/auth-routing";
import { SiteHeader } from "../site-header";
import { SetupLoadingSkeleton } from "@/src/views/admin/business-setup/components/setup-loading-skeleton";

export function BusinessSetupShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Auth");
  const journey = useTranslations("AuthJourney");

  useEffect(() => {
    if (!isLoading && !isAuthenticated)
      router.replace(getLoginUrl(pathname + window.location.search));
  }, [isAuthenticated, isLoading, pathname, router]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#setup-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:p-3"
      >
        {journey("skip")}
      </a>
      <SiteHeader />
      <main
        id="setup-content"
        className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12"
      >
        {isLoading || !isAuthenticated ? (
          <SetupLoadingSkeleton label={t("checkingSession")} />
        ) : (
          children
        )}
      </main>
    </div>
  );
}
