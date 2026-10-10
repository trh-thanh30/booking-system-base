import type { BusinessWorkingDay, BusinessSetupStep } from "@repo/shared";

export const SETUP_STEPS: readonly BusinessSetupStep[] = [
  "WORKING_HOURS",
  "FIRST_SERVICE",
  "BOOKING_TEMPLATE",
];
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
export const SERVICE_CURRENCIES = ["VND", "USD", "EUR"] as const;
export const TIME_HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0"),
);
export const TIME_MINUTES = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0"),
);

export function initialWorkingDays(): BusinessWorkingDay[] {
  return WEEKDAY_ORDER.map((day_of_week) =>
    day_of_week === 0 || day_of_week === 6
      ? { day_of_week, is_closed: true, opens_at: null, closes_at: null }
      : {
          day_of_week,
          is_closed: false,
          opens_at: "09:00",
          closes_at: "18:00",
        },
  );
}
