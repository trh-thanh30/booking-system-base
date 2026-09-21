import type {
  CreateTenantInput,
  TenantContext,
  TenantListItem,
} from "@repo/shared";
import { unwrapApiData } from "@repo/shared";
import { apiClient } from "@/src/lib/api-client";

export const tenantsService = {
  async listTenants() {
    return unwrapApiData(
      await apiClient.get<TenantListItem[]>("/platform/tenants"),
    );
  },

  async createTenant(input: CreateTenantInput) {
    return unwrapApiData(
      await apiClient.post<TenantContext>("/platform/tenants", input),
    );
  },
};
