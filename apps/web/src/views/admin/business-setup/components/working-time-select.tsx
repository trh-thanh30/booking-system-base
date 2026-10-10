"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import {
  TIME_HOURS,
  TIME_MINUTES,
} from "../constants/business-setup.constants";

export function WorkingTimeSelect({
  id,
  label,
  value,
  disabled,
  invalid,
  describedBy,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  invalid: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("BusinessSetup.hours");
  const [hour = "09", minute = "00"] = value.split(":");
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <Select
        value={hour}
        disabled={disabled}
        onValueChange={(next) => onChange(`${next}:${minute}`)}
      >
        <SelectTrigger
          id={id}
          aria-label={`${label}: ${t("hour")}`}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className="min-h-11 min-w-0 flex-1 px-2 text-body tabular-nums"
        >
          <SelectValue>{hour}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TIME_HOURS.map((item) => (
            <SelectItem key={item} value={item} className="min-h-11 text-body">
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span aria-hidden="true" className="text-body text-muted-foreground">
        :
      </span>
      <Select
        value={minute}
        disabled={disabled}
        onValueChange={(next) => onChange(`${hour}:${next}`)}
      >
        <SelectTrigger
          id={`${id}-minute`}
          aria-label={`${label}: ${t("minute")}`}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className="min-h-11 min-w-0 flex-1 px-2 text-body tabular-nums"
        >
          <SelectValue>{minute}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TIME_MINUTES.map((item) => (
            <SelectItem key={item} value={item} className="min-h-11 text-body">
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
