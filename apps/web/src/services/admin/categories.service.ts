import type {
  AssetWithUrl,
  CategorySummary,
  CreateCategoryInput,
  PaginatedApiResponse,
  UpdateCategoryInput,
} from "@repo/shared";
import { unwrapApiData } from "@repo/shared";
import { apiClient } from "@/src/lib/admin/api-client";

type CategoryDescriptionAssetKind = "document" | "image" | "video";

const descriptionAssetTypes = {
  document: "DOCUMENT",
  image: "IMAGE",
  video: "VIDEO",
} as const satisfies Record<CategoryDescriptionAssetKind, string>;

export const categoriesService = {
  listCategories(): Promise<PaginatedApiResponse<CategorySummary>> {
    return apiClient.paginated<CategorySummary>({
      method: "GET",
      url: "/categories",
      params: {
        include_archived: true,
        limit: 100,
        page: 1,
        type: "SERVICE",
      },
    });
  },

  async getCategory(id: string) {
    return unwrapApiData(
      await apiClient.get<CategorySummary>(`/categories/${id}`),
    );
  },

  async createCategory(input: CreateCategoryInput) {
    return unwrapApiData(
      await apiClient.post<CategorySummary>("/categories", input),
    );
  },

  async updateCategory(id: string, input: UpdateCategoryInput) {
    return unwrapApiData(
      await apiClient.patch<CategorySummary>(`/categories/${id}`, input),
    );
  },

  async archiveCategory(id: string) {
    return unwrapApiData(
      await apiClient.delete<CategorySummary>(`/categories/${id}`),
    );
  },

  async reorderCategories(categoryIds: string[]) {
    return unwrapApiData(
      await apiClient.post<CategorySummary[]>("/categories/reorder", {
        category_ids: categoryIds,
      }),
    );
  },

  async uploadCategoryAsset(file: File) {
    const data = new FormData();
    data.append("file", file);
    return unwrapApiData(
      await apiClient.post<AssetWithUrl>("/assets/upload", data, {
        params: {
          accessType: "PUBLIC",
          folder: "categories",
          type: "IMAGE",
        },
      }),
    );
  },

  async uploadCategoryDescriptionAsset(
    file: File,
    kind: CategoryDescriptionAssetKind,
    onProgress: (progress: number) => void,
  ) {
    const data = new FormData();
    data.append("file", file);
    return unwrapApiData(
      await apiClient.post<AssetWithUrl>("/assets/upload", data, {
        onUploadProgress: ({ loaded, total }) => {
          if (!total) return;
          onProgress(Math.min(100, Math.round((loaded / total) * 100)));
        },
        params: {
          accessType: "PUBLIC",
          folder: "category-descriptions",
          type: descriptionAssetTypes[kind],
        },
      }),
    );
  },
};
