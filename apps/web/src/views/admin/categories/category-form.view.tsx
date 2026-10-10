"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { FolderOpen, ShieldX } from "lucide-react";
import { useToast } from "@repo/hooks";
import { PERMISSIONS } from "@repo/shared";
import { Button, Skeleton } from "@repo/ui";
import { useAuth } from "@/src/app/providers/admin/auth-provider";
import { useAdminUiStore } from "@/src/app/stores/admin/ui.store";
import { AdminFormPage } from "@/src/components/common/admin/admin-form-page";
import { StatePanel } from "@/src/components/common/state-panel";
import { Link, useRouter } from "@/src/i18n/navigation";
import { categoriesService } from "@/src/services/admin/categories.service";
import { CategoryForm } from "./components/category-form";
import type {
  CategoryAssetDraft,
  CategoryFormInput,
  CategoryFormMode,
} from "./types/category-form.types";
import { categoryErrorMessage } from "./utils/category-error.utils";

type CategoryFormViewProps = {
  categoryId?: string;
  mode: CategoryFormMode;
};

export function CategoryFormView({ categoryId, mode }: CategoryFormViewProps) {
  const t = useTranslations("CategoryManagement");
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const activeBusinessId = useAdminUiStore((state) => state.activeBusinessId);
  const canRead = can(PERMISSIONS.CATEGORY.READ);
  const canSubmit = can(
    mode === "create"
      ? PERMISSIONS.CATEGORY.CREATE
      : PERMISSIONS.CATEGORY.UPDATE,
  );
  const listQueryKey = ["categories", activeBusinessId];
  const categoriesQuery = useQuery({
    enabled: canRead && canSubmit && Boolean(activeBusinessId),
    queryFn: categoriesService.listCategories,
    queryKey: listQueryKey,
  });
  const categoryQuery = useQuery({
    enabled:
      mode === "edit" &&
      canRead &&
      canSubmit &&
      Boolean(activeBusinessId && categoryId),
    queryFn: () => categoriesService.getCategory(categoryId!),
    queryKey: ["category", activeBusinessId, categoryId],
  });

  const mutation = useMutation({
    mutationFn: async ({
      assets,
      input,
    }: {
      assets: CategoryAssetDraft[];
      input: CategoryFormInput;
    }) => {
      const assetIds = await Promise.all(
        assets.map(async (asset) => {
          if (asset.assetId) return asset.assetId;
          if (!asset.file) throw new Error("Category asset file is missing");
          const uploaded = await categoriesService.uploadCategoryAsset(
            asset.file,
          );
          Object.assign(asset, { assetId: uploaded.id });
          return uploaded.id;
        }),
      );
      const categoryInput = { ...input, asset_ids: assetIds };
      if (mode === "create") {
        return categoriesService.createCategory(categoryInput);
      }
      return categoriesService.updateCategory(categoryId!, {
        asset_ids: categoryInput.asset_ids,
        description: categoryInput.description,
        metadata: categoryInput.metadata,
        name: categoryInput.name,
        parent_id: categoryInput.parent_id,
        slug: categoryInput.slug,
        sort_order: categoryInput.sort_order,
        status: categoryInput.status,
      });
    },
    onError: (error) => toast.error(categoryErrorMessage(error, t)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listQueryKey });
      toast.success(
        mode === "create" ? t("toasts.created") : t("toasts.updated"),
      );
      router.replace("/admin/categories");
    },
  });

  const title = mode === "create" ? t("form.createTitle") : t("form.editTitle");
  const description =
    mode === "create" ? t("form.createDescription") : t("form.editDescription");

  return (
    <AdminFormPage
      backHref="/admin/categories"
      backLabel={t("actions.backToList")}
      description={description}
      eyebrow={t("eyebrow")}
      title={title}
    >
      {!canRead || !canSubmit ? (
        <StatePanel
          description={t("permission.formDescription")}
          icon={ShieldX}
          title={t("permission.formTitle")}
        />
      ) : categoriesQuery.isLoading ||
        (mode === "edit" && categoryQuery.isLoading) ? (
        <div className="space-y-6" aria-label={t("states.formLoading")}>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton className="h-48 w-full rounded-xl" key={index} />
          ))}
        </div>
      ) : categoriesQuery.isError ||
        (mode === "edit" && categoryQuery.isError) ? (
        <StatePanel
          action={
            <Button asChild variant="outline">
              <Link href="/admin/categories">{t("actions.backToList")}</Link>
            </Button>
          }
          description={t("states.formErrorDescription")}
          icon={FolderOpen}
          title={t("states.formErrorTitle")}
        />
      ) : mode === "edit" &&
        (!categoryQuery.data || categoryQuery.data.status === "ARCHIVED") ? (
        <StatePanel
          action={
            <Button asChild variant="outline">
              <Link href="/admin/categories">{t("actions.backToList")}</Link>
            </Button>
          }
          description={t("states.notFoundDescription")}
          icon={FolderOpen}
          title={t("states.notFoundTitle")}
        />
      ) : (
        <CategoryForm
          categories={categoriesQuery.data?.data ?? []}
          category={mode === "edit" ? (categoryQuery.data ?? null) : null}
          mode={mode}
          onSubmit={(input, assets) => mutation.mutate({ assets, input })}
          pending={mutation.isPending}
        />
      )}
    </AdminFormPage>
  );
}
