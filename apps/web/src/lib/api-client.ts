import { createApiClient } from "@repo/shared";

export const apiClient = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1",
  withCredentials: true,
});
