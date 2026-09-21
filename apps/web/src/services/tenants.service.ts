import type { SignupTenantInput, TenantSignupResult } from "@repo/shared";
import { unwrapApiData } from "@repo/shared";
import { apiClient } from "@/src/lib/api-client";

export const tenantsService = {
  async signupTenant(input: SignupTenantInput) {
    return unwrapApiData(
      await apiClient.post<TenantSignupResult>("/tenants/signup", input),
    );
  },
};
