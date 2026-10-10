import { HttpClientError } from "@repo/shared";

type Translate = (key: string) => string;

export function categoryErrorMessage(error: unknown, t: Translate) {
  if (error instanceof HttpClientError) {
    if (error.code === "CATEGORY_HAS_SERVICES") return t("errors.hasServices");
    if (error.code === "CATEGORY_HAS_CHILDREN") return t("errors.hasChildren");
    if (error.code === "CATEGORY_ASSET_INVALID")
      return t("errors.invalidAsset");
    if (error.status === 409) return t("errors.duplicate");
    if (error.status === 403) return t("errors.forbidden");
    if (error.status === 404) return t("errors.notFound");
  }
  return t("errors.generic");
}
