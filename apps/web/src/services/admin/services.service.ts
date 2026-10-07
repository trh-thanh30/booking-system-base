import { createBusinessApiClient } from "@/src/lib/admin/api-client";
import { unwrapApiData } from "@repo/shared";
import type { CreateServiceInput, ServiceDetail } from "@repo/shared";

export function createServicesService(businessId: string) {
  const client = createBusinessApiClient(businessId);
  return {
    async createService(input: CreateServiceInput) {
      return unwrapApiData(
        await client.post<ServiceDetail>("/services", input),
      );
    },
  };
}
