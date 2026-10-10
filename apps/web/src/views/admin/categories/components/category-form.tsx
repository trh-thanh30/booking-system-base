"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  createCategorySchema,
  updateCategorySchema,
  type CategorySummary,
} from "@repo/shared";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@repo/ui";
import {
  AdminFormActions,
  AdminFormSection,
} from "@/src/components/common/admin/admin-form-page";
import { FormField } from "@/src/components/common/form-field";
import { Link } from "@/src/i18n/navigation";
import type {
  CategoryAssetDraft,
  CategoryFormProps,
} from "../types/category-form.types";
import { CategoryAssetsField } from "./category-assets-field";

type CategoryFormValues = {
  description: string;
  name: string;
  parent_id: string | null;
  slug: string;
  status: "ACTIVE" | "INACTIVE";
};

const emptyValues: CategoryFormValues = {
  description: "",
  name: "",
  parent_id: null,
  slug: "",
  status: "ACTIVE",
};

function categoryAssets(
  category: CategorySummary | null,
): CategoryAssetDraft[] {
  return (
    category?.assets.map((asset) => ({
      assetId: asset.id,
      key: asset.id,
      name: asset.original_name,
      previewUrl: asset.url,
    })) ?? []
  );
}

export function CategoryForm({
  categories,
  category,
  mode,
  onSubmit,
  pending,
}: CategoryFormProps) {
  const t = useTranslations("CategoryManagement");
  const [assets, setAssets] = useState<CategoryAssetDraft[]>(() =>
    categoryAssets(category),
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<CategoryFormValues>({ defaultValues: emptyValues });

  useEffect(() => {
    reset(
      category
        ? {
            description: category.description ?? "",
            name: category.name,
            parent_id: category.parent_id,
            slug: category.slug,
            status: category.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
          }
        : emptyValues,
    );
    setAssets(categoryAssets(category));
  }, [category, reset]);

  const parentLocked = Boolean(
    category &&
    categories.some((candidate) => candidate.parent_id === category.id),
  );
  const parentOptions = categories.filter(
    (candidate) =>
      candidate.parent_id === null &&
      candidate.status !== "ARCHIVED" &&
      candidate.id !== category?.id,
  );

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit((values) => {
        const candidate = {
          description: values.description.trim() || null,
          name: values.name,
          parent_id: values.parent_id,
          slug: values.slug.trim() || undefined,
          status: values.status,
          type: "SERVICE" as const,
        };
        const parsed =
          mode === "create"
            ? createCategorySchema.safeParse(candidate)
            : updateCategorySchema.safeParse(candidate);

        if (!parsed.success) {
          for (const issue of parsed.error.issues) {
            const field = issue.path[0];
            if (
              field === "name" ||
              field === "slug" ||
              field === "description" ||
              field === "status" ||
              field === "parent_id"
            ) {
              setError(field, { message: t("form.invalidField") });
            }
          }
          return;
        }

        onSubmit(candidate, assets);
      })}
    >
      <AdminFormSection
        description={t("form.detailsDescription")}
        title={t("form.detailsTitle")}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            error={errors.name?.message}
            htmlFor="category-name"
            label={t("form.name")}
            required
          >
            <Input
              disabled={pending}
              id="category-name"
              maxLength={120}
              placeholder={t("form.namePlaceholder")}
              {...register("name")}
            />
          </FormField>
          <FormField
            description={t("form.slugHint")}
            error={errors.slug?.message}
            htmlFor="category-slug"
            label={t("form.slug")}
          >
            <Input
              disabled={pending}
              id="category-slug"
              maxLength={140}
              placeholder={t("form.slugPlaceholder")}
              {...register("slug")}
            />
          </FormField>
          <div className="md:col-span-2">
            <FormField
              error={errors.description?.message}
              htmlFor="category-description"
              label={t("form.description")}
            >
              <Textarea
                disabled={pending}
                id="category-description"
                maxLength={1000}
                placeholder={t("form.descriptionPlaceholder")}
                rows={5}
                {...register("description")}
              />
            </FormField>
          </div>
          <FormField htmlFor="category-status" label={t("form.status")}>
            <Select
              disabled={pending}
              onValueChange={(value: "ACTIVE" | "INACTIVE") =>
                setValue("status", value, { shouldDirty: true })
              }
              value={watch("status")}
            >
              <SelectTrigger id="category-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">{t("status.active")}</SelectItem>
                <SelectItem value="INACTIVE">{t("status.inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </AdminFormSection>

      <AdminFormSection
        description={t("form.hierarchyDescription")}
        title={t("form.hierarchyTitle")}
      >
        <FormField
          description={
            parentLocked ? t("form.parentLockedHint") : t("form.parentHint")
          }
          error={errors.parent_id?.message}
          htmlFor="category-parent"
          label={t("form.parent")}
        >
          <Select
            disabled={pending || parentLocked}
            onValueChange={(value) =>
              setValue("parent_id", value === "ROOT" ? null : value, {
                shouldDirty: true,
              })
            }
            value={watch("parent_id") ?? "ROOT"}
          >
            <SelectTrigger id="category-parent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ROOT">{t("form.noParent")}</SelectItem>
              {parentOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </AdminFormSection>

      <AdminFormSection
        description={t("form.assetsDescription")}
        title={t("form.assetsTitle")}
      >
        <CategoryAssetsField
          assets={assets}
          disabled={pending}
          onChange={setAssets}
        />
      </AdminFormSection>

      <AdminFormActions>
        <Button asChild className="min-h-11" variant="outline">
          <Link
            aria-disabled={pending}
            className={pending ? "pointer-events-none opacity-50" : undefined}
            href="/admin/categories"
            tabIndex={pending ? -1 : undefined}
          >
            {t("actions.cancel")}
          </Link>
        </Button>
        <Button className="min-h-11" disabled={pending} type="submit">
          {pending
            ? t("actions.saving")
            : mode === "edit"
              ? t("actions.save")
              : t("actions.create")}
        </Button>
      </AdminFormActions>
    </form>
  );
}
