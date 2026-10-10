"use client";

import { useRef, useState, type ReactNode, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { createServiceSchema } from "@repo/shared";
import { Button } from "@repo/ui";
import { useToast } from "@repo/hooks";
import { CheckCircle2, Plus } from "lucide-react";
import type {
  ServiceDraft,
  SetupServiceInput,
} from "../types/business-setup.types";
import { ServiceDraftRow } from "./service-draft-row";

export function FirstServiceForm({
  existing,
  busy,
  onSave,
  footerActions,
}: {
  existing: boolean;
  busy: boolean;
  footerActions?: ReactNode;
  onSave: (
    items: SetupServiceInput[] | null,
    onCreated: (key: number) => void,
  ) => Promise<void>;
}) {
  const t = useTranslations("BusinessSetup");
  const { toast } = useToast();
  const nextKey = useRef(2);
  const formRef = useRef<HTMLFormElement>(null);
  const [rows, setRows] = useState<ServiceDraft[]>(() =>
    existing
      ? []
      : [
          {
            key: 1,
            name: "",
            duration: "30",
            price: "0",
            currency: "VND",
            saved: false,
          },
        ],
  );
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>(
    {},
  );
  function addRow() {
    const key = nextKey.current++;
    setRows((current) => [
      ...current,
      {
        key,
        name: "",
        duration: "30",
        price: "0",
        currency: current.at(-1)?.currency ?? "VND",
        saved: false,
      },
    ]);
    requestAnimationFrame(() =>
      document.getElementById(`service-name-${key}`)?.focus(),
    );
  }
  const markCreated = (key: number) =>
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, saved: true } : row)),
    );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const items: SetupServiceInput[] = [];
    const nextErrors: Record<number, Record<string, string>> = {};
    for (const row of rows.filter((item) => !item.saved)) {
      const parsed = createServiceSchema.safeParse({
        name: row.name,
        duration_minutes: Number(row.duration),
        price_amount: row.price === "" ? Number.NaN : Number(row.price),
        currency: row.currency,
      });
      if (parsed.success) items.push({ key: row.key, input: parsed.data });
      else {
        nextErrors[row.key] = {};
        for (const issue of parsed.error.issues) {
          const field = String(issue.path[0]);
          nextErrors[row.key]![field] = t(`service.errors.${field}`);
        }
      }
    }
    setErrors(nextErrors);
    const invalidRow = rows.find((row) => nextErrors[row.key]);
    if (invalidRow) {
      const field = Object.keys(nextErrors[invalidRow.key]!)[0];
      formRef.current
        ?.querySelector<HTMLInputElement>(
          `[data-service-key="${invalidRow.key}"] [name="${field}"]`,
        )
        ?.focus();
      return;
    }
    await onSave(items, markCreated);
  }
  const existingNotice = existing ? (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted p-5">
      <CheckCircle2
        className="mt-1 size-5 shrink-0 text-primary"
        aria-hidden="true"
      />
      <div>
        <p className="text-body font-semibold">{t("service.existingTitle")}</p>
        <p className="mt-1 text-body text-muted-foreground">
          {t("service.existingDescription")}
        </p>
      </div>
    </div>
  ) : null;
  const addButton = (
    <Button
      data-add-service
      type="button"
      variant="ghost"
      disabled={busy}
      onClick={addRow}
      className="min-h-11 gap-2 text-body text-primary"
    >
      <Plus className="size-4" aria-hidden="true" />
      {t("service.add")}
    </Button>
  );
  const footer = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
      {footerActions}
      <Button
        type={rows.length ? "submit" : "button"}
        disabled={busy}
        onClick={rows.length ? undefined : () => void onSave(null, markCreated)}
        className="min-h-11 w-full text-body sm:w-auto"
      >
        {t(
          busy ? "saving" : rows.length ? "service.createContinue" : "continue",
        )}
      </Button>
    </div>
  );
  if (!rows.length)
    return (
      <div className="space-y-6">
        {existingNotice}
        {addButton}
        {footer}
      </div>
    );
  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-6">
      {existingNotice}
      <div className="space-y-6">
        {rows.map((row, index) => (
          <ServiceDraftRow
            key={row.key}
            row={row}
            number={index + 1}
            busy={busy}
            errors={errors[row.key] ?? {}}
            removable={!row.saved && (existing || rows.length > 1)}
            onChange={(patch) =>
              setRows((current) =>
                current.map((item) =>
                  item.key === row.key ? { ...item, ...patch } : item,
                ),
              )
            }
            onRemove={() => {
              setRows((current) =>
                current.filter((item) => item.key !== row.key),
              );
              toast.success(t("service.removed"));
              requestAnimationFrame(() =>
                formRef.current
                  ?.querySelector<HTMLButtonElement>("[data-add-service]")
                  ?.focus(),
              );
            }}
          />
        ))}
      </div>
      {addButton}
      {footer}
    </form>
  );
}
