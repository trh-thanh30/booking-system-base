import type {
  NOTIFICATION_DELIVERY_STATUSES,
  NOTIFICATION_READ_STATUSES,
  NOTIFICATION_SCOPES,
  NOTIFICATION_SOURCES,
  USER_ROLES,
} from "../constants/index.ts";

export type NotificationSource = (typeof NOTIFICATION_SOURCES)[number];
export type NotificationScope = (typeof NOTIFICATION_SCOPES)[number];
export type NotificationDeliveryStatus =
  (typeof NOTIFICATION_DELIVERY_STATUSES)[number];
export type NotificationReadStatus =
  (typeof NOTIFICATION_READ_STATUSES)[number];
export type NotificationTargetRole = (typeof USER_ROLES)[number];
