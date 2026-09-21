import type { BusinessContext, CreateBusinessInput } from "@repo/shared";
import { unwrapApiData } from "@repo/shared";
import { apiClient } from "@/src/lib/api-client";

export const businessesService = {
  async listBusinesses() {
    return unwrapApiData(await apiClient.get<BusinessContext[]>("/businesses"));
  },

  async createBusiness(input: CreateBusinessInput) {
    return unwrapApiData(
      await apiClient.post<BusinessContext>("/businesses", input),
    );
  },
};
