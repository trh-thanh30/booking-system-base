import type {
  AcceptInvitationInput,
  AuthSession,
  CreateInvitationInput,
  CurrentAuthUser,
  EmailRequestInput,
  LoginInput,
  ResetPasswordInput,
} from "@repo/shared";
import { unwrapApiData } from "@repo/shared";
import { apiClient } from "@/src/lib/api-client";

export type InvitationPreview = {
  id: string;
  email: string;
  role: string;
  tenant: {
    id: string;
    slug: string;
    name: string;
  };
  accepted_at: string | null;
  expires_at: string;
  is_expired: boolean;
};

export type CreatedInvitation = {
  id: string;
  email: string;
  role: string;
  permission_keys: string[];
  tenant: {
    id: string;
    slug: string;
    name: string;
  };
  token: string;
  expires_at: string;
  created_at: string;
};

export const authService = {
  async loginAdmin(input: LoginInput) {
    return unwrapApiData(
      await apiClient.post<AuthSession>("/auth/login-admin", input),
    );
  },

  async getMe() {
    return unwrapApiData(await apiClient.get<CurrentAuthUser>("/auth/me"));
  },

  async refresh() {
    return unwrapApiData(
      await apiClient.post<{ access_token: string }>("/auth/refresh"),
    );
  },

  async logout() {
    await apiClient.post<void>("/auth/logout");
  },

  async forgotPassword(input: EmailRequestInput) {
    return unwrapApiData(
      await apiClient.post<{ sessionId: string }>(
        "/auth/forgot-password",
        input,
      ),
    );
  },

  async resetPassword(input: ResetPasswordInput) {
    await apiClient.post<void>("/auth/reset-password", input);
  },

  async createInvitation(input: CreateInvitationInput) {
    return unwrapApiData(
      await apiClient.post<CreatedInvitation>("/auth/invitations", input),
    );
  },

  async getInvitation(token: string) {
    return unwrapApiData(
      await apiClient.get<InvitationPreview>(`/auth/invitations/${token}`),
    );
  },

  async acceptInvitation(input: AcceptInvitationInput) {
    return unwrapApiData(
      await apiClient.post<CurrentAuthUser>("/auth/invitations/accept", input),
    );
  },
};
