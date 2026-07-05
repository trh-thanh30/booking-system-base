import { z } from "zod";
import { permissionKeySchema } from "./permission.schema.ts";
import { USER_ROLES } from "../constants/index.ts";

const passwordSchema = z.string().min(6);
const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z.string().min(1),
    email: z.string().email(),
    password: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ["confirmPassword"],
    message: "Confirm password does not match",
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const emailRequestSchema = z.object({
  email: z.string().email(),
});

export type EmailRequestInput = z.infer<typeof emailRequestSchema>;

export type ForgotPasswordInput = EmailRequestInput;
export type RequestVerificationInput = EmailRequestInput;

export const verifyEmailSchema = z.object({
  sessionId: z.string().min(1),
  code: z.string().min(6),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resetPasswordSchema = z
  .object({
    sessionId: z.string().min(1),
    code: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ["confirmPassword"],
    message: "Confirm password does not match",
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ["confirmPassword"],
    message: "Confirm password does not match",
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const updateProfileSchema = z.object({
  username: z.string().min(2).max(80).optional(),
  email: z.string().email().max(160).optional(),
  full_name: optionalTextSchema,
  phone: optionalTextSchema,
  avatar_url: z.string().nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const createInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(USER_ROLES).optional(),
  permission_keys: z.array(permissionKeySchema).optional(),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export const acceptInvitationSchema = z
  .object({
    token: z.string().min(1),
    username: z.string().min(1),
    full_name: z.string().max(120).optional(),
    password: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ["confirmPassword"],
    message: "Confirm password does not match",
  });

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
