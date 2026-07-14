import type { USER_ROLES, USER_STATUSES } from "../constants/index.ts";
import type { BusinessSummary, TenantSummary } from "./tenant.types.ts";

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];

export type UserSummary = {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthUser = UserSummary;

export type CurrentAuthUser = AuthUser & {
  tenant_id: string | null;
  tenant: TenantSummary | null;
  businesses: BusinessSummary[];
  permissions: string[];
};

export type AuthSession = {
  access_token: string;
  user: CurrentAuthUser;
};
