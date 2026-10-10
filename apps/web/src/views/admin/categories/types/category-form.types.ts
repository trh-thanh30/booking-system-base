import type { CategorySummary, CreateCategoryInput } from "@repo/shared";

export type CategoryFormMode = "create" | "edit";

export type CategoryFormInput = CreateCategoryInput;

export type CategoryAssetDraft = {
  assetId?: string;
  file?: File;
  key: string;
  name: string;
  previewUrl: string;
};

export type CategoryFormProps = {
  categories: CategorySummary[];
  category: CategorySummary | null;
  mode: CategoryFormMode;
  onSubmit: (input: CategoryFormInput, assets: CategoryAssetDraft[]) => void;
  pending: boolean;
};
