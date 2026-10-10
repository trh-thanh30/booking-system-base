"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, ExternalLink, LayoutDashboard } from "lucide-react";
import { Button, Card, CardContent } from "@repo/ui";
import { BOOKING_TEMPLATES, type BookingTemplateId } from "@repo/shared";
import { Link } from "@/src/i18n/navigation";
import { TemplatePreview } from "./components/template-preview";

export function BusinessSetupCompleteView({
  businessName,
  templateId,
}: {
  businessName: string;
  templateId: BookingTemplateId | null;
}) {
  const t = useTranslations("BusinessSetup.completion");
  const locale = useLocale() === "en" ? "en" : "vi";
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, []);
  const template = BOOKING_TEMPLATES.find((item) => item.id === templateId);
  return (
    <section
      data-setup-complete
      className="mx-auto flex w-full min-w-0 max-w-2xl flex-col items-center gap-6 py-4 text-center sm:gap-8 sm:py-8"
    >
      <div className="space-y-4">
        <CheckCircle2
          aria-hidden="true"
          className="mx-auto size-14 text-success-600"
        />
        <h1
          ref={heading}
          tabIndex={-1}
          className="text-heading-1 font-bold tracking-tight focus:outline-none"
        >
          {t("title")}
        </h1>
        <p className="text-body text-muted-foreground">{t("description")}</p>
      </div>
      <Card className="w-full min-w-0 max-w-lg">
        <CardContent className="space-y-5 p-5 sm:p-8">
          <h2 className="break-words text-heading-2 font-semibold">
            {businessName || t("businessFallback")}
          </h2>
          {template ? (
            <div className="space-y-3 text-left">
              <TemplatePreview />
              <p className="text-label font-medium">
                {t("selectedTemplate", { name: template.name[locale] })}
              </p>
            </div>
          ) : null}
          <p className="text-body text-muted-foreground">{t("demoNotice")}</p>
          {templateId === "nail-salon-v2" ? (
            <Button
              asChild
              variant="outline"
              className="h-auto min-h-11 w-full whitespace-normal px-3 py-2 text-body"
            >
              <Link
                href="/nail-salon-v2"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("viewDemo")}
              >
                <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
                <span className="min-w-0">{t("viewDemoLabel")}</span>
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
      <div className="flex w-full justify-center">
        <Button asChild className="min-h-11 text-body">
          <Link href="/admin/dashboard">
            <LayoutDashboard aria-hidden="true" className="size-4" />
            {t("dashboard")}
          </Link>
        </Button>
      </div>
    </section>
  );
}
