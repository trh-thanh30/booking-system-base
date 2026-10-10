import { z } from "zod";
import { businessProfileSchema } from "./owner-onboarding.schema.ts";
import { optionalInternationalPhoneSchema } from "./phone.schema.ts";
import {
  BUSINESS_STATUSES,
  TENANT_DOMAIN_TYPES,
  TENANT_STATUSES,
} from "../constants/index.ts";

export const resolveTenantQuerySchema = z.object({
  host: z.string().min(1),
});

export type ResolveTenantQuery = z.input<typeof resolveTenantQuerySchema>;

export const tenantContextParamsSchema = z.object({
  tenantId: z.string().uuid(),
});

export type TenantContextParams = z.input<typeof tenantContextParamsSchema>;

export const createTenantSchema = z.object({
  slug: z.string().min(2).max(80),
  name: z.string().min(1).max(160),
  default_business_name: z.string().min(1).max(160).optional(),
  default_business_slug: z.string().min(2).max(80).optional(),
  status: z.enum(TENANT_STATUSES).optional(),
  timezone: z.string().min(1).default("Asia/Ho_Chi_Minh"),
  locale: z.string().min(1).default("vi"),
  primary_domain: z.string().min(1).max(255).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export type CreateTenantInput = z.input<typeof createTenantSchema>;

export const registerOwnerSchema = createTenantSchema
  .omit({ status: true })
  .extend({
    owner: z.object({
      username: z.string().min(1).max(80),
      email: z.string().email().max(160),
      password: z.string().min(8),
      confirmPassword: z.string().min(1),
      full_name: z.string().max(120).optional(),
      phone: z.string().max(40).optional(),
    }),
  })
  .refine((input) => input.owner.password === input.owner.confirmPassword, {
    path: ["owner", "confirmPassword"],
    message: "Confirm password does not match",
  });

export type RegisterOwnerInput = z.input<typeof registerOwnerSchema>;

export const completeGoogleOwnerOnboardingSchema = createTenantSchema
  .omit({ status: true })
  .extend({
    business_category_id: z.string().uuid(),
    business_profile: businessProfileSchema.optional(),
    owner: z.object({
      username: z.string().min(1).max(80),
      phone: optionalInternationalPhoneSchema,
    }),
  });

export type CompleteGoogleOwnerOnboardingInput = z.input<
  typeof completeGoogleOwnerOnboardingSchema
>;

export const createBusinessSchema = z.object({
  slug: z.string().min(2).max(80),
  name: z.string().min(1).max(160),
  status: z.enum(BUSINESS_STATUSES).optional(),
  timezone: z.string().min(1).optional(),
  locale: z.string().min(1).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export type CreateBusinessInput = z.input<typeof createBusinessSchema>;

export const createTenantDomainSchema = z.object({
  tenant_id: z.string().uuid(),
  host: z.string().min(1).max(255),
  type: z.enum(TENANT_DOMAIN_TYPES),
  is_primary: z.boolean().optional(),
});

export type CreateTenantDomainInput = z.input<typeof createTenantDomainSchema>;
