import type { ColumnDef } from "@tanstack/react-table";
import { KeyRound, UserRoundPen } from "lucide-react";
import type { UserSummary } from "@repo/shared";
import { Avatar, AvatarFallback, Badge } from "@repo/ui";
import {
  AdminTableActionItem,
  AdminTableActions,
} from "@/src/components/common/admin/admin-table-actions";

function getInitials(user: UserSummary) {
  const name = user.full_name ?? user.username;
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || user.email.slice(0, 2).toUpperCase()
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getUserColumns(): ColumnDef<UserSummary, unknown>[] {
  return [
    {
      accessorFn: (user) => user.full_name ?? user.username,
      id: "user",
      header: "User",
      cell: ({ row }) => (
        <div className="flex min-w-56 items-center gap-3">
          <Avatar>
            <AvatarFallback>{getInitials(row.original)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">
              {row.original.full_name ?? row.original.username}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        </div>
      ),
    },
    { accessorKey: "role", header: "Role" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "ACTIVE" ? "success" : "warning"}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <AdminTableActions label={`Open actions for ${row.original.email}`}>
          <AdminTableActionItem disabled>
            <UserRoundPen aria-hidden="true" className="size-4" />
            Edit profile
          </AdminTableActionItem>
          <AdminTableActionItem disabled>
            <KeyRound aria-hidden="true" className="size-4" />
            Manage permissions
          </AdminTableActionItem>
        </AdminTableActions>
      ),
    },
  ];
}
