"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import { MAX_CATEGORY_ASSETS } from "@repo/shared";
import { Badge, Button } from "@repo/ui";
import type { CategoryAssetDraft } from "../types/category-form.types";

const MAX_CATEGORY_ASSET_BYTES = 10 * 1024 * 1024;

type CategoryAssetsFieldProps = {
  assets: CategoryAssetDraft[];
  disabled?: boolean;
  onChange: (assets: CategoryAssetDraft[]) => void;
};

export function CategoryAssetsField({
  assets,
  disabled = false,
  onChange,
}: CategoryAssetsFieldProps) {
  const t = useTranslations("CategoryManagement.form.assets");
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrls = useRef(new Set<string>());
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      for (const url of objectUrls.current) URL.revokeObjectURL(url);
      objectUrls.current.clear();
    },
    [],
  );

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    const selected = Array.from(files);
    if (assets.length + selected.length > MAX_CATEGORY_ASSETS) {
      setError(t("tooMany", { count: MAX_CATEGORY_ASSETS }));
      return;
    }
    if (selected.some((file) => !file.type.startsWith("image/"))) {
      setError(t("imageOnly"));
      return;
    }
    if (selected.some((file) => file.size > MAX_CATEGORY_ASSET_BYTES)) {
      setError(t("tooLarge"));
      return;
    }

    const drafts = selected.map<CategoryAssetDraft>((file) => {
      const previewUrl = URL.createObjectURL(file);
      objectUrls.current.add(previewUrl);
      return {
        file,
        key: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        name: file.name,
        previewUrl,
      };
    });
    onChange([...assets, ...drafts]);
  }

  function removeAsset(index: number) {
    const asset = assets[index];
    if (asset?.file) {
      URL.revokeObjectURL(asset.previewUrl);
      objectUrls.current.delete(asset.previewUrl);
    }
    onChange(assets.filter((_, candidateIndex) => candidateIndex !== index));
  }

  function moveAsset(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= assets.length) return;
    const next = [...assets];
    [next[index], next[targetIndex]] = [next[targetIndex]!, next[index]!];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{t("label")}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t("hint", { count: MAX_CATEGORY_ASSETS })}
          </p>
        </div>
        <input
          accept="image/*"
          className="sr-only"
          disabled={disabled || assets.length >= MAX_CATEGORY_ASSETS}
          id="category-assets"
          multiple
          onChange={(event) => {
            addFiles(event.currentTarget.files);
            event.currentTarget.value = "";
          }}
          ref={inputRef}
          type="file"
        />
        <Button
          className="min-h-11 shrink-0"
          disabled={disabled || assets.length >= MAX_CATEGORY_ASSETS}
          onClick={() => inputRef.current?.click()}
          type="button"
          variant="outline"
        >
          <ImagePlus aria-hidden="true" className="size-4" />
          {t("upload")}
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {assets.length === 0 ? (
        <button
          className="flex min-h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-4 text-center transition-colors duration-normal hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <ImagePlus
            aria-hidden="true"
            className="mb-2 size-6 text-muted-foreground"
          />
          <span className="text-sm font-medium text-foreground">
            {t("emptyTitle")}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            {t("emptyDescription")}
          </span>
        </button>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset, index) => (
            <li
              className="overflow-hidden rounded-lg border border-border bg-background"
              key={asset.key}
            >
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  alt={asset.name}
                  className="object-cover"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                  src={asset.previewUrl}
                  unoptimized
                />
                {index === 0 ? (
                  <Badge className="absolute left-2 top-2" variant="secondary">
                    {t("cover")}
                  </Badge>
                ) : null}
              </div>
              <div className="flex items-center gap-1 p-2">
                <p className="min-w-0 flex-1 truncate px-1 text-xs text-muted-foreground">
                  {asset.name}
                </p>
                <Button
                  aria-label={t("moveLeft", { name: asset.name })}
                  className="size-11"
                  disabled={disabled || index === 0}
                  onClick={() => moveAsset(index, -1)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                </Button>
                <Button
                  aria-label={t("moveRight", { name: asset.name })}
                  className="size-11"
                  disabled={disabled || index === assets.length - 1}
                  onClick={() => moveAsset(index, 1)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Button>
                <Button
                  aria-label={t("remove", { name: asset.name })}
                  className="size-11"
                  disabled={disabled}
                  onClick={() => removeAsset(index)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
