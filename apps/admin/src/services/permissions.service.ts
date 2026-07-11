import type {
  AssignUserPermissionsInput,
  PermissionSummary,
} from "@repo/shared";
import { unwrapApiData } from "@repo/shared";
import { apiClient } from "@/src/lib/api-client";

export const permissionsService = {
  async listPermissions() {
    return unwrapApiData(
      await apiClient.get<PermissionSummary[]>("/permissions"),
    );
  },

  async getUserPermissions(userId: string) {
    return unwrapApiData(
      await apiClient.get<string[]>(`/users/${userId}/permissions`),
    );
  },

  async replaceUserPermissions(
    userId: string,
    input: AssignUserPermissionsInput,
  ) {
    return unwrapApiData(
      await apiClient.put<string[]>(`/users/${userId}/permissions`, input),
    );
  },
};
