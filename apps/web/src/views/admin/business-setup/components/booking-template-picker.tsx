"use client";

import { useState, type ReactNode, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button, Label, cn } from "@repo/ui";
import type { BookingTemplateCatalog, BookingTemplateId } from "@repo/shared";
import { TemplatePreview } from "./template-preview";
import { Link } from "@/src/i18n/navigation";
import { ExternalLink } from "lucide-react";

export function BookingTemplatePicker({
  catalog,
  busy,
  onSave,
  footerActions,
}: {
  catalog: BookingTemplateCatalog;
  busy: boolean;
  footerActions?: ReactNode;
  onSave: (id: BookingTemplateId) => Promise<void>;
}) {
  const t = useTranslations("BusinessSetup");
  const locale = useLocale() === "en" ? "en" : "vi";
  const [selected, setSelected] = useState<BookingTemplateId | null>(
    catalog.templates.some(
      (template) => template.id === catalog.selected_template_id,
    )
      ? catalog.selected_template_id
      : null,
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selected && !busy) await onSave(selected);
  }
  return (
    <form onSubmit={submit} className="space-y-6">
      <p className="text-body text-muted-foreground">
        {t("template.previewHint")}
      </p>
      <fieldset
        disabled={busy}
        className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <legend className="sr-only">{t("steps.BOOKING_TEMPLATE")}</legend>
        {catalog.templates.map((template) => (
          <div
            key={template.id}
            className="group/template relative flex min-w-0 flex-col"
          >
            <input
              id={`template-${template.id}`}
              type="radio"
              name="booking-template"
              value={template.id}
              checked={selected === template.id}
              onChange={() => setSelected(template.id)}
              className="peer sr-only"
              required
              aria-describedby={`template-description-${template.id}`}
            />
            <Label
              htmlFor={`template-${template.id}`}
              className={cn(
                "flex flex-1 cursor-pointer flex-col gap-3 rounded-xl border-2 border-border p-3 transition-colors hover:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                selected === template.id && "border-primary bg-primary/5",
              )}
            >
              <TemplatePreview />
              <span className="flex items-center justify-between gap-2 text-body font-semibold">
                {template.name[locale]}
                <span
                  className={cn(
                    "size-4 shrink-0 rounded-full border border-border",
                    selected === template.id && "border-primary bg-primary",
                  )}
                  aria-hidden="true"
                />
              </span>
              <span
                id={`template-description-${template.id}`}
                className="text-label font-normal leading-relaxed text-muted-foreground"
              >
                {template.description[locale]}
              </span>
            </Label>
            {template.id === "nail-salon-v2" ? (
              <div className="pointer-events-none absolute inset-x-3.5 top-3.5 flex aspect-video items-center justify-center rounded-lg bg-foreground/45 opacity-0 transition-opacity duration-200 group-hover/template:opacity-100 group-focus-within/template:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100">
                <Link
                  href="/nail-salon-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("template.openDemo")}
                  className="pointer-events-none inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-background px-4 text-label font-semibold text-foreground shadow-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group-hover/template:pointer-events-auto group-focus-within/template:pointer-events-auto [@media(hover:none)]:pointer-events-auto"
                >
                  {t("template.preview")}
                  <ExternalLink className="size-4" aria-hidden="true" />
                </Link>
              </div>
            ) : null}
          </div>
        ))}
      </fieldset>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        {footerActions}
        <Button
          type="submit"
          disabled={!selected || busy}
          className="min-h-11 w-full text-body sm:w-auto"
        >
          {t(busy ? "saving" : "finish")}
        </Button>
      </div>
    </form>
  );
}
