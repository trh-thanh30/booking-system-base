import { createApiClient } from "@repo/shared";
import { apiConfig } from "@/src/config/api.config";

export const apiClient = createApiClient({
  baseURL: apiConfig.baseUrl,
  headers: {
    "x-auth-context": "client",
  },
  withCredentials: true,
});
