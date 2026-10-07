"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";

export function AuthenticationLayout({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description: string;
}) {
  const t = useTranslations("AuthJourney");
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <a
        href="#auth-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:p-3"
      >
        {t("skip")}
      </a>
      <SiteHeader />
      <section
        id="auth-content"
        className="mx-auto w-full max-w-xl px-4 pb-12 pt-5 sm:pt-10"
      >
        <div className="mb-6 px-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-md sm:p-7">
          {children}
        </div>
        <p className="mt-7 text-center text-sm leading-6 text-muted-foreground">
          {t("footer")}
        </p>
      </section>
    </main>
  );
}
