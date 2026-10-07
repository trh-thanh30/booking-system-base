import { z } from "zod";
import { BOOKING_TEMPLATE_IDS } from "../constants/business-settings.constants.ts";

const localTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const dayOfWeek = z.number().int().min(0).max(6);

export const businessWorkingDaySchema = z.discriminatedUnion("is_closed", [
  z.strictObject({
    day_of_week: dayOfWeek,
    is_closed: z.literal(true),
    opens_at: z.null(),
    closes_at: z.null(),
  }),
  z
    .strictObject({
      day_of_week: dayOfWeek,
      is_closed: z.literal(false),
      opens_at: localTime,
      closes_at: localTime,
    })
    .refine((day) => day.closes_at > day.opens_at, {
      message: "Closing time must be after opening time",
      path: ["closes_at"],
    }),
]);

export const businessWorkingDaysSchema = z
  .array(businessWorkingDaySchema)
  .length(7)
  .refine((days) => new Set(days.map((day) => day.day_of_week)).size === 7, {
    message: "Each day of the week must appear exactly once",
  })
  .refine((days) => days.some((day) => !day.is_closed), {
    message: "At least one day must be open",
  });

export const updateBusinessWorkingHoursSchema = z.strictObject({
  days: businessWorkingDaysSchema,
});

export const selectBookingTemplateSchema = z.strictObject({
  template_id: z.enum(BOOKING_TEMPLATE_IDS),
});

export type UpdateBusinessWorkingHoursInput = z.infer<
  typeof updateBusinessWorkingHoursSchema
>;
export type SelectBookingTemplateInput = z.infer<
  typeof selectBookingTemplateSchema
>;
