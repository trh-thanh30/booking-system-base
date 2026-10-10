import type { ColumnDef } from "@tanstack/react-table";
import { Check, LogIn } from "lucide-react";
import type { BusinessContext } from "@repo/shared";
import { Badge } from "@repo/ui";
import {
  AdminTableActionItem,
  AdminTableActions,
} from "@/src/components/common/admin/admin-table-actions";

type BusinessColumnsOptions = {
  activeBusinessId: string | null;
  onSelectBusiness: (businessId: string) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getBusinessColumns({
  activeBusinessId,
  onSelectBusiness,
}: BusinessColumnsOptions): ColumnDef<BusinessContext, unknown>[] {
  return [
    {
      accessorFn: (business) => business.name,
      id: "name",
      header: "Business",
      cell: ({ row }) => (
        <div className="flex min-w-56 items-center gap-2">
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.slug}
            </div>
          </div>
          {row.original.is_default ? (
            <Badge variant="secondary">Default</Badge>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "ACTIVE" ? "default" : "secondary"}
        >
          {row.original.status}
        </Badge>
      ),
    },
    { accessorKey: "timezone", header: "Timezone" },
    { accessorKey: "locale", header: "Locale" },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const active = row.original.id === activeBusinessId;
        return (
          <AdminTableActions label={`Open actions for ${row.original.name}`}>
            <AdminTableActionItem
              disabled={active}
              onSelect={() => onSelectBusiness(row.original.id)}
            >
              {active ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                <LogIn aria-hidden="true" className="size-4" />
              )}
              {active ? "Current business" : "Switch to business"}
            </AdminTableActionItem>
          </AdminTableActions>
        );
      },
    },
  ];
}
