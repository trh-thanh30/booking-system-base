import type { RegisterOwnerInput, RegisterOwnerResult } from "@repo/shared";
import { unwrapApiData } from "@repo/shared";
import { apiClient } from "@/src/lib/api-client";

export const authService = {
  async registerOwner(input: RegisterOwnerInput) {
    return unwrapApiData(
      await apiClient.post<RegisterOwnerResult>("/auth/register", input),
    );
  },
};
