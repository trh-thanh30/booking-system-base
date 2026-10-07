"use client";

import { useState, type ReactNode, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button, Label, cn } from "@repo/ui";
import type { BookingTemplateCatalog, BookingTemplateId } from "@repo/shared";
import { TemplatePreview } from "./template-preview";

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
    catalog.selected_template_id,
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
      <fieldset disabled={busy} className="grid gap-4 md:grid-cols-3">
        <legend className="sr-only">{t("steps.BOOKING_TEMPLATE")}</legend>
        {catalog.templates.map((template) => (
          <div key={template.id} className="relative">
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
                "flex h-full cursor-pointer flex-col gap-3 rounded-xl border-2 border-border p-3 transition-colors hover:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                selected === template.id && "border-primary bg-primary/5",
              )}
            >
              <TemplatePreview id={template.id} />
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
