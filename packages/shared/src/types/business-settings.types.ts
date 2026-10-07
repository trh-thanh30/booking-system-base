import type { z } from "zod";
import type { BOOKING_TEMPLATES } from "../constants/business-settings.constants.ts";
import type { businessWorkingDaySchema } from "../schemas/business-settings.schema.ts";

export type BusinessWorkingDay = z.infer<typeof businessWorkingDaySchema>;
export type BookingTemplate = (typeof BOOKING_TEMPLATES)[number];
export type BookingTemplateId = BookingTemplate["id"];
export type BusinessWorkingHours = {
  timezone: string;
  /** Null until a valid seven-day schedule has been saved. */
  days: BusinessWorkingDay[] | null;
};
export type BookingTemplateSelection = {
  selected_template_id: BookingTemplateId | null;
};
export type BookingTemplateCatalog = BookingTemplateSelection & {
  templates: readonly BookingTemplate[];
};
export type BusinessSetupStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SKIPPED"
  | "COMPLETED";
export type BusinessSetupStep =
  | "WORKING_HOURS"
  | "FIRST_SERVICE"
  | "BOOKING_TEMPLATE";
export type BusinessSetupSummary = BookingTemplateSelection & {
  status: BusinessSetupStatus;
  next_step: BusinessSetupStep | null;
  timezone: string;
  steps: {
    working_hours: boolean;
    first_service: boolean;
    booking_template: boolean;
  };
  completed_steps: number;
  total_steps: 3;
};
