import type {
  AcceptInvitationInput,
  AuthSession,
  CreateInvitationInput,
  CurrentAuthUser,
  EmailRequestInput,
  LoginInput,
  RequestVerificationInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "@repo/shared";
import { unwrapApiData } from "@repo/shared";
import { apiClient, publicAuthClient } from "@/src/lib/api-client";
import { refreshAdminAccessToken } from "@/src/lib/api-client";

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
      await apiClient.post<AuthSession>("/auth/admin/login", input),
    );
  },

  async getMe() {
    return unwrapApiData(await apiClient.get<CurrentAuthUser>("/auth/me"));
  },

  async refresh() {
    const access_token = await refreshAdminAccessToken();
    if (!access_token) throw new Error("ADMIN_SESSION_EXPIRED");
    return { access_token };
  },

  async logout() {
    await apiClient.post<void>("/auth/admin/logout");
  },

  async forgotPassword(input: EmailRequestInput) {
    return unwrapApiData(
      await publicAuthClient.post<{ sessionId: string }>(
        "/auth/forgot-password",
        input,
      ),
    );
  },

  async resetPassword(input: ResetPasswordInput) {
    await publicAuthClient.post<void>("/auth/reset-password", input);
  },

  async requestVerification(input: RequestVerificationInput) {
    return unwrapApiData(
      await publicAuthClient.post<{ sessionId: string }>(
        "/auth/request-verification",
        input,
      ),
    );
  },

  async verifyEmail(input: VerifyEmailInput) {
    await publicAuthClient.post<void>("/auth/verify", input);
  },

  async resendVerification(input: ResendVerificationInput) {
    await publicAuthClient.post<void>("/auth/resend-verification", input);
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
