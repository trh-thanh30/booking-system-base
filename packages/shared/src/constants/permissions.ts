export const PERMISSION_ACTIONS = [
  "read",
  "create",
  "update",
  "delete",
  "manage",
] as const;

export const PERMISSIONS = {
  USER: {
    READ: "user:read",
    CREATE: "user:create",
    UPDATE: "user:update",
    DELETE: "user:delete",
    MANAGE: "user:manage",
  },
  PERMISSION: {
    READ: "permission:read",
    MANAGE: "permission:manage",
  },
  BOOKING: {
    READ: "booking:read",
    CREATE: "booking:create",
    UPDATE: "booking:update",
    DELETE: "booking:delete",
    MANAGE: "booking:manage",
  },
  SERVICE: {
    READ: "service:read",
    CREATE: "service:create",
    UPDATE: "service:update",
    DELETE: "service:delete",
    MANAGE: "service:manage",
  },
  STAFF: {
    READ: "staff:read",
    INVITE: "staff:invite",
    UPDATE: "staff:update",
    DELETE: "staff:delete",
    MANAGE: "staff:manage",
  },
  TENANT: {
    READ: "tenant:read",
    UPDATE: "tenant:update",
    MANAGE: "tenant:manage",
  },
} as const;

export const PERMISSION_KEYS = Object.values(PERMISSIONS).flatMap((group) =>
  Object.values(group),
);
