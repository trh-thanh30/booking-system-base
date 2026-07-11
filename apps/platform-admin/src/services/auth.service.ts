import type { AuthSession, CurrentAuthUser, LoginInput } from "@repo/shared";
import { unwrapApiData } from "@repo/shared";
import { apiClient } from "@/src/lib/api-client";

export const authService = {
  async loginPlatform(input: LoginInput) {
    return unwrapApiData(
      await apiClient.post<AuthSession>("/auth/login-platform", input),
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
};
