import { z } from "zod";
import {
  NOTIFICATION_DELIVERY_STATUSES,
  NOTIFICATION_READ_STATUSES,
  NOTIFICATION_SCOPES,
  NOTIFICATION_SOURCES,
  USER_ROLES,
} from "../constants/index.ts";
import { paginationQuerySchema } from "./pagination.schema.ts";

const notificationBaseSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.string().min(1),
  scope: z.enum(NOTIFICATION_SCOPES),
  target_roles: z.array(z.enum(USER_ROLES)).optional(),
  target_user_ids: z.array(z.string().uuid()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createAdminNotificationSchema = notificationBaseSchema.extend({
  scheduled_at: z.string().datetime().optional(),
});

export type CreateAdminNotificationInput = z.infer<
  typeof createAdminNotificationSchema
>;

export const createSystemNotificationSchema = notificationBaseSchema;

export type CreateSystemNotificationInput = z.infer<
  typeof createSystemNotificationSchema
>;

export const listAdminNotificationsSchema = paginationQuerySchema.extend({
  q: z.string().optional(),
  type: z.string().optional(),
  source: z.enum(NOTIFICATION_SOURCES).optional(),
  scope: z.enum(NOTIFICATION_SCOPES).optional(),
  delivery_status: z.enum(NOTIFICATION_DELIVERY_STATUSES).optional(),
});

export type ListAdminNotificationsQuery = z.input<
  typeof listAdminNotificationsSchema
>;

export const listNotificationsSchema = paginationQuerySchema.extend({
  q: z.string().optional(),
  type: z.string().optional(),
  status: z.enum(NOTIFICATION_READ_STATUSES).optional(),
});

export type ListNotificationsQuery = z.input<typeof listNotificationsSchema>;
