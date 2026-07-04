import { z } from "zod";
import { USER_ROLES, USER_STATUSES } from "../constants/index.ts";

export const createUserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  full_name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  password: z.string().optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  is_verified: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
