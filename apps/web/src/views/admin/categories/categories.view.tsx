"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Layers3, Plus, Search, ShieldX } from "lucide-react";
import { useToast } from "@repo/hooks";
import { PERMISSIONS, type CategorySummary } from "@repo/shared";
import {
  Button,
  ConfirmDialog,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@repo/ui";
import { useAuth } from "@/src/app/providers/admin/auth-provider";
import { useAdminUiStore } from "@/src/app/stores/admin/ui.store";
import {
  AdminPage,
  AdminPageHeader,
  AdminStatsGrid,
} from "@/src/components/common/admin/admin-page";
import { AdminFilterToolbar } from "@/src/components/common/admin/admin-filter-toolbar";
import { AdminDataTable } from "@/src/components/common/admin/admin-data-table";
import { AdminStatsCard } from "@/src/components/common/admin/admin-stats-card";
import { AdminTableContainer } from "@/src/components/common/admin/admin-table-container";
import { StatePanel } from "@/src/components/common/state-panel";
import { Link } from "@/src/i18n/navigation";
import { categoriesService } from "@/src/services/admin/categories.service";
import { getCategoryColumns } from "./columns/categories.columns";
import { categoryErrorMessage } from "./utils/category-error.utils";

type StatusFilter = "CURRENT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";

export function CategoriesView() {
  const t = useTranslations("CategoryManagement");
  const { toast } = useToast();
  const { can } = useAuth();
  const activeBusinessId = useAdminUiStore((state) => state.activeBusinessId);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("CURRENT");
  const [archiveCategory, setArchiveCategory] =
    useState<CategorySummary | null>(null);

  const canRead = can(PERMISSIONS.CATEGORY.READ);
  const canCreate = can(PERMISSIONS.CATEGORY.CREATE);
  const canUpdate = can(PERMISSIONS.CATEGORY.UPDATE);
  const canDelete = can(PERMISSIONS.CATEGORY.DELETE);
  const queryKey = ["categories", activeBusinessId];
  const categoriesQuery = useQuery({
    enabled: canRead && Boolean(activeBusinessId),
    queryFn: categoriesService.listCategories,
    queryKey,
  });
  const categories = useMemo(
    () => categoriesQuery.data?.data ?? [],
    [categoriesQuery.data?.data],
  );
  const currentCategories = useMemo(
    () => categories.filter((category) => category.status !== "ARCHIVED"),
    [categories],
  );
  const visibleCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const filtered = categories.filter((category) => {
      const matchesStatus =
        status === "CURRENT"
          ? category.status !== "ARCHIVED"
          : category.status === status;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        category.name.toLocaleLowerCase().includes(normalizedSearch) ||
        category.slug.toLocaleLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
    const roots = filtered.filter((category) => category.parent_id === null);
    const ordered = roots.flatMap((root) => [
      root,
      ...filtered.filter((category) => category.parent_id === root.id),
    ]);
    const orderedIds = new Set(ordered.map((category) => category.id));
    return [
      ...ordered,
      ...filtered.filter((category) => !orderedIds.has(category.id)),
    ];
  }, [categories, search, status]);

  const refresh = () => queryClient.invalidateQueries({ queryKey });
  const archiveMutation = useMutation({
    mutationFn: categoriesService.archiveCategory,
    onSuccess: () => {
      setArchiveCategory(null);
      void refresh();
      toast.success(t("toasts.archived"));
    },
    onError: (error) => toast.error(categoryErrorMessage(error, t)),
  });
  const reorderMutation = useMutation({
    mutationFn: categoriesService.reorderCategories,
    onSuccess: () => {
      void refresh();
      toast.success(t("toasts.reordered"));
    },
    onError: (error) => toast.error(categoryErrorMessage(error, t)),
  });

  function moveCategory(categoryId: string, direction: -1 | 1) {
    const category = currentCategories.find(
      (category) => category.id === categoryId,
    );
    if (!category) return;
    const siblings = currentCategories.filter(
      (candidate) => candidate.parent_id === category.parent_id,
    );
    const currentIndex = siblings.findIndex(
      (candidate) => candidate.id === categoryId,
    );
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= siblings.length)
      return;
    const orderedIds = siblings.map((candidate) => candidate.id);
    [orderedIds[currentIndex], orderedIds[targetIndex]] = [
      orderedIds[targetIndex]!,
      orderedIds[currentIndex]!,
    ];
    reorderMutation.mutate(orderedIds);
  }

  if (!canRead) {
    return (
      <StatePanel
        description={t("permission.description")}
        icon={ShieldX}
        title={t("permission.title")}
      />
    );
  }

  const activeCount = categories.filter(
    (category) => category.status === "ACTIVE",
  ).length;
  const assignedServices = currentCategories.reduce(
    (total, category) => total + category.service_count,
    0,
  );
  const canReorder =
    canUpdate && status === "CURRENT" && search.trim().length === 0;
  const columns = getCategoryColumns({
    canArchive: canDelete,
    canEdit: canUpdate,
    canReorder,
    categories: currentCategories,
    isReordering: reorderMutation.isPending,
    onArchive: setArchiveCategory,
    onMove: moveCategory,
    t,
  });

  return (
    <AdminPage>
      <AdminPageHeader
        actions={
          canCreate ? (
            <Button asChild>
              <Link href="/admin/categories/new">
                <Plus aria-hidden="true" className="size-4" />
                {t("actions.new")}
              </Link>
            </Button>
          ) : undefined
        }
        description={t("description")}
        eyebrow={t("eyebrow")}
        title={t("title")}
      />

      <AdminStatsGrid className="xl:grid-cols-3">
        <AdminStatsCard
          description={t("stats.totalDescription")}
          icon={Layers3}
          title={t("stats.total")}
          value={String(currentCategories.length)}
        />
        <AdminStatsCard
          description={t("stats.activeDescription")}
          icon={FolderOpen}
          title={t("stats.active")}
          trend={`${activeCount}/${currentCategories.length}`}
          value={String(activeCount)}
        />
        <AdminStatsCard
          description={t("stats.servicesDescription")}
          icon={Layers3}
          title={t("stats.services")}
          value={String(assignedServices)}
        />
      </AdminStatsGrid>

      <AdminFilterToolbar>
        <div className="relative w-full lg:max-w-sm">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label={t("filters.search")}
            className="pl-9"
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("filters.searchPlaceholder")}
            value={search}
          />
        </div>
        <Select
          onValueChange={(value: StatusFilter) => setStatus(value)}
          value={status}
        >
          <SelectTrigger
            aria-label={t("filters.status")}
            className="w-full lg:w-52"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CURRENT">{t("filters.current")}</SelectItem>
            <SelectItem value="ACTIVE">{t("status.active")}</SelectItem>
            <SelectItem value="INACTIVE">{t("status.inactive")}</SelectItem>
            <SelectItem value="ARCHIVED">{t("status.archived")}</SelectItem>
          </SelectContent>
        </Select>
      </AdminFilterToolbar>

      {categoriesQuery.isLoading ? (
        <AdminTableContainer>
          <div className="space-y-3 p-6">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton className="h-12 w-full" key={index} />
            ))}
          </div>
        </AdminTableContainer>
      ) : categoriesQuery.isError ? (
        <StatePanel
          action={
            <Button
              onClick={() => void categoriesQuery.refetch()}
              variant="outline"
            >
              {t("actions.retry")}
            </Button>
          }
          description={t("states.errorDescription")}
          icon={FolderOpen}
          title={t("states.errorTitle")}
        />
      ) : visibleCategories.length === 0 ? (
        <StatePanel
          action={
            canCreate && categories.length === 0 ? (
              <Button asChild>
                <Link href="/admin/categories/new">
                  <Plus aria-hidden="true" className="size-4" />
                  {t("actions.new")}
                </Link>
              </Button>
            ) : undefined
          }
          description={t("states.emptyDescription")}
          icon={FolderOpen}
          title={t("states.emptyTitle")}
        />
      ) : (
        <AdminDataTable
          ariaLabel={t("table.label")}
          columns={columns}
          data={visibleCategories}
          getRowId={(category) => category.id}
        />
      )}

      <ConfirmDialog
        cancelLabel={t("actions.cancel")}
        confirmDisabled={archiveMutation.isPending}
        confirmLabel={
          archiveMutation.isPending
            ? t("actions.archiving")
            : t("actions.archive")
        }
        description={t("archive.description", {
          name: archiveCategory?.name ?? "",
        })}
        onConfirm={() => {
          if (archiveCategory) archiveMutation.mutate(archiveCategory.id);
        }}
        onOpenChange={(open) => {
          if (!open) setArchiveCategory(null);
        }}
        open={Boolean(archiveCategory)}
        title={t("archive.title")}
      />
    </AdminPage>
  );
}
