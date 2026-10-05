import { z } from "zod";

export const registerOwnerAccountSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(160),
    password: z.string().min(8).max(128),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Confirm password does not match",
  });
export type RegisterOwnerAccountInput = z.input<
  typeof registerOwnerAccountSchema
>;

export const businessProfileSchema = z.object({
  address: z.object({
    country: z.string().trim().min(2).max(80),
    state: z.string().trim().max(100).optional(),
    city: z.string().trim().min(1).max(100),
    postal_code: z.string().trim().max(20).optional(),
    street: z.string().trim().min(1).max(255),
    location: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
      .nullable(),
  }),
  opening_hours: z
    .array(
      z
        .object({
          day: z.number().int().min(0).max(6),
          enabled: z.boolean(),
          opens: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
          closes: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        })
        .refine((value) => !value.enabled || value.opens < value.closes, {
          path: ["closes"],
          message: "Closing time must follow opening time",
        }),
    )
    .length(7)
    .refine(
      (days) => new Set(days.map((day) => day.day)).size === 7,
      "Each weekday must occur once",
    )
    .refine(
      (days) => days.some((day) => day.enabled),
      "Choose at least one working day",
    ),
});
export type BusinessOnboardingProfile = z.infer<typeof businessProfileSchema>;

export const completeOwnerBusinessSchema = z.object({
  business_category_id: z.string().uuid(),
  name: z.string().trim().min(1).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  timezone: z.string().refine((zone) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: zone });
      return true;
    } catch {
      return false;
    }
  }, "Invalid timezone"),
  locale: z.enum(["vi", "en"]),
  owner: z.object({
    username: z.string().trim().min(1).max(80),
    phone: z
      .string()
      .trim()
      .max(40)
      .transform((value) => value || undefined)
      .optional(),
  }),
  business_profile: businessProfileSchema,
});
export type CompleteOwnerBusinessInput = z.input<
  typeof completeOwnerBusinessSchema
>;
