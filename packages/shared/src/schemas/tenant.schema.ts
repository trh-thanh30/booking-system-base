import { z } from "zod";
import { TENANT_DOMAIN_TYPES, TENANT_STATUSES } from "../constants/index.ts";

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
  status: z.enum(TENANT_STATUSES).optional(),
  timezone: z.string().min(1).default("Asia/Ho_Chi_Minh"),
  locale: z.string().min(1).default("vi"),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export type CreateTenantInput = z.input<typeof createTenantSchema>;

export const createTenantDomainSchema = z.object({
  tenant_id: z.string().uuid(),
  host: z.string().min(1).max(255),
  type: z.enum(TENANT_DOMAIN_TYPES),
  is_primary: z.boolean().optional(),
});

export type CreateTenantDomainInput = z.input<typeof createTenantDomainSchema>;
