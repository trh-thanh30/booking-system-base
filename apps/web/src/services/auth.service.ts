import type { RegisterOwnerInput, RegisterOwnerResult } from "@repo/shared";
import { unwrapApiData } from "@repo/shared";
import { apiClient } from "@/src/lib/api-client";
import type { RegisterOwnerAccountInput } from "@repo/shared";

export const authService = {
  async registerOwnerAccount(input: RegisterOwnerAccountInput) {
    return unwrapApiData(
      await apiClient.post<{ sessionId: string }>(
        "/auth/admin/onboarding/register",
        input,
      ),
    );
  },
  async registerOwner(input: RegisterOwnerInput) {
    return unwrapApiData(
      await apiClient.post<RegisterOwnerResult>("/auth/register", input),
    );
  },
};
