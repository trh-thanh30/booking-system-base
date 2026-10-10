"use client";

import { useState, type ReactNode, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button, Label, Switch } from "@repo/ui";
import { WorkingTimeSelect } from "./working-time-select";
import { updateBusinessWorkingHoursSchema } from "@repo/shared";
import type {
  BusinessWorkingDay,
  UpdateBusinessWorkingHoursInput,
} from "@repo/shared";
import {
  WEEKDAY_ORDER,
  initialWorkingDays,
} from "../constants/business-setup.constants";

export function WorkingHoursForm({
  initialDays,
  timezone,
  busy,
  onSave,
  footerActions,
}: {
  initialDays: BusinessWorkingDay[] | null;
  timezone: string;
  busy: boolean;
  footerActions?: ReactNode;
  onSave: (input: UpdateBusinessWorkingHoursInput) => Promise<void>;
}) {
  const t = useTranslations("BusinessSetup");
  const [days, setDays] = useState(initialDays ?? initialWorkingDays());
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [formError, setFormError] = useState("");
  function change(day: BusinessWorkingDay) {
    setDays((previous) =>
      previous.map((item) =>
        item.day_of_week === day.day_of_week ? day : item,
      ),
    );
    setErrors((previous) => ({ ...previous, [day.day_of_week]: "" }));
    setFormError("");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const parsed = updateBusinessWorkingHoursSchema.safeParse({ days });
    if (!parsed.success) {
      const nextErrors: Record<number, string> = {};
      for (const issue of parsed.error.issues) {
        const index = issue.path[1];
        if (typeof index === "number" && days[index])
          nextErrors[days[index]!.day_of_week] = t("hours.invalidInterval");
      }
      setErrors(nextErrors);
      setFormError(
        Object.keys(nextErrors).length ? "" : t("hours.openDayRequired"),
      );
      const invalidDay = Object.keys(nextErrors)[0];
      if (invalidDay)
        document.getElementById(`hours-open-${invalidDay}`)?.focus();
      return;
    }
    await onSave(parsed.data);
  }
  return (
    <form onSubmit={submit} className="space-y-6">
      <p className="text-body text-muted-foreground">
        {t("hours.timezone", { timezone })}
      </p>
      <fieldset disabled={busy} className="space-y-3">
        <legend className="sr-only">{t("steps.WORKING_HOURS")}</legend>
        {WEEKDAY_ORDER.map((number) => {
          const day = days.find((item) => item.day_of_week === number)!;
          return (
            <div key={number} className="rounded-xl border border-border p-4">
              <div className="grid items-center gap-4 sm:grid-cols-[10rem_1fr]">
                <div className="flex min-h-11 items-center gap-3">
                  <Switch
                    id={`hours-day-${number}`}
                    checked={!day.is_closed}
                    onCheckedChange={(open) =>
                      change(
                        open
                          ? {
                              day_of_week: number,
                              is_closed: false,
                              opens_at: "09:00",
                              closes_at: "18:00",
                            }
                          : {
                              day_of_week: number,
                              is_closed: true,
                              opens_at: null,
                              closes_at: null,
                            },
                      )
                    }
                  />
                  <Label
                    htmlFor={`hours-day-${number}`}
                    className="cursor-pointer text-body font-semibold"
                  >
                    {t(`days.${number}`)}
                  </Label>
                </div>
                {day.is_closed ? (
                  <p className="text-body text-muted-foreground">
                    {t("hours.closed")}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`hours-open-${number}`}>
                        {t("hours.opensAt")}
                      </Label>
                      <WorkingTimeSelect
                        id={`hours-open-${number}`}
                        label={`${t(`days.${number}`)} ${t("hours.opensAt")}`}
                        value={day.opens_at}
                        disabled={busy}
                        invalid={Boolean(errors[number])}
                        describedBy={
                          errors[number] ? `hours-error-${number}` : undefined
                        }
                        onChange={(value) =>
                          change({ ...day, opens_at: value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`hours-close-${number}`}>
                        {t("hours.closesAt")}
                      </Label>
                      <WorkingTimeSelect
                        id={`hours-close-${number}`}
                        label={`${t(`days.${number}`)} ${t("hours.closesAt")}`}
                        value={day.closes_at}
                        disabled={busy}
                        invalid={Boolean(errors[number])}
                        describedBy={
                          errors[number] ? `hours-error-${number}` : undefined
                        }
                        onChange={(value) =>
                          change({ ...day, closes_at: value })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
              {errors[number] ? (
                <p
                  id={`hours-error-${number}`}
                  role="alert"
                  className="mt-2 text-label text-destructive"
                >
                  {errors[number]}
                </p>
              ) : null}
            </div>
          );
        })}
      </fieldset>
      {formError ? (
        <p role="alert" className="text-body text-destructive">
          {formError}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        {footerActions}
        <Button
          type="submit"
          disabled={busy}
          className="min-h-11 w-full text-body sm:w-auto"
        >
          {t(busy ? "saving" : "saveContinue")}
        </Button>
      </div>
    </form>
  );
}
