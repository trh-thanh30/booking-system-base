import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  CornerDownRight,
  FolderOpen,
  Pencil,
} from "lucide-react";
import type { CategorySummary } from "@repo/shared";
import { Badge, Button } from "@repo/ui";
import {
  AdminTableActionItem,
  AdminTableActions,
} from "@/src/components/common/admin/admin-table-actions";
import { Link } from "@/src/i18n/navigation";

type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

type CategoryColumnsOptions = {
  canArchive: boolean;
  canEdit: boolean;
  canReorder: boolean;
  categories: CategorySummary[];
  isReordering: boolean;
  onArchive: (category: CategorySummary) => void;
  onMove: (categoryId: string, direction: -1 | 1) => void;
  t: Translate;
};

function statusVariant(status: CategorySummary["status"]) {
  if (status === "ACTIVE") return "success" as const;
  if (status === "INACTIVE") return "warning" as const;
  return "destructive" as const;
}

export function getCategoryColumns({
  canArchive,
  canEdit,
  canReorder,
  categories,
  isReordering,
  onArchive,
  onMove,
  t,
}: CategoryColumnsOptions): ColumnDef<CategorySummary, unknown>[] {
  return [
    {
      accessorFn: (category) => category.name,
      id: "name",
      header: t("table.name"),
      enableSorting: false,
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div
            className={
              category.parent_id
                ? "flex min-w-72 items-center gap-3 pl-6"
                : "flex min-w-72 items-center gap-3"
            }
          >
            {category.parent_id ? (
              <CornerDownRight
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
              />
            ) : null}
            <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
              {category.assets[0] ? (
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="40px"
                  src={category.assets[0].url}
                  unoptimized
                />
              ) : (
                <FolderOpen
                  aria-hidden="true"
                  className="absolute inset-0 m-auto size-4 text-muted-foreground"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{category.name}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {category.parent
                  ? t("table.childOf", { parent: category.parent.name })
                  : t("table.children", { count: category.children_count })}
                {" · /"}
                {category.slug}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("table.status"),
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={statusVariant(row.original.status)}>
          {t(`status.${row.original.status.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      accessorKey: "service_count",
      header: t("table.services"),
      enableSorting: false,
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.service_count}</span>
      ),
    },
    {
      id: "order",
      header: t("table.order"),
      enableSorting: false,
      cell: ({ row }) => {
        const category = row.original;
        if (category.status === "ARCHIVED") {
          return <span className="text-muted-foreground">—</span>;
        }
        const siblings = categories.filter(
          (candidate) => candidate.parent_id === category.parent_id,
        );
        const index = siblings.findIndex(
          (candidate) => candidate.id === category.id,
        );

        return (
          <div className="flex gap-1">
            <Button
              aria-label={t("actions.moveUp", { name: category.name })}
              className="size-11"
              disabled={!canReorder || index === 0 || isReordering}
              onClick={() => onMove(category.id, -1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ArrowUp aria-hidden="true" className="size-4" />
            </Button>
            <Button
              aria-label={t("actions.moveDown", { name: category.name })}
              className="size-11"
              disabled={
                !canReorder || index === siblings.length - 1 || isReordering
              }
              onClick={() => onMove(category.id, 1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ArrowDown aria-hidden="true" className="size-4" />
            </Button>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t("table.actions")}</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const category = row.original;
        const editable = canEdit && category.status !== "ARCHIVED";
        const archivable = canArchive && category.status !== "ARCHIVED";
        if (!editable && !archivable) {
          return (
            <span className="block text-right text-muted-foreground">—</span>
          );
        }

        return (
          <AdminTableActions
            label={t("table.openActions", { name: category.name })}
          >
            {editable ? (
              <AdminTableActionItem asChild>
                <Link href={`/admin/categories/${category.id}/edit`}>
                  <Pencil aria-hidden="true" className="size-4" />
                  {t("actions.editNamed", { name: category.name })}
                </Link>
              </AdminTableActionItem>
            ) : null}
            {archivable ? (
              <AdminTableActionItem
                className="text-destructive focus:text-destructive"
                onSelect={() => onArchive(category)}
              >
                <Archive aria-hidden="true" className="size-4" />
                {t("actions.archiveNamed", { name: category.name })}
              </AdminTableActionItem>
            ) : null}
          </AdminTableActions>
        );
      },
    },
  ];
}
