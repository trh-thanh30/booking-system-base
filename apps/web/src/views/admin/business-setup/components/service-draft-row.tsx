"use client";

import { useTranslations } from "next-intl";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { Trash2 } from "lucide-react";
import { FormField } from "@/src/components/common/form-field";
import type { ServiceDraft } from "../types/business-setup.types";
import { SERVICE_CURRENCIES } from "../constants/business-setup.constants";
import { ServicePriceInput } from "./service-price-input";

export function ServiceDraftRow({
  row,
  number,
  busy,
  errors,
  removable,
  onChange,
  onRemove,
}: {
  row: ServiceDraft;
  number: number;
  busy: boolean;
  errors: Record<string, string>;
  removable: boolean;
  onChange: (patch: Partial<ServiceDraft>) => void;
  onRemove: () => void;
}) {
  const t = useTranslations("BusinessSetup");
  const id = (field: string) =>
    `service-${field}${row.key === 1 ? "" : `-${row.key}`}`;
  const disabled = busy || row.saved;
  return (
    <fieldset
      disabled={disabled}
      data-service-key={row.key}
      className="grid min-w-0 items-start gap-4 sm:grid-cols-2 lg:grid-cols-[auto_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.75fr)_auto]"
    >
      <legend className="sr-only">{t("service.row", { number })}</legend>
      <span
        className="text-label text-muted-foreground lg:pt-9"
        aria-hidden="true"
      >
        {number}.
      </span>
      <div className="sm:col-span-2 lg:col-span-1">
        <FormField
          htmlFor={id("name")}
          label={t("service.name")}
          required
          error={errors.name}
        >
          <Input
            id={id("name")}
            name="name"
            maxLength={160}
            required
            value={row.name}
            placeholder={t("service.placeholder")}
            onChange={(event) => onChange({ name: event.target.value })}
            aria-invalid={Boolean(errors.name)}
          />
        </FormField>
      </div>
      <FormField
        htmlFor={id("duration")}
        label={t("service.duration")}
        required
        error={errors.duration_minutes}
      >
        <Input
          id={id("duration")}
          name="duration_minutes"
          type="number"
          min={1}
          max={1440}
          step={1}
          required
          value={row.duration}
          onChange={(event) => onChange({ duration: event.target.value })}
          aria-invalid={Boolean(errors.duration_minutes)}
        />
      </FormField>
      <FormField
        htmlFor={id("price")}
        label={t("service.price")}
        required
        error={errors.price_amount}
        description={t("service.freeHint")}
      >
        <ServicePriceInput
          id={id("price")}
          name="price_amount"
          value={row.price}
          onValueChange={(price) => onChange({ price })}
          required
          aria-invalid={Boolean(errors.price_amount)}
        />
      </FormField>
      <FormField htmlFor={id("currency")} label={t("service.currency")}>
        <Select
          value={row.currency}
          onValueChange={(currency) => onChange({ currency })}
          disabled={disabled}
        >
          <SelectTrigger id={id("currency")} className="min-h-11 text-body">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_CURRENCIES.map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <div className="flex items-start lg:pt-7">
        {row.saved ? (
          <span role="status" className="text-label text-muted-foreground">
            {t("service.rowSaved")}
          </span>
        ) : removable ? (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={onRemove}
            aria-label={t("service.remove", { number })}
            className="min-h-11 min-w-11"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </fieldset>
  );
}
