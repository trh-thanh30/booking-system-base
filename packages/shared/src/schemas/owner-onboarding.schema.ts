import { z } from "zod";
import { globalAddressSchema } from "./location.schema.ts";
import { optionalInternationalPhoneSchema } from "./phone.schema.ts";

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
  address: globalAddressSchema,
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
    phone: optionalInternationalPhoneSchema,
  }),
  business_profile: businessProfileSchema,
});
export type CompleteOwnerBusinessInput = z.input<
  typeof completeOwnerBusinessSchema
>;
