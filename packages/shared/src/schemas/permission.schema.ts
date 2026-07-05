import { z } from "zod";
import { PERMISSION_KEYS } from "../constants/index.ts";

export const permissionKeySchema = z.enum(
  PERMISSION_KEYS as [string, ...string[]],
);

export const assignUserPermissionsSchema = z.object({
  permission_keys: z.array(permissionKeySchema),
});
