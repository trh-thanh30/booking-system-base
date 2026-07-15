import type {
  CreateUserInput,
  UpdateUserInput,
  UserSummary,
} from "@repo/shared";
import { unwrapApiData } from "@repo/shared";
import { apiClient } from "@/src/lib/api-client";

export const usersService = {
  async listUsers() {
    return unwrapApiData(await apiClient.get<UserSummary[]>("/users"));
  },

  async getUser(id: string) {
    return unwrapApiData(await apiClient.get<UserSummary>(`/users/${id}`));
  },

  async createUser(input: CreateUserInput) {
    return unwrapApiData(await apiClient.post<UserSummary>("/users", input));
  },

  async updateUser(id: string, input: UpdateUserInput) {
    return unwrapApiData(
      await apiClient.put<UserSummary>(`/users/${id}`, input),
    );
  },

  async deleteUser(id: string) {
    return unwrapApiData(await apiClient.delete<UserSummary>(`/users/${id}`));
  },
};
