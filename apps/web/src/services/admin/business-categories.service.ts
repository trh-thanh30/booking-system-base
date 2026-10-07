import type { BusinessCategoryOption } from "@repo/shared";
import { unwrapApiData } from "@repo/shared";
import { publicAuthClient } from "@/src/lib/admin/api-client";

export const businessCategoriesService = {
  async listActive() {
    return unwrapApiData(
      await publicAuthClient.get<BusinessCategoryOption[]>(
        "/business-categories",
      ),
    );
  },
};
